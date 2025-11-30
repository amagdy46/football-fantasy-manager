import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useDebounce } from "@/modules/common/hooks";
import { useTeamQuery } from "@/modules/team/queries";
import { TransferFilters as FilterType, TransferPlayer } from "../types";
import { useTransfersQuery } from "../queries";
import { useBuyPlayerMutation } from "../mutations";
import { TransferFilters, TransferPlayerCard } from "../components";

export const TransferMarketPage = () => {
  const [filters, setFilters] = useState<FilterType>({});
  const debouncedFilters = useDebounce(filters, 300);

  const { data: team } = useTeamQuery();
  const { data: players, isLoading } = useTransfersQuery(debouncedFilters);
  const buyMutation = useBuyPlayerMutation();

  const [selectedPlayer, setSelectedPlayer] = useState<TransferPlayer | null>(
    null
  );

  const currentBudget = team ? parseFloat(team.budget) : 0;
  const teamId = team?.id;

  const handleBuyClick = (player: TransferPlayer) => {
    setSelectedPlayer(player);
  };

  const handleConfirmBuy = () => {
    if (selectedPlayer) {
      buyMutation.mutate(selectedPlayer, {
        onSuccess: () => {
          setSelectedPlayer(null);
          // Ideally show a toast notification here
        },
      });
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/dashboard"
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Transfer Market</h1>
          <div className="ml-auto bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <span className="text-slate-400 text-sm mr-2">Budget:</span>
            <span className="text-green-500 font-bold text-xl">
              {formatCurrency(currentBudget)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <TransferFilters filters={filters} onFilterChange={setFilters} />
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-green-500" size={48} />
              </div>
            ) : players && players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {players.map((player) => {
                  const isTeamFull = (team?.players?.length || 0) >= 25;
                  const price = parseFloat(player.askingPrice || "0");
                  const canAfford = currentBudget >= price;
                  const canBuy = canAfford && !isTeamFull;
                  
                  let disabledReason = "";
                  if (isTeamFull) disabledReason = "Team Full (Max 25)";
                  else if (!canAfford) disabledReason = "Insufficient Funds";

                  return (
                    <TransferPlayerCard
                      key={player.id}
                      player={player}
                      onBuy={handleBuyClick}
                      isOwnPlayer={player.teamId === teamId}
                      canBuy={canBuy}
                      disabledReason={disabledReason}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12 bg-slate-800/50 rounded-lg border border-slate-800">
                No players found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buy Confirmation Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md border border-slate-700 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              Confirm Purchase
            </h3>

            <div className="mb-6 space-y-4">
              <p className="text-slate-300">
                Are you sure you want to buy{" "}
                <strong className="text-white">{selectedPlayer.name}</strong>?
              </p>

              <div className="bg-slate-900 p-4 rounded border border-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Asking Price</span>
                  <span className="text-white font-bold">
                    {formatCurrency(selectedPlayer.askingPrice || 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 mt-2">
                  <span className="text-slate-400">Current Budget</span>
                  <span className="text-white">
                    {formatCurrency(currentBudget)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining Budget</span>
                  <span
                    className={`font-bold ${
                      currentBudget -
                        parseFloat(selectedPlayer.askingPrice || "0") <
                      0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {formatCurrency(
                      currentBudget -
                        parseFloat(selectedPlayer.askingPrice || "0")
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedPlayer(null)}
                disabled={buyMutation.isPending}
                className="px-4 py-2 text-slate-300 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBuy}
                disabled={buyMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buyMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Processing...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </button>
            </div>
            
            {buyMutation.isError && (
               <div className="mt-4 p-3 bg-red-900/50 border border-red-800 text-red-200 rounded text-sm">
                 Failed to complete purchase. Please try again.
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

