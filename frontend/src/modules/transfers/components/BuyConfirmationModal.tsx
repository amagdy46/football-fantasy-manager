import { Loader2 } from "lucide-react";
import { TransferPlayer } from "../types";
import { formatCurrency } from "@/lib/utils";

interface BuyConfirmationModalProps {
  player: TransferPlayer;
  currentBudget: number;
  isPending: boolean;
  isError: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BuyConfirmationModal = ({
  player,
  currentBudget,
  isPending,
  isError,
  onConfirm,
  onCancel,
}: BuyConfirmationModalProps) => {
  const askingPrice = parseFloat(player.askingPrice || "0");
  const finalPrice = askingPrice * 0.95;
  const remainingBudget = currentBudget - finalPrice;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      data-testid="buy-confirmation-modal"
    >
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md border border-slate-700 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-4">Confirm Purchase</h3>

        <div className="mb-6 space-y-4">
          <p className="text-slate-300">
            Are you sure you want to buy{" "}
            <strong className="text-white">{player.name}</strong>?
          </p>

          <div className="bg-slate-900 p-4 rounded border border-slate-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Asking Price</span>
              <span className="text-white line-through opacity-60">
                {formatCurrency(askingPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Final Price (95%)</span>
              <span className="text-green-400 font-bold">
                {formatCurrency(finalPrice)}
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
                  remainingBudget < 0 ? "text-red-500" : "text-green-500"
                }`}
              >
                {formatCurrency(remainingBudget)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-slate-300 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="confirm-buy-btn"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Processing...
              </>
            ) : (
              "Confirm Purchase"
            )}
          </button>
        </div>

        {isError && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-800 text-red-200 rounded text-sm">
            Failed to complete purchase. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};
