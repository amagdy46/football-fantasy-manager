import { describe, it, expect, vi, beforeEach } from "vitest";
import { TeamService, TeamServiceError } from "./teamService";
import prisma from "@/config/database";

vi.mock("@/config/database", () => ({
  default: {
    team: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("TeamService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTeamStatus", () => {
    it("should return team status when team exists and is ready", async () => {
      vi.mocked(prisma.team.findUnique).mockResolvedValue({
        id: "team-1",
        isReady: true,
      } as any);

      const result = await TeamService.getTeamStatus("user-1");

      expect(result).toEqual({ isReady: true, teamId: "team-1" });
      expect(prisma.team.findUnique).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        select: { isReady: true, id: true },
      });
    });

    it("should return team status when team exists but not ready", async () => {
      vi.mocked(prisma.team.findUnique).mockResolvedValue({
        id: "team-1",
        isReady: false,
      } as any);

      const result = await TeamService.getTeamStatus("user-1");

      expect(result).toEqual({ isReady: false, teamId: "team-1" });
    });

    it("should return isReady: false when team doesn't exist", async () => {
      vi.mocked(prisma.team.findUnique).mockResolvedValue(null);

      const result = await TeamService.getTeamStatus("user-1");

      expect(result).toEqual({ isReady: false });
    });
  });

  describe("getTeamWithPlayers", () => {
    it("should return team with players", async () => {
      const mockTeam = {
        id: "team-1",
        name: "Test Team",
        budget: 5000000,
        players: [
          { id: "player-1", name: "Player 1" },
          { id: "player-2", name: "Player 2" },
        ],
      };

      vi.mocked(prisma.team.findUnique).mockResolvedValue(mockTeam as any);

      const result = await TeamService.getTeamWithPlayers("user-1");

      expect(result).toEqual(mockTeam);
      expect(prisma.team.findUnique).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        include: { players: true },
      });
    });

    it("should throw TEAM_NOT_FOUND when team doesn't exist", async () => {
      vi.mocked(prisma.team.findUnique).mockResolvedValue(null);

      await expect(TeamService.getTeamWithPlayers("user-1")).rejects.toThrow(
        TeamServiceError
      );

      await expect(
        TeamService.getTeamWithPlayers("user-1")
      ).rejects.toMatchObject({
        code: "TEAM_NOT_FOUND",
      });
    });
  });

  describe("updateTeamName", () => {
    it("should update team name successfully", async () => {
      const mockTeam = {
        id: "team-1",
        name: "New Team Name",
      };

      vi.mocked(prisma.team.update).mockResolvedValue(mockTeam as any);

      const result = await TeamService.updateTeamName(
        "user-1",
        "New Team Name"
      );

      expect(result).toEqual(mockTeam);
      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        data: { name: "New Team Name" },
      });
    });

    it("should trim whitespace from team name", async () => {
      vi.mocked(prisma.team.update).mockResolvedValue({
        name: "Trimmed",
      } as any);

      await TeamService.updateTeamName("user-1", "  Trimmed  ");

      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        data: { name: "Trimmed" },
      });
    });

    it("should throw INVALID_NAME for empty string", async () => {
      await expect(TeamService.updateTeamName("user-1", "")).rejects.toThrow(
        TeamServiceError
      );

      await expect(
        TeamService.updateTeamName("user-1", "")
      ).rejects.toMatchObject({
        code: "INVALID_NAME",
      });
    });

    it("should throw INVALID_NAME for whitespace-only string", async () => {
      await expect(
        TeamService.updateTeamName("user-1", "   ")
      ).rejects.toMatchObject({
        code: "INVALID_NAME",
      });
    });
  });
});
