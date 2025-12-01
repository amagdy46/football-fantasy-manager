import { Response } from "express";
import { AuthRequest } from "@/modules/common/types";
import { TeamService, TeamServiceError } from "../services/teamService";

export const getTeamStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const status = await TeamService.getTeamStatus(userId);
    res.json(status);
  } catch (error) {
    console.error("Error fetching team status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const team = await TeamService.getTeamWithPlayers(userId);
    res.json(team);
  } catch (error) {
    if (error instanceof TeamServiceError) {
      const statusMap: Record<string, number> = {
        TEAM_NOT_FOUND: 404,
      };
      const status = statusMap[error.code] || 400;
      return res.status(status).json({ message: error.message });
    }
    console.error("Error fetching team:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTeamName = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid team name" });
    }

    const team = await TeamService.updateTeamName(userId, name);
    res.json(team);
  } catch (error) {
    if (error instanceof TeamServiceError) {
      const statusMap: Record<string, number> = {
        INVALID_NAME: 400,
      };
      const status = statusMap[error.code] || 400;
      return res.status(status).json({ message: error.message });
    }
    console.error("Error updating team name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
