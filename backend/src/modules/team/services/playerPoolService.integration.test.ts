import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PlayerPoolService } from "@/modules/team/services/playerPoolService";
import prisma from "@/config/database";

describe("PlayerPoolService Integration", () => {
  beforeAll(async () => {
    await prisma.playerPool.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should seed the database with players", async () => {
    await PlayerPoolService.seedPlayers();

    const count = await prisma.playerPool.count();

    expect(count).toBeGreaterThan(0);

    const player = await prisma.playerPool.findFirst();
    expect(player).toBeDefined();
    expect(player?.marketValue.toNumber()).toBeGreaterThan(0);
    expect(player?.position).toBeDefined();
  });

  it("should fetch random players by position", async () => {
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
