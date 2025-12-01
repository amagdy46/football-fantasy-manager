import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransferService, TransferServiceError } from "./transferService";
import prisma from "@/config/database";

vi.mock("@/config/database", () => ({
  default: {
    player: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    team: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("TransferService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listPlayer", () => {
    it("should list a player for transfer", async () => {
      const mockPlayer = {
        id: "player-1",
        name: "Test Player",
        team: { userId: "user-1" },
      };

      vi.mocked(prisma.player.findUnique).mockResolvedValue(mockPlayer as any);
      vi.mocked(prisma.player.update).mockResolvedValue({
        ...mockPlayer,
        isOnTransferList: true,
        askingPrice: 1000000,
      } as any);

      const result = await TransferService.listPlayer(
        "user-1",
        "player-1",
        1000000
      );

      expect(prisma.player.findUnique).toHaveBeenCalledWith({
        where: { id: "player-1" },
        include: { team: true },
      });
      expect(prisma.player.update).toHaveBeenCalledWith({
        where: { id: "player-1" },
        data: { isOnTransferList: true, askingPrice: 1000000 },
      });
      expect(result.isOnTransferList).toBe(true);
    });

    it("should throw PLAYER_NOT_FOUND if player doesn't exist", async () => {
      vi.mocked(prisma.player.findUnique).mockResolvedValue(null);

      await expect(
        TransferService.listPlayer("user-1", "player-1", 1000000)
      ).rejects.toThrow(TransferServiceError);

      await expect(
        TransferService.listPlayer("user-1", "player-1", 1000000)
      ).rejects.toMatchObject({ code: "PLAYER_NOT_FOUND" });
    });

    it("should throw NOT_OWNER if user doesn't own the player", async () => {
      const mockPlayer = {
        id: "player-1",
        team: { userId: "other-user" },
      };

      vi.mocked(prisma.player.findUnique).mockResolvedValue(mockPlayer as any);

      await expect(
        TransferService.listPlayer("user-1", "player-1", 1000000)
      ).rejects.toMatchObject({ code: "NOT_OWNER" });
    });

    it("should throw INVALID_PRICE if asking price is 0 or negative", async () => {
      const mockPlayer = {
        id: "player-1",
        team: { userId: "user-1" },
      };

      vi.mocked(prisma.player.findUnique).mockResolvedValue(mockPlayer as any);

      await expect(
        TransferService.listPlayer("user-1", "player-1", 0)
      ).rejects.toMatchObject({ code: "INVALID_PRICE" });

      await expect(
        TransferService.listPlayer("user-1", "player-1", -100)
      ).rejects.toMatchObject({ code: "INVALID_PRICE" });
    });
  });

  describe("unlistPlayer", () => {
    it("should remove a player from transfer list", async () => {
      const mockPlayer = {
        id: "player-1",
        team: { userId: "user-1" },
        isOnTransferList: true,
      };

      vi.mocked(prisma.player.findUnique).mockResolvedValue(mockPlayer as any);
      vi.mocked(prisma.player.update).mockResolvedValue({
        ...mockPlayer,
        isOnTransferList: false,
        askingPrice: null,
      } as any);

      const result = await TransferService.unlistPlayer("user-1", "player-1");

      expect(prisma.player.update).toHaveBeenCalledWith({
        where: { id: "player-1" },
        data: { isOnTransferList: false, askingPrice: null },
      });
      expect(result.isOnTransferList).toBe(false);
    });

    it("should throw PLAYER_NOT_FOUND if player doesn't exist", async () => {
      vi.mocked(prisma.player.findUnique).mockResolvedValue(null);

      await expect(
        TransferService.unlistPlayer("user-1", "player-1")
      ).rejects.toMatchObject({ code: "PLAYER_NOT_FOUND" });
    });

    it("should throw NOT_OWNER if user doesn't own the player", async () => {
      const mockPlayer = {
        id: "player-1",
        team: { userId: "other-user" },
      };

      vi.mocked(prisma.player.findUnique).mockResolvedValue(mockPlayer as any);

      await expect(
        TransferService.unlistPlayer("user-1", "player-1")
      ).rejects.toMatchObject({ code: "NOT_OWNER" });
    });
  });

  describe("getTransferList", () => {
    it("should return players on transfer list", async () => {
      const mockPlayers = [
        {
          id: "player-1",
          name: "Player 1",
          position: "ATT",
          age: 25,
          country: "Brazil",
          value: 1000000,
          goals: 10,
          assists: 5,
          askingPrice: 1500000,
          isOnTransferList: true,
          teamId: "team-1",
          team: { name: "Team A", userId: "user-1" },
        },
      ];

      vi.mocked(prisma.player.findMany).mockResolvedValue(mockPlayers as any);

      const result = await TransferService.getTransferList({}, "user-2");

      expect(result).toHaveLength(1);
      expect(result[0].teamName).toBe("Team A");
      expect(result[0].isOwnPlayer).toBe(false);
    });

    it("should mark own players correctly", async () => {
      const mockPlayers = [
        {
          id: "player-1",
          name: "Player 1",
          position: "ATT",
          age: 25,
          country: "Brazil",
          value: 1000000,
          goals: 10,
          assists: 5,
          askingPrice: 1500000,
          isOnTransferList: true,
          teamId: "team-1",
          team: { name: "Team A", userId: "user-1" },
        },
      ];

      vi.mocked(prisma.player.findMany).mockResolvedValue(mockPlayers as any);

      const result = await TransferService.getTransferList({}, "user-1");

      expect(result[0].isOwnPlayer).toBe(true);
    });

    it("should apply filters correctly", async () => {
      vi.mocked(prisma.player.findMany).mockResolvedValue([]);

      await TransferService.getTransferList({
        minPrice: 1000000,
        maxPrice: 5000000,
        position: "ATT",
        playerName: "Messi",
        teamName: "Barcelona",
      });

      expect(prisma.player.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isOnTransferList: true,
            askingPrice: { gte: 1000000, lte: 5000000 },
            position: "ATT",
            name: { contains: "Messi", mode: "insensitive" },
            team: { name: { contains: "Barcelona", mode: "insensitive" } },
          }),
        })
      );
    });
  });

  describe("buyPlayer", () => {
    it("should execute transfer successfully", async () => {
      const mockTx = {
        player: {
          findUnique: vi.fn().mockResolvedValue({
            id: "player-1",
            teamId: "seller-team",
            name: "Player 1",
            isOnTransferList: true,
            askingPrice: "1000000",
            team: { userId: "seller-user" },
          }),
          count: vi.fn().mockResolvedValue(20),
          update: vi.fn().mockResolvedValue({
            id: "player-1",
            teamId: "buyer-team",
            isOnTransferList: false,
          }),
        },
        team: {
          findUnique: vi.fn().mockResolvedValue({
            id: "buyer-team",
            budget: 5000000,
            players: [],
          }),
          update: vi.fn(),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback(mockTx as any);
      });

      const result = await TransferService.buyPlayer("buyer-user", "player-1");

      expect(result.transactionPrice).toBe(950000);
      expect(result.remainingBudget).toBe(4050000);
      expect(mockTx.team.update).toHaveBeenCalledTimes(2);
    });

    it("should throw PLAYER_NOT_FOUND if player doesn't exist", async () => {
      const mockTx = {
        player: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback(mockTx as any);
      });

      await expect(
        TransferService.buyPlayer("buyer-user", "player-1")
      ).rejects.toMatchObject({ code: "PLAYER_NOT_FOUND" });
    });

    it("should throw PLAYER_NOT_FOR_SALE if not on transfer list", async () => {
      const mockTx = {
        player: {
          findUnique: vi.fn().mockResolvedValue({
            id: "player-1",
            isOnTransferList: false,
            askingPrice: null,
            team: { userId: "seller-user" },
          }),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback(mockTx as any);
      });

      await expect(
        TransferService.buyPlayer("buyer-user", "player-1")
      ).rejects.toMatchObject({ code: "PLAYER_NOT_FOR_SALE" });
    });

    it("should throw CANNOT_BUY_OWN_PLAYER if buying own player", async () => {
      const mockTx = {
        player: {
          findUnique: vi.fn().mockResolvedValue({
            id: "player-1",
            isOnTransferList: true,
            askingPrice: "1000000",
            team: { userId: "buyer-user" },
          }),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback(mockTx as any);
      });

      await expect(
        TransferService.buyPlayer("buyer-user", "player-1")
      ).rejects.toMatchObject({ code: "CANNOT_BUY_OWN_PLAYER" });
    });

    it("should throw BUYER_TEAM_FULL if buyer has 25 players", async () => {
      const mockTx = {
        player: {
          findUnique: vi.fn().mockResolvedValue({
            id: "player-1",
            isOnTransferList: true,
            askingPrice: "1000000",
            team: { userId: "seller-user" },
          }),
        },
        team: {
          findUnique: vi.fn().mockResolvedValue({
            id: "buyer-team",
            budget: 5000000,
            players: Array(25).fill({}),
          }),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback(mockTx as any);
      });

      await expect(
        TransferService.buyPlayer("buyer-user", "player-1")
      ).rejects.toMatchObject({ code: "BUYER_TEAM_FULL" });
    });

    it("should throw INSUFFICIENT_FUNDS if buyer can't afford", async () => {
      const mockTx = {
        player: {
          findUnique: vi.fn().mockResolvedValue({
            id: "player-1",
            isOnTransferList: true,
            askingPrice: "10000000",
            team: { userId: "seller-user" },
          }),
        },
        team: {
          findUnique: vi.fn().mockResolvedValue({
            id: "buyer-team",
            budget: 1000000,
            players: [],
          }),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback(mockTx as any);
      });

      await expect(
        TransferService.buyPlayer("buyer-user", "player-1")
      ).rejects.toMatchObject({ code: "INSUFFICIENT_FUNDS" });
    });

    it("should throw SELLER_TEAM_TOO_SMALL if seller has 15 or fewer players", async () => {
      const mockTx = {
        player: {
          findUnique: vi.fn().mockResolvedValue({
            id: "player-1",
            teamId: "seller-team",
            isOnTransferList: true,
            askingPrice: "1000000",
            team: { userId: "seller-user" },
          }),
          count: vi.fn().mockResolvedValue(15),
        },
        team: {
          findUnique: vi.fn().mockResolvedValue({
            id: "buyer-team",
            budget: 5000000,
            players: [],
          }),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback(mockTx as any);
      });

      await expect(
        TransferService.buyPlayer("buyer-user", "player-1")
      ).rejects.toMatchObject({ code: "SELLER_TEAM_TOO_SMALL" });
    });
  });
});
