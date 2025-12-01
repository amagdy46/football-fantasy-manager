import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { Router } from "express";
import request from "supertest";
import prisma from "@/config/database";
import { createTestApp } from "@/test/utils";
import { authHandler } from "./authController";

vi.mock("@/modules/team/jobs/teamCreationJob", () => ({
  teamCreationQueue: {
    add: vi.fn(),
  },
}));

const router = Router();
router.post("/auth", authHandler);

const app = createTestApp(router);

describe("Auth Controller Integration", () => {
  const testEmail = "testauth-integration@example.com";
  const testPassword = "password123";

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await prisma.$disconnect();
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", testEmail);
    expect(res.body.user).toHaveProperty("id");
  });

  it("should login an existing user", async () => {
    const res = await request(app).post("/api/auth").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testEmail);
  });

  it("should reject invalid email", async () => {
    const res = await request(app).post("/api/auth").send({
      email: "invalid-email",
      password: testPassword,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid email");
  });

  it("should reject short password", async () => {
    const res = await request(app).post("/api/auth").send({
      email: "valid@example.com",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Password must be at least 6 characters"
    );
  });

  it("should reject wrong password for existing user", async () => {
    const res = await request(app).post("/api/auth").send({
      email: testEmail,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });
});
