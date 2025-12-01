import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test/test-utils";
import { PlayerCard } from "./PlayerCard";
import "@testing-library/jest-dom";
import { Player } from "../types";
import React from "react";

const mockListMutate = vi.fn();
const mockUnlistMutate = vi.fn();

vi.mock("../mutations", () => ({
  useListPlayerMutation: () => ({
    mutate: mockListMutate,
    isPending: false,
  }),
  useUnlistPlayerMutation: () => ({
    mutate: mockUnlistMutate,
    isPending: false,
  }),
}));

describe("PlayerCard", () => {
  const mockPlayer: Player = {
    id: "player-1",
    name: "Test Player",
    position: "MID",
    age: 25,
    country: "Test Country",
    value: "5000000",
    goals: 10,
    assists: 5,
    isOnTransferList: false,
    teamId: "team-1",
    isStarter: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show List for Transfer button when not on transfer list", () => {
    render(<PlayerCard player={mockPlayer} />);

    expect(screen.getByText("List for Transfer")).toBeInTheDocument();
  });

  it("should show Remove Listing button when on transfer list", () => {
    const listedPlayer = {
      ...mockPlayer,
      isOnTransferList: true,
      askingPrice: "6000000",
    };

    render(<PlayerCard player={listedPlayer} />);

    expect(screen.getByText("Remove Listing")).toBeInTheDocument();
    expect(screen.getByText(/For Sale:/)).toBeInTheDocument();
  });

  it("should open transfer modal when clicking List for Transfer", () => {
    render(<PlayerCard player={mockPlayer} />);

    fireEvent.click(screen.getByText("List for Transfer"));

    expect(
      screen.getByText(`List ${mockPlayer.name} for Transfer`)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Asking Price")).toBeInTheDocument();
  });

  it("should close modal when clicking Cancel", () => {
    render(<PlayerCard player={mockPlayer} />);

    fireEvent.click(screen.getByText("List for Transfer"));
    expect(
      screen.getByText(`List ${mockPlayer.name} for Transfer`)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(
      screen.queryByText(`List ${mockPlayer.name} for Transfer`)
    ).not.toBeInTheDocument();
  });

  it("should call list mutation with correct data when confirming", async () => {
    render(<PlayerCard player={mockPlayer} />);

    fireEvent.click(screen.getByText("List for Transfer"));

    const input = screen.getByLabelText("Asking Price") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "7000000" } });

    fireEvent.click(screen.getByText("Confirm Listing"));

    await waitFor(() => {
      expect(mockListMutate).toHaveBeenCalledWith(
        { playerId: "player-1", price: 7000000 },
        expect.any(Object)
      );
    });
  });

  it("should call unlist mutation when clicking Remove Listing", async () => {
    const listedPlayer = { ...mockPlayer, isOnTransferList: true };

    render(<PlayerCard player={listedPlayer} />);

    fireEvent.click(screen.getByText("Remove Listing"));

    await waitFor(() => {
      expect(mockUnlistMutate).toHaveBeenCalledWith("player-1");
    });
  });

  it("should apply correct position color", () => {
    const { rerender } = render(
      <PlayerCard player={{ ...mockPlayer, position: "GK" }} />
    );

    let badge = screen.getByText("GK");
    expect(badge).toHaveClass("bg-yellow-500");

    rerender(<PlayerCard player={{ ...mockPlayer, position: "DEF" }} />);
    badge = screen.getByText("DEF");
    expect(badge).toHaveClass("bg-blue-600");
  });
});
