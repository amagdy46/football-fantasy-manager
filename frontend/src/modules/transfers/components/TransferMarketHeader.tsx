import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TransferMarketHeaderProps {
  budget: number;
}

export const TransferMarketHeader = ({ budget }: TransferMarketHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Link
        to="/dashboard"
        className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
        data-testid="back-to-dashboard"
      >
        <ArrowLeft size={24} />
      </Link>
      <h1 className="text-3xl font-bold">Transfer Market</h1>
      <div className="ml-auto bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
        <span className="text-slate-400 text-sm mr-2">Budget:</span>
        <span
          className="text-green-500 font-bold text-xl"
          data-testid="transfer-budget"
        >
          {formatCurrency(budget)}
        </span>
      </div>
    </div>
  );
};
