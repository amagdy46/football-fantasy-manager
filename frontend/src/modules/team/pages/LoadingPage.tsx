import { Loader2, AlertCircle } from "lucide-react";
import { useLoadingDots } from "../../common/hooks";
import { useTeamStatusPolling } from "../hooks";

export default function LoadingPage() {
  const dots = useLoadingDots();
  const { error, retry } = useTeamStatusPolling();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl flex flex-col items-center max-w-md w-full text-center">
        {error ? (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
              <AlertCircle className="w-16 h-16 text-red-500 relative z-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              Scouting Delayed
            </h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={retry}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="w-16 h-16 text-green-500 animate-spin relative z-10" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Scouting Players{dots}</h2>
            <p className="text-slate-400">
              Our scouts are traveling the world to assemble your starting
              squad. This usually takes a few seconds.
            </p>

            <div className="mt-8 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-green-500 h-full w-1/3 animate-[shimmer_2s_infinite]"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
