import { Player, Team, Position, Prisma } from "@/generated/prisma/client.js";

export interface TeamStatus {
  isReady: boolean;
  teamId?: string;
}

export interface TeamWithPlayers extends Team {
  players: Player[];
}

export interface PoolPlayer {
  id: string;
  name: string;
  position: Position;
  age: number;
  country: string;
  marketValue: Prisma.Decimal;
  goals: number;
  assists: number;
}

export interface TeamCreationJobData {
  userId: string;
  email: string;
}
