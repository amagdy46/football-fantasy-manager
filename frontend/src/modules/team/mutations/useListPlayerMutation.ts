import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleTransferList } from "@/lib/api";
import { TEAM_QUERY_KEY } from "../queries/useTeamQuery";
import { TRANSFERS_QUERY_KEY } from "@/modules/transfers/queries/useTransfersQuery";

export const useListPlayerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, price }: { playerId: string; price: number }) =>
      toggleTransferList(playerId, price),
    onSuccess: () => {
      toast.success("Player listed for transfer");
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TRANSFERS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error("Failed to list player");
      console.error(error);
    },
  });
};
