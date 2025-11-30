import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeamName } from "../../../lib/api";
import { TEAM_QUERY_KEY } from "../queries/useTeamQuery";

export const useUpdateTeamNameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newName: string) => updateTeamName(newName),
    onSuccess: () => {
      // Invalidate and refetch team data
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
    },
  });
};
