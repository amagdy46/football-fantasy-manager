import { Request, Response } from "express";
import { AuthService, AuthServiceError } from "../services/authService";

export const authHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.authenticate(email, password);
    res.json(result);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      const statusMap: Record<string, number> = {
        MISSING_CREDENTIALS: 400,
        INVALID_PASSWORD: 400,
        INVALID_EMAIL: 400,
        INVALID_CREDENTIALS: 401,
      };
      const status = statusMap[error.code] || 400;
      return res.status(status).json({ message: error.message });
    }
    console.error("Auth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
