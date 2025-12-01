import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTeamStatus } from "../../../lib/api";

export const TEAM_STATUS_QUERY_KEY = ["teamStatus"] as const;

const POLL_INTERVAL = 2000;

export const useTeamStatusQuery = (options?: { polling?: boolean }) => {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: TEAM_STATUS_QUERY_KEY,
    queryFn: getTeamStatus,
    retry: 3,
    retryDelay: 1000,
    refetchInterval: options?.polling
      ? (query) => (query.state.data?.isReady ? false : POLL_INTERVAL)
      : false,
  });

  useEffect(() => {
    if (options?.polling && query.data?.isReady) {
      navigate("/dashboard");
    }
  }, [options?.polling, query.data?.isReady, navigate]);

  return query;
};
