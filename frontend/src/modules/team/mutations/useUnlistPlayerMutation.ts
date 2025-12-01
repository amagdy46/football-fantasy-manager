import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleTransferList } from "@/lib/api";
import { TEAM_QUERY_KEY } from "../queries/useTeamQuery";
import { TRANSFERS_QUERY_KEY } from "@/modules/transfers/queries/useTransfersQuery";

export const useUnlistPlayerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: string) => toggleTransferList(playerId, null),
    onSuccess: () => {
      toast.success("Player removed from transfer list");
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TRANSFERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error("Failed to remove player");
      console.error(error);
    },
  });
};
