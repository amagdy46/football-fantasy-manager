import { useState } from "react";
import { Player } from "../types";
import { DollarSign, Trash2, Loader2 } from "lucide-react";
import { useTransferActions } from "../hooks/useTransferActions";

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard = ({ player }: PlayerCardProps) => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [askingPrice, setAskingPrice] = useState<string | number>(player.value);
  const {
    handleListForTransfer,
    handleRemoveFromTransferList,
    isListing,
    isRemoving,
  } = useTransferActions();

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getPositionColor = (pos: string) => {
    switch (pos) {
      case "GK":
        return "bg-yellow-600";
      case "DEF":
        return "bg-blue-600";
      case "MID":
        return "bg-green-600";
      case "ATT":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const handleSubmitTransfer = () => {
    const price =
      typeof askingPrice === "string" ? parseFloat(askingPrice) : askingPrice;
    handleListForTransfer(player.id, price);
    setShowTransferModal(false);
  };

  return (
    <>
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-md hover:shadow-xl transition-shadow relative">
        {player.isOnTransferList && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full z-10">
            For Sale: {formatCurrency(player.askingPrice || 0)}
          </div>
        )}

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

          <div className="text-sm text-slate-400 mb-4">Age: {player.age}</div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div className="bg-slate-700 p-2 rounded">
              <div className="text-slate-400 text-xs">Value</div>
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

          {player.isOnTransferList ? (
            <button
              onClick={() => handleRemoveFromTransferList(player.id)}
              disabled={isRemoving}
              className="w-full py-2 bg-red-900/50 hover:bg-red-900 disabled:opacity-50 text-red-200 border border-red-800 rounded transition-colors flex items-center justify-center gap-2"
            >
              {isRemoving ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <Trash2 size={16} /> Remove Listing
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowTransferModal(true)}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign size={16} /> List for Transfer
            </button>
          )}
        </div>
      </div>

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">
              List {player.name} for Transfer
            </h3>

            <div className="mb-4">
              <label
                htmlFor="asking-price"
                className="block text-slate-400 text-sm mb-2"
              >
                Asking Price
              </label>
              <input
                id="asking-price"
                type="number"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded p-2 focus:outline-none focus:border-green-500"
              />
              <p className="text-slate-500 text-xs mt-1">
                Market Value: {formatCurrency(player.value)}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitTransfer}
                disabled={isListing}
                className="px-4 py-2 bg-green-600 disabled:opacity-50 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                {isListing ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Confirm Listing"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
