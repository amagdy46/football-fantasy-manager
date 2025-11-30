import {
  PlayerPoolService,
  calculateMarketValue,
} from "../modules/team/services/playerPoolService";
import prisma from "../config/database";
import { Prisma } from "@prisma/client";

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
          // If they are on transfer list with high price, clamp it or reset it?
          // Let's just update askingPrice if it exists and is > 5M
          askingPrice:
            p.askingPrice && Number(p.askingPrice) > 5000000
              ? new Prisma.Decimal(newValue)
              : p.askingPrice,
        },
      });
      updatedCount++;
    }
    console.log(`Updated ${updatedCount} active players.`);

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
