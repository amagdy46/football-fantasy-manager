import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TransferPlayer } from "../types";
import { TRANSFERS_QUERY_KEY } from "../queries/useTransfersQuery";
import { TEAM_QUERY_KEY } from "@/modules/team/queries/useTeamQuery";

export const useBuyPlayerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (player: TransferPlayer) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // In a real implementation, we would call the API here
      // await buyPlayer(player.id);

      return player;
    },
    onSuccess: () => {
      // Refresh transfer market list
      queryClient.invalidateQueries({ queryKey: TRANSFERS_QUERY_KEY });
      // Refresh user's team data (budget, new player)
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
    },
  });
};
