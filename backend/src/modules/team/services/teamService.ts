import prisma from "@/config/database";
import { TeamStatus, TeamWithPlayers } from "../types";

export class TeamServiceError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "TeamServiceError";
  }
}

export class TeamService {
  static async getTeamStatus(userId: string): Promise<TeamStatus> {
    const team = await prisma.team.findUnique({
      where: { userId },
      select: { isReady: true, id: true },
    });

    if (!team) {
      return { isReady: false };
    }

    return { isReady: team.isReady, teamId: team.id };
  }

  static async getTeamWithPlayers(userId: string): Promise<TeamWithPlayers> {
    const team = await prisma.team.findUnique({
      where: { userId },
      include: { players: true },
    });

    if (!team) {
      throw new TeamServiceError("TEAM_NOT_FOUND", "Team not found");
    }

    return team;
  }

  static async updateTeamName(userId: string, name: string) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new TeamServiceError("INVALID_NAME", "Invalid team name");
    }

    return prisma.team.update({
      where: { userId },
      data: { name: trimmedName },
    });
  }
}
