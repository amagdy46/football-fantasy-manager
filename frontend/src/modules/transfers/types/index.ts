import { Player } from "@/types";

export interface TransferPlayer extends Player {
  teamName: string;
  isOwnPlayer?: boolean;
}

export interface TransferFilters {
  minPrice?: number;
  maxPrice?: number;
  position?: string;
  teamName?: string;
  playerName?: string;
}
