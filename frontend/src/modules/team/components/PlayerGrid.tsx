import { Player } from "../types";
import { PlayerCard } from "./PlayerCard";

interface PlayerGridProps {
  players: Player[];
}

export const PlayerGrid = ({ players }: PlayerGridProps) => {
  // If showing bench only (mixed positions), grouping might be overkill if list is small,
  // but keeps consistency. Let's simplify for bench view or keep sections.
  // The prompt asked for "Reserves" like FPL. FPL bench is usually just a row.
  // But here we might have 9 players.

  const groupedPlayers = {
    GK: players.filter((p) => p.position === "GK"),
    DEF: players.filter((p) => p.position === "DEF"),
    MID: players.filter((p) => p.position === "MID"),
    ATT: players.filter((p) => p.position === "ATT"),
  };

  const sections = [
    { title: "Goalkeepers", players: groupedPlayers.GK },
    { title: "Defenders", players: groupedPlayers.DEF },
    { title: "Midfielders", players: groupedPlayers.MID },
    { title: "Attackers", players: groupedPlayers.ATT },
  ].filter((s) => s.players.length > 0);

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {section.players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      ))}
      {sections.length === 0 && (
        <div className="text-center text-slate-500 py-8">
          No players on bench.
        </div>
      )}
    </div>
  );
};
