import prisma from "../../../config/database";
import seedData from "../../../data/seed-players.json";
import { Position, Prisma } from "@/generated/prisma/client";

interface SeedPlayer {
  id: number;
  name: string;
  position: string;
  dateOfBirth: string;
  nationality: string;
  team?: {
    name: string;
  };
}

// Utility to generate random integer
export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Smart algorithm to calculate market value
export const calculateMarketValue = (
  position: Position,
  age: number
): number => {
  // Probabilistic Tier System
  const rand = Math.random();
  let baseValue = 1000000; // 1M default

  if (rand < 0.05) {
    // 5% Superstar: 3.5M - 4.5M
    baseValue = randomInt(3500000, 4500000);
  } else if (rand < 0.2) {
    // 15% Star: 2.5M - 3.5M
    baseValue = randomInt(2500000, 3500000);
  } else if (rand < 0.6) {
    // 40% Regular: 1M - 2.5M
    baseValue = randomInt(1000000, 2500000);
  } else {
    // 40% Squad: 500k - 1M
    baseValue = randomInt(500000, 1000000);
  }

  // Age Modifier
  let ageModifier = 1.0;
  if (age < 22) ageModifier = 1.2; // Young potential
  else if (age > 32) ageModifier = 0.6; // Aging
  else if (age > 28) ageModifier = 0.9; // Post-peak

  return Math.floor(baseValue * ageModifier);
};

// Generate random stats based on position and value (proxy for skill)
export const generateStats = (position: Position, marketValue: number) => {
  let goals = 0;
  let assists = 0;
  const isHighValue = marketValue > 2500000;

  switch (position) {
    case "ATT":
      goals = isHighValue ? randomInt(10, 25) : randomInt(2, 12);
      assists = isHighValue ? randomInt(5, 15) : randomInt(0, 5);
      break;
    case "MID":
      goals = isHighValue ? randomInt(5, 15) : randomInt(1, 6);
      assists = isHighValue ? randomInt(8, 20) : randomInt(2, 8);
      break;
    case "DEF":
      goals = randomInt(0, 5);
      assists = randomInt(0, 5);
      break;
    case "GK":
      goals = 0;
      assists = randomInt(0, 1);
      break;
  }
  return { goals, assists };
};

// Map position string to Enum
export const mapPosition = (pos: string | null): Position => {
  if (!pos) return "MID";
  const p = pos.toLowerCase();
  if (p.includes("goalkeeper")) return "GK";
  if (p.includes("defence") || p.includes("defender") || p.includes("back"))
    return "DEF";
  if (p.includes("midfield")) return "MID";
  if (p.includes("offence") || p.includes("forward") || p.includes("wing"))
    return "ATT";
  return "MID";
};

export const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export class PlayerPoolService {
  static async seedPlayers(): Promise<void> {
    console.log("Starting player pool seeding from JSON data...");

    const players = seedData as SeedPlayer[];

    let successCount = 0;
    for (const p of players) {
      try {
        const position = mapPosition(p.position);
        const age = calculateAge(p.dateOfBirth);
        const marketValue = calculateMarketValue(position, age);
        const { goals, assists } = generateStats(position, marketValue);

        await prisma.playerPool.upsert({
          where: { externalId: String(p.id) },
          update: {
            marketValue: new Prisma.Decimal(marketValue),
            goals: goals,
            assists: assists,
          },
          create: {
            externalId: String(p.id),
            name: p.name,
            position: position,
            age: age,
            country: p.nationality,
            originalTeam: p.team?.name || "Free Agent",
            marketValue: new Prisma.Decimal(marketValue),
            goals: goals,
            assists: assists,
          },
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to seed player ${p.name}:`, err);
      }
    }

    console.log(`Seeded ${successCount} players from JSON data.`);
  }

  static async getRandomPlayersByPosition(position: Position, count: number) {
    const result = await prisma.$queryRaw<any[]>`
      SELECT * FROM "PlayerPool"
      WHERE position = ${position}::"Position"
      ORDER BY RANDOM()
      LIMIT ${count};
    `;

    return result;
  }
}
