import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Router } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import prisma from "@/config/database";
import { createTestApp } from "@/test/utils";
import { authenticateToken } from "@/modules/common/middleware/auth";
import {
  toggleTransferList,
  getTransfers,
  buyPlayer,
} from "./transferController";

const router = Router();
router.patch(
  "/players/:id/transfer-list",
  authenticateToken,
  toggleTransferList
);
router.get("/transfers", authenticateToken, getTransfers);
router.post("/transfers/buy/:playerId", authenticateToken, buyPlayer);

const app = createTestApp(router);

describe("Transfer Controller Integration", () => {
  const sellerEmail = "seller-integration@example.com";
  const buyerEmail = "buyer-integration@example.com";
  let sellerToken: string;
  let buyerToken: string;
  let sellerId: string;
  let buyerId: string;
  let playerId: string;

  beforeAll(async () => {
    await prisma.player.deleteMany({
      where: { team: { user: { email: { in: [sellerEmail, buyerEmail] } } } },
    });
    await prisma.team.deleteMany({
      where: { user: { email: { in: [sellerEmail, buyerEmail] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [sellerEmail, buyerEmail] } },
    });

    const seller = await prisma.user.create({
      data: {
        email: sellerEmail,
        password: "hashedpassword",
      },
    });
    sellerId = seller.id;
    sellerToken = jwt.sign(
      { userId: seller.id, email: seller.email },
      process.env.JWT_SECRET || "test-secret"
    );

    const sellerPlayers = Array.from({ length: 16 }).map((_, i) => ({
      name: `Seller Player ${i}`,
      position: "ATT" as const,
      age: 20 + i,
      country: "Test Country",
      value: 1000000,
    }));

    const sellerTeam = await prisma.team.create({
      data: {
        userId: seller.id,
        name: "Seller FC",
        isReady: true,
        budget: 5000000,
        players: {
          create: sellerPlayers,
        },
      },
      include: { players: true },
    });

    playerId = sellerTeam.players[0].id;

    const buyer = await prisma.user.create({
      data: {
        email: buyerEmail,
        password: "hashedpassword",
      },
    });
    buyerId = buyer.id;
    buyerToken = jwt.sign(
      { userId: buyer.id, email: buyer.email },
      process.env.JWT_SECRET || "test-secret"
    );

    await prisma.team.create({
      data: {
        userId: buyer.id,
        name: "Buyer FC",
        isReady: true,
        budget: 20000000,
        players: {
          create: [],
        },
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.player.deleteMany({
        where: { team: { user: { email: { in: [sellerEmail, buyerEmail] } } } },
      });
      await prisma.team.deleteMany({
        where: { user: { email: { in: [sellerEmail, buyerEmail] } } },
      });
      await prisma.user.deleteMany({
        where: { email: { in: [sellerEmail, buyerEmail] } },
      });
    } catch (e) {
      console.error("Cleanup error", e);
    }
    await prisma.$disconnect();
  });

  it("should list a player for transfer", async () => {
    const askingPrice = 2000000;
    const res = await request(app)
      .patch(`/api/players/${playerId}/transfer-list`)
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ askingPrice });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("isOnTransferList", true);
  });

  it("should see the listed player in transfer market", async () => {
    const res = await request(app)
      .get("/api/transfers")
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const listedPlayer = res.body.find((p: any) => p.id === playerId);
    expect(listedPlayer).toBeDefined();
    expect(listedPlayer).toHaveProperty("teamName", "Seller FC");
  });

  it("should fail to buy own player", async () => {
    const res = await request(app)
      .post(`/api/transfers/buy/${playerId}`)
      .set("Authorization", `Bearer ${sellerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/own player/i);
  });

  it("should fail to buy if insufficient funds", async () => {
    await request(app)
      .patch(`/api/players/${playerId}/transfer-list`)
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ askingPrice: 1000000000 });

    const res = await request(app)
      .post(`/api/transfers/buy/${playerId}`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient funds/i);

    await request(app)
      .patch(`/api/players/${playerId}/transfer-list`)
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ askingPrice: 2000000 });
  });

  it("should buy the player successfully", async () => {
    const res = await request(app)
      .post(`/api/transfers/buy/${playerId}`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { team: true },
    });
    expect(player?.team.name).toBe("Buyer FC");
    expect(player?.isOnTransferList).toBe(false);

    const buyerTeam = await prisma.team.findUnique({
      where: { userId: buyerId },
    });
    expect(Number(buyerTeam?.budget)).toBe(18100000);

    const sellerTeam = await prisma.team.findUnique({
      where: { userId: sellerId },
    });
    expect(Number(sellerTeam?.budget)).toBe(6900000);
  });
});
