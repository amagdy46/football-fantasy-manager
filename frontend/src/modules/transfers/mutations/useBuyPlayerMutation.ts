import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buyPlayer } from "@/lib/api";
import { TransferPlayer } from "../types";
import { TRANSFERS_QUERY_KEY } from "../queries/useTransfersQuery";
import { TEAM_QUERY_KEY } from "@/modules/team/queries/useTeamQuery";

export const useBuyPlayerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (player: TransferPlayer) => buyPlayer(player.id),
    onSuccess: () => {
      toast.success("Player purchased successfully!");
      queryClient.invalidateQueries({ queryKey: TRANSFERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
    },
    onError: () => {
      toast.error("Failed to complete purchase");
    },
  });
};
