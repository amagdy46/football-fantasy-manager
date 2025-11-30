import { useState, useRef } from "react";
import { X, DollarSign } from "lucide-react";
import { Player } from "../types";
import { useOnClickOutside } from "usehooks-ts";

interface PlayerDetailModalProps {
  player: Player;
  onClose: () => void;
  onListForTransfer: (playerId: string, price: number) => void;
  onRemoveFromTransferList: (playerId: string) => void;
  isListing?: boolean;
  isRemoving?: boolean;
}

export const PlayerDetailModal = ({
  player,
  onClose,
  onListForTransfer,
  onRemoveFromTransferList,
  isListing,
  isRemoving,
}: PlayerDetailModalProps) => {
  const [askingPrice, setAskingPrice] = useState<string>(player.value);
  const modalRef = useRef(null);

  useOnClickOutside(modalRef, onClose);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleList = () => {
    onListForTransfer(player.id, Number(askingPrice));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow-lg
              ${player.position === "GK" ? "bg-yellow-500" : ""}
              ${player.position === "DEF" ? "bg-blue-600" : ""}
              ${player.position === "MID" ? "bg-green-600" : ""}
              ${player.position === "ATT" ? "bg-red-600" : ""}
            `}
            >
              {player.position}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{player.name}</h2>
              <div className="flex gap-3 text-slate-400 text-sm">
                <span>{player.country}</span>
                <span>•</span>
                <span>{player.age} years old</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Market Value</div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(player.value)}
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Performance</div>
              <div className="text-white font-medium">
                {player.goals} Goals / {player.assists} Assists
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            {player.isOnTransferList ? (
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/50 p-3 rounded text-yellow-200 text-sm flex items-center gap-2">
                  <DollarSign size={16} />
                  Listed for {formatCurrency(player.askingPrice || 0)}
                </div>
                <button
                  onClick={() => onRemoveFromTransferList(player.id)}
                  disabled={isRemoving}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {isRemoving ? "Removing..." : "Remove from Transfer List"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Asking Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      €
                    </span>
                    <input
                      type="number"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-8 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                      placeholder="Enter price"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Suggested price: {formatCurrency(player.value)}
                  </p>
                </div>
                <button
                  onClick={handleList}
                  disabled={isListing || !askingPrice}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {isListing ? "Listing..." : "List for Transfer"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
