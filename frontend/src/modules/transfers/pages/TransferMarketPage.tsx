import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";

import { useTeamQuery } from "@/modules/team/queries";
import { useUnlistPlayerMutation } from "@/modules/team/mutations";
import { TransferFilters as FilterType, TransferPlayer } from "../types";
import { useTransfersQuery } from "../queries";
import { useBuyPlayerMutation } from "../mutations";
import {
  BuyConfirmationModal,
  TransferFilters,
  TransferMarketHeader,
  TransferPlayerGrid,
} from "../components";

export const TransferMarketPage = () => {
  const [filters, setFilters] = useState<FilterType>({});
  const [debouncedFilters] = useDebounceValue(filters, 300);

  const { data: team } = useTeamQuery();
  const { data: players, isLoading } = useTransfersQuery(debouncedFilters);
  const buyMutation = useBuyPlayerMutation();
  const unlistMutation = useUnlistPlayerMutation();

  const [selectedPlayer, setSelectedPlayer] = useState<TransferPlayer | null>(
    null
  );
  const [unlistingPlayerId, setUnlistingPlayerId] = useState<string | null>(
    null
  );

  const currentBudget = team ? parseFloat(team.budget) : 0;

  const handleBuyClick = (player: TransferPlayer) => {
    setSelectedPlayer(player);
  };

  const handleUnlistClick = (playerId: string) => {
    setUnlistingPlayerId(playerId);
    unlistMutation.mutate(playerId, {
      onSettled: () => setUnlistingPlayerId(null),
    });
  };

  const handleConfirmBuy = () => {
    if (selectedPlayer) {
      buyMutation.mutate(selectedPlayer, {
        onSuccess: () => {
          setSelectedPlayer(null);
        },
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-900 text-white p-4 md:p-8"
      data-testid="transfer-market-page"
    >
      <div className="max-w-7xl mx-auto">
        <TransferMarketHeader budget={currentBudget} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <TransferFilters filters={filters} onFilterChange={setFilters} />
          </div>

          <div className="lg:col-span-3">
            <TransferPlayerGrid
              players={players}
              isLoading={isLoading}
              currentBudget={currentBudget}
              currentTeamId={team?.id}
              currentTeamSize={team?.players?.length || 0}
              onBuyClick={handleBuyClick}
              onUnlistClick={handleUnlistClick}
              unlistingPlayerId={unlistingPlayerId ?? undefined}
            />
          </div>
        </div>
      </div>

      {selectedPlayer && (
        <BuyConfirmationModal
          player={selectedPlayer}
          currentBudget={currentBudget}
          isPending={buyMutation.isPending}
          isError={buyMutation.isError}
          onConfirm={handleConfirmBuy}
          onCancel={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};
