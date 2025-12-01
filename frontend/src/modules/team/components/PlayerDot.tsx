import { Player } from "../types";
import { positionColors } from "@/lib/utils";

interface PlayerDotProps {
  player: Player;
  onClick: (player: Player) => void;
}

export const PlayerDot = ({ player, onClick }: PlayerDotProps) => (
  <button
    type="button"
    onClick={() => onClick(player)}
    className="flex flex-col items-center justify-center w-20 md:w-24 transform transition-transform hover:scale-110 cursor-pointer group z-10 relative"
  >
    <div
      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 border-white shadow-lg ${
        positionColors[player.position] || "bg-gray-600"
      }`}
    >
      {player.name.substring(0, 2).toUpperCase()}
    </div>
    <div className="bg-slate-900/90 text-white text-[10px] md:text-xs px-2 py-0.5 rounded mt-1 truncate max-w-full text-center border border-slate-700 shadow-md backdrop-blur-sm">
      {player.name}
    </div>
  </button>
);
