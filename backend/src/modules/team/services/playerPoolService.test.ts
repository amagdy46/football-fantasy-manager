import { describe, it, expect } from "vitest";
import {
  mapPosition,
  calculateAge,
  calculateMarketValue,
  generateStats,
} from "./playerPoolService";

describe("PlayerPoolService Logic", () => {
  describe("mapPosition", () => {
    it('should map "Goalkeeper" to GK', () => {
      expect(mapPosition("Goalkeeper")).toBe("GK");
    });

    it('should map "Centre-Back" to DEF', () => {
      expect(mapPosition("Centre-Back")).toBe("DEF");
    });

    it('should map "Midfield" to MID', () => {
      expect(mapPosition("Central Midfield")).toBe("MID");
    });

    it('should map "Right Winger" to ATT', () => {
      expect(mapPosition("Right Winger")).toBe("ATT");
    });

    it("should default to MID for unknown positions", () => {
      expect(mapPosition(null)).toBe("MID");
      expect(mapPosition("Unknown")).toBe("MID");
    });
  });

  describe("calculateAge", () => {
    it("should calculate age correctly", () => {
      const dob = "1990-01-01";
      const age = calculateAge(dob);
      const expectedAge = new Date().getFullYear() - 1990;
      expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
      expect(age).toBeLessThanOrEqual(expectedAge);
    });
  });

  describe("calculateMarketValue", () => {
    it("should return a value greater than 0", () => {
      const value = calculateMarketValue("ATT", 25);
      expect(value).toBeGreaterThan(0);
    });

    it("should apply age modifier for young players", () => {
      const value = calculateMarketValue("ATT", 19);
      expect(typeof value).toBe("number");
    });
  });

  describe("generateStats", () => {
    it("should generate zero goals for GK", () => {
      const stats = generateStats("GK", 3000000);
      expect(stats.goals).toBe(0);
    });

    it("should generate stats for ATT with high value", () => {
      const stats = generateStats("ATT", 3000000);
      expect(stats.goals).toBeGreaterThanOrEqual(10);
    });

    it("should generate stats for ATT with low value", () => {
      const stats = generateStats("ATT", 1000000);
      expect(stats.goals).toBeGreaterThanOrEqual(2);
    });
  });
});
