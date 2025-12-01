import { QueryClient } from "@tanstack/react-query";
import { TEAM_STATUS_QUERY_KEY } from "@/modules/team/queries/useTeamStatusQuery";
import { TeamStatusResponse } from "@/types";

interface WebSocketMessage {
  type: string;
  data?: {
    isReady: boolean;
    teamId?: string;
  };
  userId?: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private queryClient: QueryClient | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private shouldReconnect = true;
  private token: string | null = null;

  connect(token: string, queryClient: QueryClient) {
    this.token = token;
    this.queryClient = queryClient;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.establishConnection();
  }

  private establishConnection() {
    if (!this.token || !this.queryClient) {
      return;
    }

    const wsUrl = this.getWebSocketUrl();
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.ws = null;

        if (
          this.shouldReconnect &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectAttempts++;
          const delay =
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          console.log(
            `Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`
          );
          setTimeout(() => this.establishConnection(), delay);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }

  private getWebSocketUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
    // Convert HTTP URL to WebSocket URL
    // Remove /api suffix if present, then convert protocol
    let baseUrl = apiUrl.replace(/\/api$/, "");
    // Convert http:// to ws:// and https:// to wss://
    if (baseUrl.startsWith("http://")) {
      baseUrl = baseUrl.replace("http://", "ws://");
    } else if (baseUrl.startsWith("https://")) {
      baseUrl = baseUrl.replace("https://", "wss://");
    }
    const wsUrl = `${baseUrl}/ws`;

    return `${wsUrl}?token=${encodeURIComponent(this.token!)}`;
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case "team-status-update":
        if (message.data && this.queryClient) {
          const status: TeamStatusResponse = {
            isReady: message.data.isReady,
            teamId: message.data.teamId,
          };
          this.queryClient.setQueryData(TEAM_STATUS_QUERY_KEY, status);
        }
        break;
      case "connected":
        console.log("WebSocket authenticated:", message.userId);
        break;
      default:
        console.log("Unknown WebSocket message type:", message.type);
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let websocketService: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!websocketService) {
    websocketService = new WebSocketService();
  }
  return websocketService;
};
