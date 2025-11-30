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

describe("Transfer Controller Integration", () => {
  const sellerEmail = "seller@example.com";
  const buyerEmail = "buyer@example.com";
  let sellerToken: string;
  let buyerToken: string;
  let sellerId: string;
  let buyerId: string;
  let playerId: string;

  beforeAll(async () => {
    // Clean up
    await prisma.player.deleteMany({
      where: { team: { user: { email: { in: [sellerEmail, buyerEmail] } } } },
    });
    await prisma.team.deleteMany({
      where: { user: { email: { in: [sellerEmail, buyerEmail] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [sellerEmail, buyerEmail] } },
    });

    // Create Seller
    const seller = await prisma.user.create({
      data: {
        email: sellerEmail,
        password: "hashedpassword",
      },
    });
    sellerId = seller.id;
    sellerToken = jwt.sign(
      { userId: seller.id, email: seller.email },
      process.env.JWT_SECRET || "default_secret"
    );

    // Create Seller Team (with > 15 players to allow selling)
    // We need 16 players to safely sell 1.
    const sellerPlayers = Array.from({ length: 16 }).map((_, i) => ({
      name: `Seller Player ${i}`,
      position: "ATT" as const, // Cast to literal type
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

    // Create Buyer
    const buyer = await prisma.user.create({
      data: {
        email: buyerEmail,
        password: "hashedpassword",
      },
    });
    buyerId = buyer.id;
    buyerToken = jwt.sign(
      { userId: buyer.id, email: buyer.email },
      process.env.JWT_SECRET || "default_secret"
    );

    // Create Buyer Team
    await prisma.team.create({
      data: {
        userId: buyer.id,
        name: "Buyer FC",
        isReady: true,
        budget: 20000000, // Rich buyer
        players: {
          create: [], // Empty squad
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
    expect(res.body.askingPrice).toBe(String(askingPrice)); // Prisma returns Decimal as string usually in JSON? Or we used Number in controller
    // If controller returns prisma object directly, it might be string. 
    // Wait, controller does res.json(updatedPlayer).
    // Express res.json converts Decimal to string or similar?
    // Let's assume it's roughly correct.
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
      .set("Authorization", `Bearer ${sellerToken}`); // Seller tries to buy own player

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/own player/i);
  });

  it("should fail to buy if insufficient funds", async () => {
    // Create a poor buyer temporarily
    // Or just try to buy a very expensive player.
    // Let's update asking price to be huge.
    await request(app)
      .patch(`/api/players/${playerId}/transfer-list`)
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ askingPrice: 1000000000 }); // 1 Billion

    const res = await request(app)
      .post(`/api/transfers/buy/${playerId}`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient funds/i);

    // Reset price
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
    // Transaction price = 2M * 0.95 = 1.9M.
    // Buyer budget was 20M. New budget should be 18.1M.
    // Seller budget was 5M. New budget should be 6.9M.
    
    // Verify player moved
    const player = await prisma.player.findUnique({ where: { id: playerId }, include: { team: true } });
    expect(player?.team.name).toBe("Buyer FC");
    expect(player?.isOnTransferList).toBe(false);

    // Verify Buyer Budget
    const buyerTeam = await prisma.team.findUnique({ where: { userId: buyerId } });
    // 20000000 - 1900000 = 18100000
    expect(Number(buyerTeam?.budget)).toBe(18100000);

    // Verify Seller Budget
    const sellerTeam = await prisma.team.findUnique({ where: { userId: sellerId } });
    // 5000000 + 1900000 = 6900000
    expect(Number(sellerTeam?.budget)).toBe(6900000);
  });
});

