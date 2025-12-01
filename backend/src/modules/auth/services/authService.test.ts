import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService, AuthServiceError } from "./authService";
import prisma from "@/config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

vi.mock("@/config/database", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

vi.mock("@/modules/team/jobs/teamCreationJob", () => ({
  teamCreationQueue: {
    add: vi.fn(),
  },
}));

vi.mock("@/modules/common", () => ({
  getJwtSecret: vi.fn().mockReturnValue("test-secret"),
}));

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateEmail", () => {
    it("should return true for valid email", () => {
      expect(AuthService.validateEmail("test@example.com")).toBe(true);
      expect(AuthService.validateEmail("user.name@domain.co.uk")).toBe(true);
    });

    it("should return false for invalid email", () => {
      expect(AuthService.validateEmail("invalid")).toBe(false);
      expect(AuthService.validateEmail("invalid@")).toBe(false);
      expect(AuthService.validateEmail("@domain.com")).toBe(false);
      expect(AuthService.validateEmail("invalid@domain")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should return true for password with 6+ characters", () => {
      expect(AuthService.validatePassword("123456")).toBe(true);
      expect(AuthService.validatePassword("password123")).toBe(true);
    });

    it("should return false for password with less than 6 characters", () => {
      expect(AuthService.validatePassword("12345")).toBe(false);
      expect(AuthService.validatePassword("")).toBe(false);
    });
  });

  describe("authenticate", () => {
    it("should login existing user with correct password", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        password: "hashedpassword",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue("mock-token" as never);

      const result = await AuthService.authenticate(
        "test@example.com",
        "password123"
      );

      expect(result).toEqual({
        token: "mock-token",
        user: { id: "user-1", email: "test@example.com" },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
    });

    it("should register new user when email doesn't exist", async () => {
      const mockUser = {
        id: "new-user",
        email: "new@example.com",
        password: "hashedpassword",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashedpassword" as never);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);
      vi.mocked(jwt.sign).mockReturnValue("mock-token" as never);

      const { teamCreationQueue } = await import(
        "@/modules/team/jobs/teamCreationJob"
      );

      const result = await AuthService.authenticate(
        "new@example.com",
        "password123"
      );

      expect(result).toEqual({
        token: "mock-token",
        user: { id: "new-user", email: "new@example.com" },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: "new@example.com", password: "hashedpassword" },
      });
      expect(teamCreationQueue.add).toHaveBeenCalledWith("create-team", {
        userId: "new-user",
        email: "new@example.com",
      });
    });

    it("should throw MISSING_CREDENTIALS if email is missing", async () => {
      await expect(
        AuthService.authenticate("", "password123")
      ).rejects.toMatchObject({
        code: "MISSING_CREDENTIALS",
      });
    });

    it("should throw MISSING_CREDENTIALS if password is missing", async () => {
      await expect(
        AuthService.authenticate("test@example.com", "")
      ).rejects.toMatchObject({
        code: "MISSING_CREDENTIALS",
      });
    });

    it("should throw INVALID_PASSWORD if password is too short", async () => {
      await expect(
        AuthService.authenticate("test@example.com", "12345")
      ).rejects.toMatchObject({
        code: "INVALID_PASSWORD",
      });
    });

    it("should throw INVALID_EMAIL if email format is invalid", async () => {
      await expect(
        AuthService.authenticate("invalid-email", "password123")
      ).rejects.toMatchObject({
        code: "INVALID_EMAIL",
      });
    });

    it("should throw INVALID_CREDENTIALS if password is wrong", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        password: "hashedpassword",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        AuthService.authenticate("test@example.com", "wrongpassword")
      ).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
      });
    });
  });
});
