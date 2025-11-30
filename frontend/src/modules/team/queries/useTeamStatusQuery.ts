import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getTeamStatus } from "../../../lib/api";

export const TEAM_STATUS_QUERY_KEY = ["teamStatus"] as const;

export type TeamStatusData = {
  isReady: boolean;
  teamId?: string;
};

export const useTeamStatusQuery = (
  options?: Omit<UseQueryOptions<TeamStatusData>, "queryKey" | "queryFn">
) => {
  return useQuery<TeamStatusData>({
    queryKey: TEAM_STATUS_QUERY_KEY,
    queryFn: getTeamStatus,
    retry: 3,
    retryDelay: 1000,
    ...options,
  });
};
