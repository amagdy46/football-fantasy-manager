import { useQuery } from "@tanstack/react-query";
import { getTeam } from "../../../lib/api";

export const TEAM_QUERY_KEY = ["team"] as const;

export const useTeamQuery = () => {
  return useQuery({
    queryKey: TEAM_QUERY_KEY,
    queryFn: getTeam,
  });
};
