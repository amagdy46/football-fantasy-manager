import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Router } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import prisma from "@/config/database";
import { createTestApp } from "@/test/utils";
import { authenticateToken } from "@/modules/common/middleware/auth";
import { getTeam, updateTeamName, getTeamStatus } from "./teamController";

const router = Router();
router.get("/team", authenticateToken, getTeam);
router.patch("/team", authenticateToken, updateTeamName);
router.get("/team/status", authenticateToken, getTeamStatus);

const app = createTestApp(router);

describe("Team Controller Integration", () => {
  const testEmail = "testteam-integration@example.com";
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    if (existingUser) {
      await prisma.player.deleteMany({
        where: { team: { userId: existingUser.id } },
      });
      await prisma.team.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: "hashedpassword",
      },
    });
    userId = user.id;

    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "test-secret"
    );

    await prisma.team.create({
      data: {
        userId: user.id,
        name: "Test Team",
        isReady: true,
        players: {
          create: [
            {
              name: "Test Player",
              position: "ATT",
              age: 25,
              country: "Test Country",
              value: 1000000,
            },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.player.deleteMany({ where: { team: { userId } } });
      await prisma.team.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    } catch (e) {
      console.error("Cleanup error", e);
    }
    await prisma.$disconnect();
  });

  it("should get team details", async () => {
    const res = await request(app)
      .get("/api/team")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Test Team");
    expect(res.body.players).toHaveLength(1);
    expect(res.body.players[0]).toHaveProperty("name", "Test Player");
  });

  it("should get team status", async () => {
    const res = await request(app)
      .get("/api/team/status")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("isReady", true);
    expect(res.body).toHaveProperty("teamId");
  });

  it("should update team name", async () => {
    const newName = "Updated FC";
    const res = await request(app)
      .patch("/api/team")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: newName });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", newName);

    const team = await prisma.team.findUnique({ where: { userId } });
    expect(team?.name).toBe(newName);
  });

  it("should fail to update team name with empty string", async () => {
    const res = await request(app)
      .patch("/api/team")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
  });

  it("should fail without authentication", async () => {
    const res = await request(app).get("/api/team");

    expect(res.status).toBe(401);
  });
});
