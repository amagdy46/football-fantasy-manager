import { Prisma } from "@/generated/prisma/client";
import prisma from "@/config/database";
import { TransferFilters, TransferPlayer, BuyPlayerResult } from "../types";

export class TransferServiceError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "TransferServiceError";
  }
}

export class TransferService {
  static async listPlayer(
    userId: string,
    playerId: string,
    askingPrice: number
  ) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { team: true },
    });

    if (!player) {
      throw new TransferServiceError("PLAYER_NOT_FOUND", "Player not found");
    }

    if (player.team.userId !== userId) {
      throw new TransferServiceError(
        "NOT_OWNER",
        "You can only manage your own players"
      );
    }

    if (askingPrice <= 0) {
      throw new TransferServiceError(
        "INVALID_PRICE",
        "Asking price must be greater than 0"
      );
    }

    return prisma.player.update({
      where: { id: playerId },
      data: {
        isOnTransferList: true,
        askingPrice,
      },
    });
  }

  static async unlistPlayer(userId: string, playerId: string) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { team: true },
    });

    if (!player) {
      throw new TransferServiceError("PLAYER_NOT_FOUND", "Player not found");
    }

    if (player.team.userId !== userId) {
      throw new TransferServiceError(
        "NOT_OWNER",
        "You can only manage your own players"
      );
    }

    return prisma.player.update({
      where: { id: playerId },
      data: {
        isOnTransferList: false,
        askingPrice: null,
      },
    });
  }

  static async getTransferList(
    filters: TransferFilters,
    currentUserId?: string
  ): Promise<TransferPlayer[]> {
    const where: Prisma.PlayerWhereInput = {
      isOnTransferList: true,
    };

    if (filters.minPrice || filters.maxPrice) {
      where.askingPrice = {};
      if (filters.minPrice) where.askingPrice.gte = filters.minPrice;
      if (filters.maxPrice) where.askingPrice.lte = filters.maxPrice;
    }

    if (filters.position) {
      where.position = filters.position as Prisma.EnumPositionFilter;
    }

    if (filters.playerName) {
      where.name = {
        contains: filters.playerName,
        mode: "insensitive",
      };
    }

    if (filters.teamName) {
      where.team = {
        name: {
          contains: filters.teamName,
          mode: "insensitive",
        },
      };
    }

    const players = await prisma.player.findMany({
      where,
      include: {
        team: {
          select: {
            name: true,
            userId: true,
          },
        },
      },
      orderBy: {
        askingPrice: "asc",
      },
    });

    return players.map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      age: p.age,
      country: p.country,
      value: p.value,
      goals: p.goals,
      assists: p.assists,
      askingPrice: p.askingPrice,
      isOnTransferList: p.isOnTransferList,
      teamName: p.team.name,
      teamId: p.teamId,
      isOwnPlayer: p.team.userId === currentUserId,
    }));
  }

  static async buyPlayer(
    buyerUserId: string,
    playerId: string
  ): Promise<BuyPlayerResult> {
    return prisma.$transaction(
      async (tx) => {
        const player = await tx.player.findUnique({
          where: { id: playerId },
          include: { team: true },
        });

        if (!player) {
          throw new TransferServiceError(
            "PLAYER_NOT_FOUND",
            "Player not found"
          );
        }

        if (!player.isOnTransferList || !player.askingPrice) {
          throw new TransferServiceError(
            "PLAYER_NOT_FOR_SALE",
            "Player is not for sale"
          );
        }

        if (player.team.userId === buyerUserId) {
          throw new TransferServiceError(
            "CANNOT_BUY_OWN_PLAYER",
            "Cannot buy your own player"
          );
        }

        const buyerTeam = await tx.team.findUnique({
          where: { userId: buyerUserId },
          include: { players: true },
        });

        if (!buyerTeam) {
          throw new TransferServiceError(
            "BUYER_TEAM_NOT_FOUND",
            "Buyer team not found"
          );
        }

        if (buyerTeam.players.length >= 25) {
          throw new TransferServiceError(
            "BUYER_TEAM_FULL",
            "Your team is full (max 25 players)"
          );
        }

        const askingPrice = Number(player.askingPrice);
        const transactionPrice = askingPrice * 0.95;
        const buyerBudget = Number(buyerTeam.budget);

        if (buyerBudget < transactionPrice) {
          throw new TransferServiceError(
            "INSUFFICIENT_FUNDS",
            "Insufficient funds"
          );
        }

        const sellerPlayerCount = await tx.player.count({
          where: { teamId: player.teamId },
        });

        if (sellerPlayerCount <= 15) {
          throw new TransferServiceError(
            "SELLER_TEAM_TOO_SMALL",
            "Seller cannot sell players (minimum 15 required)"
          );
        }

        await tx.team.update({
          where: { id: buyerTeam.id },
          data: {
            budget: { decrement: transactionPrice },
          },
        });

        await tx.team.update({
          where: { id: player.teamId },
          data: {
            budget: { increment: transactionPrice },
          },
        });

        const updatedPlayer = await tx.player.update({
          where: { id: playerId },
          data: {
            teamId: buyerTeam.id,
            isOnTransferList: false,
            askingPrice: null,
          },
        });

        return {
          player: updatedPlayer,
          transactionPrice,
          remainingBudget: buyerBudget - transactionPrice,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  }
}
