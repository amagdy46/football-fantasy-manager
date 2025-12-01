import { render, screen, fireEvent } from "../../../test/test-utils";
import { TransferPlayerCard } from "./TransferPlayerCard";
import { TransferPlayer } from "../types";
import { Player } from "../../../types";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import React from "react";

const mockPlayer: TransferPlayer = {
  id: "1",
  name: "Test Player",
  position: "ATT",
  age: 25,
  country: "Testland",
  value: "10000000",
  goals: 10,
  assists: 5,
  isOnTransferList: true,
  askingPrice: "12000000",
  teamId: "other-team",
  isStarter: false,
  teamName: "Seller Team",
  isOwnPlayer: false,
} as TransferPlayer;

describe("TransferPlayerCard", () => {
  it("calls onBuy when buy button is clicked", () => {
    const onBuy = vi.fn();
    const onUnlist = vi.fn();
    render(
      <TransferPlayerCard
        player={mockPlayer}
        onBuy={onBuy}
        onUnlist={onUnlist}
        isOwnPlayer={false}
        canBuy={true}
      />
    );

    fireEvent.click(screen.getByText("Buy Player"));
    expect(onBuy).toHaveBeenCalledWith(mockPlayer);
  });

  it("disables buy button when canBuy is false", () => {
    const onBuy = vi.fn();
    const onUnlist = vi.fn();
    render(
      <TransferPlayerCard
        player={mockPlayer}
        onBuy={onBuy}
        onUnlist={onUnlist}
        isOwnPlayer={false}
        canBuy={false}
        disabledReason="Insufficient Funds"
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Insufficient Funds");

    fireEvent.click(button);
    expect(onBuy).not.toHaveBeenCalled();
  });

  it("shows unlist button for own player", () => {
    const onBuy = vi.fn();
    const onUnlist = vi.fn();
    render(
      <TransferPlayerCard
        player={mockPlayer}
        onBuy={onBuy}
        onUnlist={onUnlist}
        isOwnPlayer={true}
        canBuy={false}
      />
    );

    expect(screen.getByText("Remove from Market")).toBeInTheDocument();
    expect(screen.queryByText("Buy Player")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Remove from Market"));
    expect(onUnlist).toHaveBeenCalledWith((mockPlayer as unknown as Player).id);
  });
});
