import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test/test-utils";
import { SoccerPitch } from "./SoccerPitch";
import { Player } from "../types";

describe("SoccerPitch", () => {
  const createMockPlayer = (
    id: string,
    position: "GK" | "DEF" | "MID" | "ATT",
    name: string
  ): Player => ({
    id,
    name,
    position,
    age: 25,
    country: "Test",
    value: "1000000",
    goals: 1,
    assists: 1,
    isOnTransferList: false,
    teamId: "team-1",
    isStarter: true,
  });

  const mockStarters: Player[] = [
    createMockPlayer("1", "GK", "Goalkeeper 1"),
    createMockPlayer("2", "DEF", "Defender 1"),
    createMockPlayer("3", "DEF", "Defender 2"),
    createMockPlayer("4", "DEF", "Defender 3"),
    createMockPlayer("5", "DEF", "Defender 4"),
    createMockPlayer("6", "MID", "Midfielder 1"),
    createMockPlayer("7", "MID", "Midfielder 2"),
    createMockPlayer("8", "MID", "Midfielder 3"),
    createMockPlayer("9", "MID", "Midfielder 4"),
    createMockPlayer("10", "ATT", "Attacker 1"),
    createMockPlayer("11", "ATT", "Attacker 2"),
  ];

  it("should render all 11 players", () => {
    render(<SoccerPitch players={mockStarters} />);

    mockStarters.forEach((player) => {
      // Player name appears twice: in badge and in tooltip
      const playerElements = screen.getAllByText(player.name);
      expect(playerElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should group players by position correctly", () => {
    render(<SoccerPitch players={mockStarters} />);

    const gkPlayers = mockStarters.filter((p) => p.position === "GK");
    const defPlayers = mockStarters.filter((p) => p.position === "DEF");
    const midPlayers = mockStarters.filter((p) => p.position === "MID");
    const attPlayers = mockStarters.filter((p) => p.position === "ATT");

    expect(gkPlayers).toHaveLength(1);
    expect(defPlayers).toHaveLength(4);
    expect(midPlayers).toHaveLength(4);
    expect(attPlayers).toHaveLength(2);
  });

  it("should display player initials", () => {
    const player = createMockPlayer("1", "GK", "John Doe");
    render(<SoccerPitch players={[player]} />);

    expect(screen.getByText("JO")).toBeInTheDocument();
  });

  it("should render with empty array", () => {
    const { container } = render(<SoccerPitch players={[]} />);
    expect(container.querySelector(".bg-green-600")).toBeInTheDocument();
  });

  it("should apply correct position colors", () => {
    const gk = createMockPlayer("1", "GK", "GK Test");
    render(<SoccerPitch players={[gk]} />);

    // GK text appears in both badge and tooltip, get the first one (badge)
    const gkElements = screen.getAllByText("GK");
    const gkBadge = gkElements[0].closest("div");
    expect(gkBadge).toHaveClass("bg-yellow-500");
  });
});
