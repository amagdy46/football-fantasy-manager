import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeamStatusQuery } from "../queries";

const MAX_ATTEMPTS = 30; // 60 seconds total
const POLL_INTERVAL = 2000; // 2 seconds

export const useTeamStatusPolling = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const { data, isError } = useTeamStatusQuery({
    refetchInterval: (query) => {
      // Stop polling if team is ready or max attempts reached
      const isReady = query.state.data?.isReady;
      const shouldStop = isReady || attempts >= MAX_ATTEMPTS;
      return shouldStop ? false : POLL_INTERVAL;
    },
  });

  // Track polling attempts
  useEffect(() => {
    if (data && !data.isReady) {
      setAttempts((prev) => prev + 1);
    }
  }, [data]);

  // Navigate when ready
  useEffect(() => {
    if (data?.isReady) {
      navigate("/dashboard");
    }
  }, [data, navigate]);

  // Handle timeout
  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS && !data?.isReady) {
      setError("It's taking longer than expected. The servers might be busy.");
    }
  }, [attempts, data]);

  // Handle API errors
  useEffect(() => {
    if (isError) {
      setError("Unable to connect to the scouting server. Please try again.");
    }
  }, [isError]);

  const retry = () => {
    setError(null);
    setAttempts(0);
    // Force a refetch by invalidating the query
    window.location.reload();
  };

  return { error, retry };
};
