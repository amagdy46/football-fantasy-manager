import { Router } from "express";
import {
  getTeam,
  updateTeamName,
  getTeamStatus,
} from "@/modules/team/controllers/teamController";
import { authenticateToken } from "@/modules/common/middleware/auth";

const router = Router();

// All team routes require authentication
router.use(authenticateToken);

router.get("/", getTeam);
router.patch("/", updateTeamName);
router.get("/status", getTeamStatus);

export default router;
