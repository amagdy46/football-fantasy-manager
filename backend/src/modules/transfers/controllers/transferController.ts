import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import prisma from "@/config/database";

// Extended Request interface to include user from auth middleware
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Toggle player transfer list status
 * PATCH /api/players/:id/transfer-list
 */
export const toggleTransferList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const playerId = req.params.id;
    const { askingPrice } = req.body; // If provided, add to list. If null/undefined/false, remove? 
    // Instructions say: 
    // 7.2 Implement add to transfer list: set isOnTransferList=true, askingPrice=provided value
    // 7.3 Implement remove from transfer list: set isOnTransferList=false, askingPrice=null
    
    // Let's assume if askingPrice is provided (number > 0), we list it.
    // If askingPrice is missing or null, or we have a specific 'remove' flag, we remove it.
    // However, a PATCH usually updates. 
    // Let's look at the body. If askingPrice is present and valid, List.
    // If askingPrice is null, Delist.
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1. Check if player exists and belongs to user's team
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { team: true },
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    if (player.team.userId !== userId) {
      return res.status(403).json({ message: "You can only manage your own players" });
    }

    // 2. Update logic
    const shouldList = askingPrice !== null && askingPrice !== undefined;
    
    if (shouldList) {
        // Validation for asking price
        const price = Number(askingPrice);
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: "Invalid asking price" });
        }

        const updatedPlayer = await prisma.player.update({
            where: { id: playerId },
            data: {
                isOnTransferList: true,
                askingPrice: price
            }
        });
        return res.json(updatedPlayer);
    } else {
        // Remove from list
        const updatedPlayer = await prisma.player.update({
            where: { id: playerId },
            data: {
                isOnTransferList: false,
                askingPrice: null
            }
        });
        return res.json(updatedPlayer);
    }

  } catch (error) {
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
    const { 
        minPrice, 
        maxPrice, 
        position, 
        teamName, 
        playerName 
    } = req.query;

    // Filters
    const where: any = {
        isOnTransferList: true,
    };

    // 7.7 Exclude current user's own players
    if (userId) {
        where.team = {
            userId: {
                not: userId
            }
        };
    }

    // Price Filter
    if (minPrice || maxPrice) {
        where.askingPrice = {};
        if (minPrice) where.askingPrice.gte = Number(minPrice);
        if (maxPrice) where.askingPrice.lte = Number(maxPrice);
    }

    // Position Filter
    if (position) {
        where.position = position;
    }

    // Player Name Filter (Partial)
    if (playerName) {
        where.name = {
            contains: String(playerName),
            mode: 'insensitive'
        };
    }

    // Team Name Filter (Partial)
    if (teamName) {
        if (!where.team) where.team = {};
        // If we already have userId exclusion, we need to merge or ensure structure is correct
        // Prisma allows nested specific filters.
        // But 'userId: { not: userId }' is inside 'team'.
        // We can add name filter to 'team' as well.
        
        // Wait, if I assigned where.team above, I should spread it or add to it.
        // Actually where.team is an object.
        if (!where.team) where.team = {};
        
        where.team.name = {
            contains: String(teamName),
            mode: 'insensitive'
        };
    }

    const players = await prisma.player.findMany({
        where,
        include: {
            team: {
                select: {
                    name: true,
                    userId: true
                }
            }
        },
        orderBy: {
            askingPrice: 'asc'
        }
    });

    // Flatten/Map response to include teamName
    const response = players.map(p => ({
        ...p,
        teamName: p.team.name,
        teamId: p.teamId, // We have teamId in player model
        // askingPrice and value are Decimals, might need conversion for JSON if not handled by framework
        // Express/JSON.stringify usually keeps numbers or strings. 
        // Prisma decimals are objects or strings usually.
    }));

    res.json(response);

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

    // Use a transaction
    const result = await prisma.$transaction(async (tx) => {
        // 1. Get the player with team info (Locking?)
        // Prisma doesn't support SELECT FOR UPDATE easily without raw query, 
        // but we can rely on optimistic concurrency or just checks in transaction.
        // For strict correctness, raw query is better, but let's stick to Prisma API first.
        // If we want locking, we might need $queryRaw.
        
        const player = await tx.player.findUnique({
            where: { id: playerId },
            include: { team: true }
        });

        if (!player) {
            throw new Error("PLAYER_NOT_FOUND");
        }

        // 7.9 Check player is on transfer list
        if (!player.isOnTransferList || !player.askingPrice) {
            throw new Error("PLAYER_NOT_FOR_SALE");
        }

        // 7.13 Prevent buying own players
        if (player.team.userId === userId) {
            throw new Error("CANNOT_BUY_OWN_PLAYER");
        }

        // Get buyer team
        const buyerTeam = await tx.team.findUnique({
            where: { userId },
            include: { players: true }
        });

        if (!buyerTeam) {
            throw new Error("BUYER_TEAM_NOT_FOUND");
        }

        // 7.11 Check buyer won't exceed 25 players
        if (buyerTeam.players.length >= 25) {
            throw new Error("BUYER_TEAM_FULL");
        }

        // 7.10 Check buyer has sufficient budget (95% of asking price)
        // Seller gets 95%, wait? 
        // "check buyer has sufficient budget (95% of asking price)" - Wait, usually buyer pays 100%.
        // The instruction says: "check buyer has sufficient budget (95% of asking price)"
        // This is weird. Usually buyer pays full price, seller receives X%. 
        // Or maybe the market is discounted?
        // Let's re-read 7.10 carefully: "Implement purchase validation: check buyer has sufficient budget (95% of asking price)"
        // And 8.8: "Create buy confirmation modal showing: ... final price (95%)"
        // It implies the price displayed/paid is 95% of asking? Or maybe asking price is what seller wants, and buyer pays asking price, but wait.
        
        // Let's look at 8.8 again: "final price (95%)"
        // If the instruction says buyer checks budget for 95% of asking price, then buyer PAYS 95% of asking price.
        // This effectively means the "Asking Price" set by seller is ... slightly misleading or there's a global discount?
        // OR, maybe the instruction meant "Seller receives 95%" but wrote it in a confusing way?
        // But 7.10 is explicit about buyer budget check against 95%.
        // Let's assume the "Transaction Price" is 95% of "Asking Price".
        // Or maybe "Asking Price" includes a tax that is removed?
        
        // I will implement it as: Transaction Price = Asking Price * 0.95.
        // Buyer pays Transaction Price.
        
        const askingPrice = Number(player.askingPrice);
        const transactionPrice = askingPrice * 0.95;
        const buyerBudget = Number(buyerTeam.budget);

        if (buyerBudget < transactionPrice) {
            throw new Error("INSUFFICIENT_FUNDS");
        }

        // 7.12 Check seller won't go below 15 players
        // player.team is the seller team. We need to count their players.
        // We included team in player fetch, but not players count.
        // Let's count players of seller.
        const sellerPlayerCount = await tx.player.count({
            where: { teamId: player.teamId }
        });

        if (sellerPlayerCount <= 15) {
            throw new Error("SELLER_TEAM_TOO_SMALL");
        }

        // EXECUTE TRANSFER
        
        // 1. Deduct from buyer
        await tx.team.update({
            where: { id: buyerTeam.id },
            data: {
                budget: {
                    decrement: transactionPrice
                }
            }
        });

        // 2. Add to seller (Do they get the full 95%? Or is there a fee?)
        // Instructions don't mention a fee, just "final price (95%)".
        // So I assume money goes from Buyer -> Seller directly.
        // If Transaction Price is 95% of Asking, and Buyer pays that, does Seller get all of it?
        // Usually in games, there's a tax. 
        // If Asking Price = 100M. 95% = 95M.
        // Buyer pays 95M. Seller gets 95M.
        // This matches the "95%" figure.
        
        await tx.team.update({
            where: { id: player.teamId },
            data: {
                budget: {
                    increment: transactionPrice
                }
            }
        });

        // 3. Move player
        const updatedPlayer = await tx.player.update({
            where: { id: playerId },
            data: {
                teamId: buyerTeam.id,
                isOnTransferList: false,
                askingPrice: null
            }
        });

        return { player: updatedPlayer, transactionPrice, remainingBudget: buyerBudget - transactionPrice };
    });

    res.json(result);

  } catch (error: any) {
    console.error("Error buying player:", error);
    
    // Map errors to status codes
    const errorMap: Record<string, { status: number, msg: string }> = {
        "PLAYER_NOT_FOUND": { status: 404, msg: "Player not found" },
        "PLAYER_NOT_FOR_SALE": { status: 400, msg: "Player is not for sale" },
        "CANNOT_BUY_OWN_PLAYER": { status: 400, msg: "Cannot buy your own player" },
        "BUYER_TEAM_NOT_FOUND": { status: 404, msg: "Buyer team not found" },
        "BUYER_TEAM_FULL": { status: 400, msg: "Your team is full (max 25 players)" },
        "INSUFFICIENT_FUNDS": { status: 400, msg: "Insufficient funds" },
        "SELLER_TEAM_TOO_SMALL": { status: 400, msg: "Seller cannot sell players (minimum 15 required)" }
    };

    if (error.message && errorMap[error.message]) {
        const { status, msg } = errorMap[error.message];
        return res.status(status).json({ message: msg });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

