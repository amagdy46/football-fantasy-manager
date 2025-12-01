import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/modules/common/middleware/auth";
import { TeamStatus } from "../team/types";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

interface TeamStatusUpdate {
  type: "team-status-update";
  data: {
    isReady: boolean;
    teamId?: string;
  };
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
    });

    this.setupConnectionHandlers();
    this.startHeartbeat();
  }

  private setupConnectionHandlers() {
    this.wss.on("connection", (ws: AuthenticatedWebSocket, req) => {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const token =
        url.searchParams.get("token") ||
        req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        ws.close(1008, "Authentication required");
        return;
      }

      try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret) as {
          userId: string;
          email: string;
        };

        ws.userId = decoded.userId;
        ws.isAlive = true;
        this.clients.set(decoded.userId, ws);

        console.log(`WebSocket client connected: ${decoded.userId}`);

        ws.on("pong", () => {
          ws.isAlive = true;
        });

        ws.on("close", () => {
          if (ws.userId) {
            this.clients.delete(ws.userId);
            console.log(`WebSocket client disconnected: ${ws.userId}`);
          }
        });

        ws.on("error", (error) => {
          console.error(`WebSocket error for user ${ws.userId}:`, error);
        });

        // Send initial connection confirmation
        ws.send(JSON.stringify({ type: "connected", userId: decoded.userId }));
      } catch (error) {
        console.error("WebSocket authentication failed:", error);
        ws.close(1008, "Invalid or expired token");
      }
    });
  }

  private startHeartbeat() {
    const interval = setInterval(() => {
      this.clients.forEach((ws, userId) => {
        if (!ws.isAlive) {
          ws.terminate();
          this.clients.delete(userId);
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds

    this.wss.on("close", () => {
      clearInterval(interval);
    });
  }

  sendTeamStatusUpdate(userId: string, status: TeamStatus) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      const message: TeamStatusUpdate = {
        type: "team-status-update",
        data: status,
      };
      client.send(JSON.stringify(message));
      console.log(`Sent team status update to user ${userId}:`, status);
    }
  }

  broadcast(message: object) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  getConnectedClients(): number {
    return this.clients.size;
  }
}

let websocketService: WebSocketService | null = null;

export const initializeWebSocket = (server: Server): WebSocketService => {
  if (!websocketService) {
    websocketService = new WebSocketService(server);
  }
  return websocketService;
};

export const getWebSocketService = (): WebSocketService => {
  if (!websocketService) {
    throw new Error("WebSocket service not initialized");
  }
  return websocketService;
};
