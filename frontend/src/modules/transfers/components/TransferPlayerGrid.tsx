import { Loader2 } from "lucide-react";
import { TransferPlayer } from "../types";
import { TransferPlayerCard } from "./TransferPlayerCard";

interface TransferPlayerGridProps {
  players: TransferPlayer[] | undefined;
  isLoading: boolean;
  currentBudget: number;
  currentTeamId: string | undefined;
  currentTeamSize: number;
  onBuyClick: (player: TransferPlayer) => void;
  onUnlistClick: (playerId: string) => void;
  unlistingPlayerId?: string;
}

export const TransferPlayerGrid = ({
  players,
  isLoading,
  currentBudget,
  currentTeamId,
  currentTeamSize,
  onBuyClick,
  onUnlistClick,
  unlistingPlayerId,
}: TransferPlayerGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-green-500" size={48} />
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="text-center text-slate-400 py-12 bg-slate-800/50 rounded-lg border border-slate-800">
        No players found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {players.map((player) => {
        const isTeamFull = currentTeamSize >= 25;
        const transactionPrice = parseFloat(player.askingPrice || "0") * 0.95;
        const canAfford = currentBudget >= transactionPrice;
        const canBuy = canAfford && !isTeamFull;

        let disabledReason = "";
        if (isTeamFull) disabledReason = "Team Full (Max 25)";
        else if (!canAfford) disabledReason = "Insufficient Funds";

        const isOwnPlayer =
          player.isOwnPlayer ?? player.teamId === currentTeamId;

        return (
          <TransferPlayerCard
            key={player.id}
            player={player}
            onBuy={onBuyClick}
            onUnlist={onUnlistClick}
            isOwnPlayer={isOwnPlayer}
            canBuy={canBuy && !isOwnPlayer}
            disabledReason={disabledReason}
            isUnlisting={unlistingPlayerId === player.id}
          />
        );
      })}
    </div>
  );
};
