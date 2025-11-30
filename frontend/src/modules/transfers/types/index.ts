import { Player } from "@/modules/team/types";

export interface TransferPlayer extends Player {
  teamName: string;
}

export interface TransferFilters {
  minPrice?: number;
  maxPrice?: number;
  position?: string;
  teamName?: string;
  playerName?: string;
}
