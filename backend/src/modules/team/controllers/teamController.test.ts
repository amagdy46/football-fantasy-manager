import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import routes from "@/routes";
import prisma from "@/config/database";

// Mock BullMQ and Redis
vi.mock("bullmq", () => {
  return {
    Queue: class {
      add() {}
      process() {}
    },
    Worker: class {
      on() {}
    },
  };
});

vi.mock("@/config/redis", () => ({
  default: {
    connection: {},
  },
}));

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);

describe("Team Controller Integration", () => {
  const testEmail = "testteam@example.com";
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Clean up
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

    // Create user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: "hashedpassword",
      },
    });
    userId = user.id;

    // Generate token
    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret"
    );

    // Create team manually
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

  it("should update team name", async () => {
    const newName = "Updated FC";
    const res = await request(app)
      .patch("/api/team")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: newName });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", newName);

    // Verify in DB
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
});
