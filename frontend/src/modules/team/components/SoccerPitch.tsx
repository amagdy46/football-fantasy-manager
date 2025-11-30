import { useState } from "react";
import { Player } from "../types";
import { PlayerDetailModal } from "./PlayerDetailModal";
import { useTransferActions } from "../hooks/useTransferActions";

interface SoccerPitchProps {
  players: Player[];
}

export const SoccerPitch = ({ players }: SoccerPitchProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const {
    handleListForTransfer,
    handleRemoveFromTransferList,
    isListing,
    isRemoving,
  } = useTransferActions();

  // Group players by position for placement
  const gk = players.filter((p) => p.position === "GK");
  const def = players.filter((p) => p.position === "DEF");
  const mid = players.filter((p) => p.position === "MID");
  const att = players.filter((p) => p.position === "ATT");

  const PlayerDot = ({ player }: { player: Player }) => (
    <div
      onClick={() => setSelectedPlayer(player)}
      className="flex flex-col items-center justify-center w-20 md:w-24 transform transition-transform hover:scale-110 cursor-pointer group z-10 relative"
    >
      <div
        className={`
        w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 border-white shadow-lg
        ${player.position === "GK" ? "bg-yellow-500" : ""}
        ${player.position === "DEF" ? "bg-blue-600" : ""}
        ${player.position === "MID" ? "bg-green-600" : ""}
        ${player.position === "ATT" ? "bg-red-600" : ""}
      `}
      >
        {player.name.substring(0, 2).toUpperCase()}
      </div>
      <div className="bg-slate-900/90 text-white text-[10px] md:text-xs px-2 py-0.5 rounded mt-1 truncate max-w-full text-center border border-slate-700 shadow-md backdrop-blur-sm">
        {player.name}
      </div>
    </div>
  );

  return (
    <>
      <div className="relative w-full aspect-3/4 md:aspect-4/3 rounded-xl overflow-hidden border-4 border-slate-800 shadow-2xl mb-8 select-none">
        {/* Grass Pattern */}
        <div
          className="absolute inset-0 bg-green-600"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px)`,
          }}
        ></div>

        {/* Pitch Markings Overlay */}
        <div className="absolute inset-4 border-2 border-white/40 rounded-sm"></div>

        {/* Center Line */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/40 -translate-y-1/2"></div>

        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 w-24 h-24 md:w-32 md:h-32 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

        {/* Top Penalty Area (Away) */}
        <div className="absolute top-4 left-1/2 w-3/5 md:w-1/3 h-[15%] border-2 border-white/40 border-t-0 -translate-x-1/2 bg-transparent"></div>
        <div className="absolute top-4 left-1/2 w-1/4 md:w-1/6 h-[6%] border-2 border-white/40 border-t-0 -translate-x-1/2 bg-transparent"></div>

        {/* Bottom Penalty Area (Home) */}
        <div className="absolute bottom-4 left-1/2 w-3/5 md:w-1/3 h-[15%] border-2 border-white/40 border-b-0 -translate-x-1/2 bg-transparent"></div>
        <div className="absolute bottom-4 left-1/2 w-1/4 md:w-1/6 h-[6%] border-2 border-white/40 border-b-0 -translate-x-1/2 bg-transparent"></div>

        {/* Corner Arcs */}
        <div className="absolute top-4 left-4 w-6 h-6 border-2 border-white/40 rounded-br-full border-t-0 border-l-0"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-2 border-white/40 rounded-bl-full border-t-0 border-r-0"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-2 border-white/40 rounded-tr-full border-b-0 border-l-0"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-white/40 rounded-tl-full border-b-0 border-r-0"></div>

        {/* Formation Layout Container */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 md:py-10">
          {/* Attackers (Top) */}
          <div className="flex justify-center items-center gap-4 md:gap-16 pt-4 md:pt-8">
            {att.map((p) => (
              <PlayerDot key={p.id} player={p} />
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex justify-center items-center gap-2 md:gap-12">
            {mid.map((p) => (
              <PlayerDot key={p.id} player={p} />
            ))}
          </div>

          {/* Defenders */}
          <div className="flex justify-center items-center gap-2 md:gap-12">
            {def.map((p) => (
              <PlayerDot key={p.id} player={p} />
            ))}
          </div>

          {/* Goalkeeper (Bottom) */}
          <div className="flex justify-center items-end pb-2">
            {gk.map((p) => (
              <PlayerDot key={p.id} player={p} />
            ))}
          </div>
        </div>
      </div>

      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onListForTransfer={handleListForTransfer}
          onRemoveFromTransferList={handleRemoveFromTransferList}
          isListing={isListing}
          isRemoving={isRemoving}
        />
      )}
    </>
  );
};
