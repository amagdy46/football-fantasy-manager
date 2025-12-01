import { Prisma, Player } from "@/generated/prisma/client";

export interface TransferFilters {
  minPrice?: number;
  maxPrice?: number;
  position?: string;
  teamName?: string;
  playerName?: string;
}

export interface TransferPlayer {
  id: string;
  name: string;
  position: string;
  age: number;
  country: string;
  value: Prisma.Decimal;
  goals: number;
  assists: number;
  askingPrice: Prisma.Decimal | null;
  isOnTransferList: boolean;
  teamName: string;
  teamId: string;
  isOwnPlayer: boolean;
}

export interface BuyPlayerResult {
  player: Player;
  transactionPrice: number;
  remainingBudget: number;
}
