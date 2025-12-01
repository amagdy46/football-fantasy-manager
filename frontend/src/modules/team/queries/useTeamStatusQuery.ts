import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTeamStatus } from "../../../lib/api";

export const TEAM_STATUS_QUERY_KEY = ["teamStatus"] as const;

export const useTeamStatusQuery = () => {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: TEAM_STATUS_QUERY_KEY,
    queryFn: getTeamStatus,
    retry: 3,
    retryDelay: 1000,
    staleTime: 0,
  });

  useEffect(() => {
    if (query.data?.isReady) {
      navigate("/dashboard");
    }
  }, [query.data?.isReady, navigate]);

  return query;
};
