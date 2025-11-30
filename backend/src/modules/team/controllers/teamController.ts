import { Request, Response } from "express";
import prisma from "@/config/database";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const getTeamStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const team = await prisma.team.findUnique({
      where: { userId },
      select: { isReady: true, id: true },
    });

    if (!team) {
      // If team doesn't exist yet, it's not ready (still being processed or queued)
      return res.json({ isReady: false });
    }

    res.json({ isReady: team.isReady, teamId: team.id });
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

    const team = await prisma.team.findUnique({
      where: { userId },
      include: {
        players: true,
      },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
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

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Invalid team name" });
    }

    const team = await prisma.team.update({
      where: { userId },
      data: { name: name.trim() },
    });

    res.json(team);
  } catch (error) {
    console.error("Error updating team name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
