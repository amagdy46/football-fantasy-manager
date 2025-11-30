import { Queue, Worker } from "bullmq";
import { PlayerPoolService } from "@/modules/team/services/playerPoolService";
import prisma from "@/config/database";
import redisConfig from "@/config/redis";
import { Position } from "@prisma/client";

const QUEUE_NAME = "team-creation";

export const teamCreationQueue = new Queue(QUEUE_NAME, {
  connection: redisConfig.connection,
});

export const teamCreationProcessor = async (job: any) => {
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

    const goalkeepers = await PlayerPoolService.getRandomPlayersByPosition(
      "GK",
      3
    );
    const defenders = await PlayerPoolService.getRandomPlayersByPosition(
      "DEF",
      6
    );
    const midfielders = await PlayerPoolService.getRandomPlayersByPosition(
      "MID",
      6
    );
    const attackers = await PlayerPoolService.getRandomPlayersByPosition(
      "ATT",
      5
    );

    const allPoolPlayers = [
      ...goalkeepers,
      ...defenders,
      ...midfielders,
      ...attackers,
    ];

    // Select Starters (1 GK, 4 DEF, 4 MID, 2 ATT) = 11 players
    // Logic: Pick the ones with highest value as default starters
    const sortByValue = (a: any, b: any) =>
      Number(b.marketValue) - Number(a.marketValue);

    const startingGK = goalkeepers
      .sort(sortByValue)
      .slice(0, 1)
      .map((p: any) => p.id);
    const startingDEF = defenders
      .sort(sortByValue)
      .slice(0, 4)
      .map((p: any) => p.id);
    const startingMID = midfielders
      .sort(sortByValue)
      .slice(0, 4)
      .map((p: any) => p.id);
    const startingATT = attackers
      .sort(sortByValue)
      .slice(0, 2)
      .map((p: any) => p.id);

    const starterIds = new Set([
      ...startingGK,
      ...startingDEF,
      ...startingMID,
      ...startingATT,
    ]);

    // 3. Create Player records assigned to the team
    for (const poolPlayer of allPoolPlayers) {
      await prisma.player.create({
        data: {
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
        },
      });
    }

    // 4. Set team isReady=true
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
