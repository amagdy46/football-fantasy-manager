import { Router } from "express";
import { getTransfers, buyPlayer } from "../controllers/transferController";
import { authenticateToken } from "@/modules/common/middleware/auth";

const router = Router();

router.get("/", authenticateToken, getTransfers);

router.post("/buy/:playerId", authenticateToken, buyPlayer);

export default router;

