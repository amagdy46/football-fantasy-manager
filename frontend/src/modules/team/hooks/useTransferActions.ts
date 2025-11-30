import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleTransferList } from "../../../lib/api";
import { TEAM_QUERY_KEY } from "../queries/useTeamQuery";

export const useTransferActions = () => {
  const queryClient = useQueryClient();

  const { mutate: listForTransfer, isPending: isListing } = useMutation({
    mutationFn: ({ playerId, price }: { playerId: string; price: number }) =>
      toggleTransferList(playerId, price),
    onSuccess: () => {
      toast.success("Player listed for transfer");
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
    },
    onError: (error) => {
      toast.error("Failed to list player");
      console.error(error);
    },
  });

  const { mutate: removeFromList, isPending: isRemoving } = useMutation({
    mutationFn: (playerId: string) => toggleTransferList(playerId, null),
    onSuccess: () => {
      toast.success("Player removed from transfer list");
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY });
    },
    onError: (error) => {
      toast.error("Failed to remove player");
      console.error(error);
    },
  });

  return {
    handleListForTransfer: (playerId: string, price: number) =>
      listForTransfer({ playerId, price }),
    handleRemoveFromTransferList: (playerId: string) =>
      removeFromList(playerId),
    isListing,
    isRemoving,
  };
};
