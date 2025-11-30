export type Position = "GK" | "DEF" | "MID" | "ATT";

export interface Player {
  id: string;
  name: string;
  position: Position;
  age: number;
  country: string;
  value: string;
  goals: number;
  assists: number;
  isOnTransferList: boolean;
  askingPrice?: string;
  teamId: string;
  isStarter: boolean;
}

export interface Team {
  id: string;
  userId: string;
  name: string;
  budget: string;
  isReady: boolean;
  players: Player[];
}

export interface TeamStatusResponse {
  isReady: boolean;
  teamId?: string;
}
