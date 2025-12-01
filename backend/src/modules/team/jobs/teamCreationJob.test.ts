import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import prisma from "@/config/database";
import { PlayerPoolService } from "@/modules/team/services/playerPoolService";

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

import { teamCreationProcessor } from "@/modules/team/jobs/teamCreationJob";

describe("Team Creation Worker Logic", () => {
  const testEmail = `worker_test_${Date.now()}@example.com`;
  let userId: string;

  beforeAll(async () => {
    await PlayerPoolService.seedPlayers();

    const gk = await prisma.playerPool.count({ where: { position: "GK" } });
    const def = await prisma.playerPool.count({ where: { position: "DEF" } });
    const mid = await prisma.playerPool.count({ where: { position: "MID" } });
    const att = await prisma.playerPool.count({ where: { position: "ATT" } });
  });

  afterAll(async () => {
    if (userId) {
      const team = await prisma.team.findFirst({ where: { userId } });
      if (team) {
        await prisma.player.deleteMany({ where: { teamId: team.id } });
        await prisma.team.delete({ where: { id: team.id } });
      }
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  it("should create a team with 20 players for a new user", async () => {
    const uniqueEmail = `worker_test_${Date.now()}_${Math.random()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        password: "hash",
      },
    });
    userId = user.id;

    const jobMock = {
      data: { userId: user.id, email: user.email },
    } as any;

    const result = await teamCreationProcessor(jobMock);

    expect(result.success).toBe(true);

    const team = await prisma.team.findUnique({
      where: { id: result.teamId },
      include: { players: true },
    });

    expect(team).toBeDefined();
    expect(team?.players).toHaveLength(20);
  });
});
