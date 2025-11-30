import { Router } from "express";
import { authHandler } from "@/modules/auth/controllers/authController";

const router = Router();

router.post("/", authHandler);

export default router;
