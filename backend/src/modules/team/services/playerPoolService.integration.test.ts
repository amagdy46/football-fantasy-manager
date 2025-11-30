import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PlayerPoolService } from "@/modules/team/services/playerPoolService";
import prisma from "@/config/database";

describe("PlayerPoolService Integration", () => {
  beforeAll(async () => {
    // Optional: Clean up before test if you want a fresh seed every time
    // await prisma.playerPool.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should seed the database with players", async () => {
    // 1. Run seeding
    await PlayerPoolService.seedPlayers();

    // 2. Check count
    const count = await prisma.playerPool.count();
    console.log(`Integration Test: Database has ${count} players`);

    // 3. Assert
    expect(count).toBeGreaterThan(0);

    // 4. Check data integrity of a random player
    const player = await prisma.playerPool.findFirst();
    expect(player).toBeDefined();
    expect(player?.marketValue.toNumber()).toBeGreaterThan(0);
    expect(player?.position).toBeDefined();
  });

  it("should fetch random players by position", async () => {
    // Ensure data exists
    const count = await prisma.playerPool.count();
    if (count < 5) await PlayerPoolService.seedPlayers();

    const attackers = await PlayerPoolService.getRandomPlayersByPosition(
      "ATT",
      3
    );

    expect(attackers).toHaveLength(3);
    expect(attackers[0].position).toBe("ATT");
  });
});
