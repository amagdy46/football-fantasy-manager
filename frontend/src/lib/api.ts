import axios from "axios";
import { Team, TeamStatusResponse } from "@/types";
import { TransferFilters } from "@/modules/transfers/types";

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const defaultUrl = "http://localhost:3001/api";
  const baseURL = envUrl || defaultUrl;

  if (baseURL.startsWith("http") && !baseURL.endsWith("/api")) {
    return baseURL.endsWith("/") ? `${baseURL}api` : `${baseURL}/api`;
  }

  return baseURL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export const getTeam = async (): Promise<Team> => {
  const response = await api.get<Team>("/team");
  return response.data;
};

export const updateTeamName = async (name: string): Promise<Team> => {
  const response = await api.patch<Team>("/team", { name });
  return response.data;
};

export const getTeamStatus = async (): Promise<TeamStatusResponse> => {
  const response = await api.get<TeamStatusResponse>("/team/status");
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

export const getTransfers = async (params: TransferFilters) => {
  const response = await api.get("/transfers", { params });
  return response.data;
};

export const buyPlayer = async (playerId: string) => {
  const response = await api.post(`/transfers/buy/${playerId}`);
  return response.data;
};

export default api;
