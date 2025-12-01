import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import { getWebSocketService } from "@/lib/websocket";

export const useWebSocket = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAuth();
  const wsServiceRef = useRef<ReturnType<typeof getWebSocketService> | null>(
    null
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      const wsService = getWebSocketService();
      wsServiceRef.current = wsService;
      wsService.connect(token, queryClient);

      return () => {
        wsService.disconnect();
      };
    } else {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
    }
  }, [isAuthenticated, token, queryClient]);

  return {
    isConnected: wsServiceRef.current?.isConnected() ?? false,
  };
};
