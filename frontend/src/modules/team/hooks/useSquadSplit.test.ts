import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSquadSplit } from "./useSquadSplit";
import { Player } from "../types";

describe("useSquadSplit", () => {
  const mockPlayers: Player[] = [
    {
      id: "1",
      name: "Player 1",
      position: "GK",
      age: 25,
      country: "Country",
      value: "1000000",
      goals: 0,
      assists: 0,
      isOnTransferList: false,
      teamId: "team1",
      isStarter: true,
    },
    {
      id: "2",
      name: "Player 2",
      position: "DEF",
      age: 26,
      country: "Country",
      value: "2000000",
      goals: 1,
      assists: 2,
      isOnTransferList: false,
      teamId: "team1",
      isStarter: true,
    },
    {
      id: "3",
      name: "Player 3",
      position: "MID",
      age: 24,
      country: "Country",
      value: "3000000",
      goals: 3,
      assists: 4,
      isOnTransferList: false,
      teamId: "team1",
      isStarter: false,
    },
  ];

  it("should split players into starters and bench", () => {
    const { result } = renderHook(() => useSquadSplit(mockPlayers));

    expect(result.current.starters).toHaveLength(2);
    expect(result.current.bench).toHaveLength(1);
    expect(result.current.starters[0].id).toBe("1");
    expect(result.current.starters[1].id).toBe("2");
    expect(result.current.bench[0].id).toBe("3");
  });

  it("should return empty arrays when players is undefined", () => {
    const { result } = renderHook(() => useSquadSplit(undefined));

    expect(result.current.starters).toEqual([]);
    expect(result.current.bench).toEqual([]);
  });

  it("should return empty arrays when players is empty", () => {
    const { result } = renderHook(() => useSquadSplit([]));

    expect(result.current.starters).toEqual([]);
    expect(result.current.bench).toEqual([]);
  });

  it("should memoize the result", () => {
    const { result, rerender } = renderHook(
      ({ players }) => useSquadSplit(players),
      { initialProps: { players: mockPlayers } }
    );

    const firstResult = result.current;
    rerender({ players: mockPlayers });
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });
});

