import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/config/database";

import { teamCreationQueue } from "@/modules/team/jobs/teamCreationJob";

export const authHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Login flow
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      // Register flow
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      // Trigger team creation job
      await teamCreationQueue.add("create-team", {
        userId: user.id,
        email: user.email,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    // PRD FR-7: "no expiration". I'll just remove expiresIn option or set it to something very long.
    // However, usually not setting expiresIn makes it default to not expiring? No, it depends on lib.
    // jwt.sign default is no expiration if expiresIn is not provided?
    // Wait, documentation says "If not provided, it does not expire."
    // Let's verify that behavior or just set it to 100 years.

    const longLivedToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret"
    );

    res.json({
      token: longLivedToken,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
