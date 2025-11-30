import { Router } from "express";
import { authRoutes } from "@/modules/auth";
import { teamRoutes } from "@/modules/team";
import { playerRoutes, transferRoutes } from "@/modules/transfers";

const router = Router();

// Mount module routes
router.use("/auth", authRoutes);
router.use("/team", teamRoutes);
router.use("/players", playerRoutes);
router.use("/transfers", transferRoutes);

export default router;
