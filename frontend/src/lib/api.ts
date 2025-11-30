import axios from "axios";
import { Team } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getTeam = async (): Promise<Team> => {
  const response = await api.get<Team>("/team");
  return response.data;
};

export const updateTeamName = async (name: string): Promise<Team> => {
  const response = await api.patch<Team>("/team", { name });
  return response.data;
};

export const getTeamStatus = async (): Promise<{
  isReady: boolean;
  teamId?: string;
}> => {
  const response = await api.get<{ isReady: boolean; teamId?: string }>(
    "/team/status"
  );
  return response.data;
};

export const toggleTransferList = async (
  playerId: string,
  askingPrice: number | null
) => {
  const response = await api.patch(`/players/${playerId}/transfer-list`, {
    askingPrice,
  });
  return response.data;
};

import { TransferFilters } from "../modules/transfers/types";

export const getTransfers = async (params: TransferFilters) => {
  const response = await api.get("/transfers", { params });
  return response.data;
};

export default api;
