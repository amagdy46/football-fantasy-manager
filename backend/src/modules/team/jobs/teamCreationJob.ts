import { Queue, Worker, Job } from "bullmq";
import { PlayerPoolService } from "@/modules/team/services/playerPoolService";
import prisma from "@/config/database";
import redisConfig from "@/config/redis";
import { PoolPlayer, TeamCreationJobData } from "../types";

const QUEUE_NAME = "team-creation";

export const teamCreationQueue = new Queue<TeamCreationJobData>(QUEUE_NAME, {
  connection: redisConfig.connection,
});

export const teamCreationProcessor = async (job: Job<TeamCreationJobData>) => {
  const { userId, email } = job.data;
  console.log(`Processing team creation for user ${email} (${userId})`);

  try {
    const team = await prisma.team.create({
      data: {
        userId,
        name: `Team ${email.split("@")[0]}`,
        budget: 5000000,
        isReady: false,
      },
    });

    const goalkeepers = (await PlayerPoolService.getRandomPlayersByPosition(
      "GK",
      3
    )) as PoolPlayer[];
    const defenders = (await PlayerPoolService.getRandomPlayersByPosition(
      "DEF",
      6
    )) as PoolPlayer[];
    const midfielders = (await PlayerPoolService.getRandomPlayersByPosition(
      "MID",
      6
    )) as PoolPlayer[];
    const attackers = (await PlayerPoolService.getRandomPlayersByPosition(
      "ATT",
      5
    )) as PoolPlayer[];

    const allPoolPlayers: PoolPlayer[] = [
      ...goalkeepers,
      ...defenders,
      ...midfielders,
      ...attackers,
    ];

    const sortByValue = (a: PoolPlayer, b: PoolPlayer) =>
      Number(b.marketValue) - Number(a.marketValue);

    const startingGK = [...goalkeepers]
      .sort(sortByValue)
      .slice(0, 1)
      .map((p) => p.id);
    const startingDEF = [...defenders]
      .sort(sortByValue)
      .slice(0, 4)
      .map((p) => p.id);
    const startingMID = [...midfielders]
      .sort(sortByValue)
      .slice(0, 4)
      .map((p) => p.id);
    const startingATT = [...attackers]
      .sort(sortByValue)
      .slice(0, 2)
      .map((p) => p.id);

    const starterIds = new Set([
      ...startingGK,
      ...startingDEF,
      ...startingMID,
      ...startingATT,
    ]);

    await prisma.player.createMany({
      data: allPoolPlayers.map((poolPlayer) => ({
        teamId: team.id,
        name: poolPlayer.name,
        position: poolPlayer.position,
        age: poolPlayer.age,
        country: poolPlayer.country,
        value: poolPlayer.marketValue,
        goals: poolPlayer.goals,
        assists: poolPlayer.assists,
        isOnTransferList: false,
        isStarter: starterIds.has(poolPlayer.id),
      })),
    });

    await prisma.team.update({
      where: { id: team.id },
      data: { isReady: true },
    });

    console.log(`Team created successfully for user ${userId}`);
    return { teamId: team.id, success: true };
  } catch (error) {
    console.error(`Failed to create team for user ${userId}:`, error);
    throw error;
  }
};

const worker = new Worker(QUEUE_NAME, teamCreationProcessor, {
  connection: redisConfig.connection,
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});
