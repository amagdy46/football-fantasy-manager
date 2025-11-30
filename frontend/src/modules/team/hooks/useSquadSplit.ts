import { useMemo } from "react";
import { Player } from "../types";

export const useSquadSplit = (players: Player[] | undefined) => {
  return useMemo(() => {
    if (!players) {
      return { starters: [], bench: [] };
    }

    const starters = players.filter((p) => p.isStarter);
    const bench = players.filter((p) => !p.isStarter);

    return { starters, bench };
  }, [players]);
};
