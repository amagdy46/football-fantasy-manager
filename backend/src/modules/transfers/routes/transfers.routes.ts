import { Router } from "express";
import { getTransfers, buyPlayer } from "../controllers/transferController";
import { authenticateToken } from "@/modules/common/middleware/auth";

const router = Router();

// GET /api/transfers
router.get("/", authenticateToken, getTransfers);

// POST /api/transfers/buy/:playerId
router.post("/buy/:playerId", authenticateToken, buyPlayer);

export default router;

