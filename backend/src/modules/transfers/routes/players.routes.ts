import { Router } from "express";
import { toggleTransferList } from "../controllers/transferController";
import { authenticateToken } from "@/modules/common/middleware/auth";

const router = Router();

// PATCH /api/players/:id/transfer-list
router.patch("/:id/transfer-list", authenticateToken, toggleTransferList);

export default router;

