import { DollarSign, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { TransferPlayer } from "../types";
import { formatCurrency, getPositionColor } from "@/lib/utils";

interface TransferPlayerCardProps {
  player: TransferPlayer;
  onBuy: (player: TransferPlayer) => void;
  onUnlist: (playerId: string) => void;
  isOwnPlayer: boolean;
  canBuy: boolean;
  disabledReason?: string;
  isUnlisting?: boolean;
}

export const TransferPlayerCard = ({
  player,
  onBuy,
  onUnlist,
  isOwnPlayer,
  canBuy,
  disabledReason,
  isUnlisting,
}: TransferPlayerCardProps) => {
  return (
    <div
      className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-md hover:shadow-xl transition-shadow relative"
      data-testid="transfer-player-card"
    >
      <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full z-10">
        Price: {formatCurrency(player.askingPrice || 0)}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span
            className={`${getPositionColor(
              player.position
            )} text-xs font-bold px-2 py-0.5 rounded text-white`}
          >
            {player.position}
          </span>
          <span className="text-slate-400 text-xs">{player.country}</span>
        </div>

        <h3
          className="text-xl font-bold text-white mb-1 truncate"
          title={player.name}
        >
          {player.name}
        </h3>
        <p className="text-sm text-slate-400 mb-2">
          Seller: <span className="text-slate-300">{player.teamName}</span>
        </p>

        <div className="text-sm text-slate-400 mb-4">Age: {player.age}</div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="bg-slate-700 p-2 rounded">
            <div className="text-slate-400 text-xs">Market Value</div>
            <div className="text-white font-semibold">
              {formatCurrency(player.value)}
            </div>
          </div>
          <div className="bg-slate-700 p-2 rounded">
            <div className="text-slate-400 text-xs">Stats</div>
            <div className="text-white font-semibold">
              {player.goals}G / {player.assists}A
            </div>
          </div>
        </div>

        {isOwnPlayer ? (
          <button
            onClick={() => onUnlist(player.id)}
            disabled={isUnlisting}
            className="w-full py-2 bg-red-900/50 hover:bg-red-900 disabled:opacity-50 text-red-200 border border-red-800 rounded transition-colors flex items-center justify-center gap-2"
            data-testid="unlist-player-btn"
          >
            {isUnlisting ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                <Trash2 size={16} /> Remove from Market
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => onBuy(player)}
            disabled={!canBuy}
            className={`w-full py-2 rounded transition-colors flex items-center justify-center gap-2 ${
              canBuy
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
            data-testid="buy-player-btn"
          >
            {canBuy ? (
              <>
                <ShoppingCart size={16} /> Buy Player
              </>
            ) : (
              <>
                <DollarSign size={16} /> {disabledReason || "Unavailable"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
