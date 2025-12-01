import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/config/database";
import { teamCreationQueue } from "@/modules/team/jobs/teamCreationJob";
import { getJwtSecret } from "@/modules/common";
import { AuthResult } from "../types";

export class AuthServiceError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export class AuthService {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  static async authenticate(
    email: string,
    password: string
  ): Promise<AuthResult> {
    if (!email || !password) {
      throw new AuthServiceError(
        "MISSING_CREDENTIALS",
        "Email and password are required"
      );
    }

    if (!this.validatePassword(password)) {
      throw new AuthServiceError(
        "INVALID_PASSWORD",
        "Password must be at least 6 characters"
      );
    }

    if (!this.validateEmail(email)) {
      throw new AuthServiceError("INVALID_EMAIL", "Invalid email format");
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new AuthServiceError(
          "INVALID_CREDENTIALS",
          "Invalid credentials"
        );
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      await teamCreationQueue.add("create-team", {
        userId: user.id,
        email: user.email,
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      getJwtSecret()
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
