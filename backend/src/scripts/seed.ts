import {
  PlayerPoolService,
  calculateMarketValue,
  randomInt,
} from "../modules/team/services/playerPoolService";
import prisma from "../config/database";
import { Prisma, Position } from "@/generated/prisma/client";

// AI Team configurations for a more realistic transfer market
const AI_TEAMS = [
  { name: "FC Barcelona B", listPercentage: 0.3 },
  { name: "Manchester United Reserves", listPercentage: 0.25 },
  { name: "Bayern Munich II", listPercentage: 0.35 },
  { name: "AC Milan Primavera", listPercentage: 0.2 },
  { name: "Ajax Jong", listPercentage: 0.4 },
];

interface PoolPlayer {
  id: string;
  name: string;
  position: Position;
  age: number;
  country: string;
  marketValue: Prisma.Decimal;
  goals: number;
  assists: number;
}

async function createAiTeam(
  teamName: string,
  listPercentage: number
): Promise<void> {
  console.log(`Creating AI team: ${teamName}...`);

  // Create a dummy user for the AI team
  const aiEmail = `ai-${teamName
    .toLowerCase()
    .replace(/\s+/g, "-")}@fantasy.ai`;

  let aiUser = await prisma.user.findUnique({ where: { email: aiEmail } });

  if (!aiUser) {
    aiUser = await prisma.user.create({
      data: {
        email: aiEmail,
        password: "ai-team-no-login", // AI teams cannot login
      },
    });
  }

  // Check if team already exists
  let team = await prisma.team.findUnique({ where: { userId: aiUser.id } });

  if (team) {
    console.log(`  Team ${teamName} already exists, updating players...`);
    // Delete existing players to refresh
    await prisma.player.deleteMany({ where: { teamId: team.id } });
  } else {
    team = await prisma.team.create({
      data: {
        userId: aiUser.id,
        name: teamName,
        budget: 10000000, // AI teams have more budget
        isReady: true,
      },
    });
  }

  // Get random players for the team
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

  // Sort by value to determine starters
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

  // Determine which players to list on transfer market (only non-starters)
  const nonStarters = allPoolPlayers.filter((p) => !starterIds.has(p.id));
  const playersToList = Math.floor(nonStarters.length * listPercentage);
  const listedPlayerIds = new Set(
    nonStarters
      .sort(() => Math.random() - 0.5)
      .slice(0, playersToList)
      .map((p) => p.id)
  );

  // Create players
  await prisma.player.createMany({
    data: allPoolPlayers.map((poolPlayer) => {
      const isListed = listedPlayerIds.has(poolPlayer.id);
      const baseValue = Number(poolPlayer.marketValue);
      // Asking price is 90-130% of market value
      const askingPrice = isListed
        ? Math.floor(baseValue * (0.9 + Math.random() * 0.4))
        : null;

      return {
        teamId: team!.id,
        name: poolPlayer.name,
        position: poolPlayer.position,
        age: poolPlayer.age,
        country: poolPlayer.country,
        value: poolPlayer.marketValue,
        goals: poolPlayer.goals,
        assists: poolPlayer.assists,
        isOnTransferList: isListed,
        askingPrice: askingPrice ? new Prisma.Decimal(askingPrice) : null,
        isStarter: starterIds.has(poolPlayer.id),
      };
    }),
  });

  const listedCount = Array.from(listedPlayerIds).length;
  console.log(
    `  Created team with 20 players, ${listedCount} listed on transfer market`
  );
}

async function main() {
  try {
    // 1. Update Player Pool
    await PlayerPoolService.seedPlayers();

    // 2. Update Active Players (in user teams) to match new values
    console.log("\nUpdating active players...");
    const activePlayers = await prisma.player.findMany();
    let updatedCount = 0;

    for (const p of activePlayers) {
      // Recalculate value using the new logic
      const newValue = calculateMarketValue(p.position, p.age);

      await prisma.player.update({
        where: { id: p.id },
        data: {
          value: new Prisma.Decimal(newValue),
          askingPrice:
            p.askingPrice && Number(p.askingPrice) > 5000000
              ? new Prisma.Decimal(newValue)
              : p.askingPrice,
        },
      });
      updatedCount++;
    }
    console.log(`Updated ${updatedCount} active players.`);

    // 3. Create AI teams with players on transfer market
    console.log("\n--- Creating AI Teams for Transfer Market ---");
    for (const aiTeam of AI_TEAMS) {
      await createAiTeam(aiTeam.name, aiTeam.listPercentage);
    }

    // 4. Summary of transfer market
    console.log("\n--- Transfer Market Summary ---");
    const listedPlayers = await prisma.player.findMany({
      where: { isOnTransferList: true },
      include: { team: { select: { name: true } } },
    });

    const byPosition = listedPlayers.reduce((acc, p) => {
      acc[p.position] = (acc[p.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`Total players on transfer market: ${listedPlayers.length}`);
    console.log(
      `By position: GK=${byPosition.GK || 0}, DEF=${byPosition.DEF || 0}, MID=${
        byPosition.MID || 0
      }, ATT=${byPosition.ATT || 0}`
    );

    const priceRange = listedPlayers.reduce(
      (acc, p) => {
        const price = Number(p.askingPrice);
        return {
          min: Math.min(acc.min, price),
          max: Math.max(acc.max, price),
        };
      },
      { min: Infinity, max: 0 }
    );

    console.log(
      `Price range: €${priceRange.min.toLocaleString()} - €${priceRange.max.toLocaleString()}`
    );

    // Test random selection
    console.log("\nTesting Random Selection:");
    const attackers = await PlayerPoolService.getRandomPlayersByPosition(
      "ATT",
      3
    );
    console.log(
      "Random Attackers:",
      attackers.map((p) => `${p.name} (${p.originalTeam}) - €${p.marketValue}`)
    );
  } catch (error) {
    console.error("Seeding script failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
