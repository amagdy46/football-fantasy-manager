import { Response } from "express";
import { AuthRequest } from "@/modules/common/types";
import {
  TransferService,
  TransferServiceError,
} from "../services/transferService";

/**
 * Toggle player transfer list status
 * PATCH /api/players/:id/transfer-list
 */
export const toggleTransferList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const playerId = req.params.id;
    const { askingPrice } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const shouldList = askingPrice !== null && askingPrice !== undefined;

    if (shouldList) {
      const price = Number(askingPrice);
      if (isNaN(price)) {
        return res
          .status(400)
          .json({ message: "Asking price must be a valid number" });
      }
      const player = await TransferService.listPlayer(userId, playerId, price);
      return res.json(player);
    } else {
      const player = await TransferService.unlistPlayer(userId, playerId);
      return res.json(player);
    }
  } catch (error) {
    if (error instanceof TransferServiceError) {
      const statusMap: Record<string, number> = {
        PLAYER_NOT_FOUND: 404,
        NOT_OWNER: 403,
        INVALID_PRICE: 400,
      };
      const status = statusMap[error.code] || 400;
      return res.status(status).json({ message: error.message });
    }
    console.error("Error updating transfer status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get players on transfer market
 * GET /api/transfers
 */
export const getTransfers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { minPrice, maxPrice, position, teamName, playerName } = req.query;

    const players = await TransferService.getTransferList(
      {
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        position: position ? String(position) : undefined,
        teamName: teamName ? String(teamName) : undefined,
        playerName: playerName ? String(playerName) : undefined,
      },
      userId
    );

    res.json(players);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Buy a player
 * POST /api/transfers/buy/:playerId
 */
export const buyPlayer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const playerId = req.params.playerId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await TransferService.buyPlayer(userId, playerId);
    res.json(result);
  } catch (error) {
    if (error instanceof TransferServiceError) {
      const statusMap: Record<string, number> = {
        PLAYER_NOT_FOUND: 404,
        BUYER_TEAM_NOT_FOUND: 404,
        PLAYER_NOT_FOR_SALE: 400,
        CANNOT_BUY_OWN_PLAYER: 400,
        BUYER_TEAM_FULL: 400,
        INSUFFICIENT_FUNDS: 400,
        SELLER_TEAM_TOO_SMALL: 400,
      };
      const status = statusMap[error.code] || 400;
      return res.status(status).json({ message: error.message });
    }
    console.error("Error buying player:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
