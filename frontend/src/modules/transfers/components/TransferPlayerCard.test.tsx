import { render, screen, fireEvent } from "@/test/test-utils";
import { TransferPlayerCard } from "./TransferPlayerCard";
import { TransferPlayer } from "../types";
import { describe, it, expect, vi } from "vitest";

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
  teamName: "Seller Team",
  isStarter: false,
};

describe("TransferPlayerCard", () => {
  it("renders player details correctly", () => {
    const onBuy = vi.fn();
    render(
      <TransferPlayerCard
        player={mockPlayer}
        onBuy={onBuy}
        isOwnPlayer={false}
        canBuy={true}
      />
    );

    expect(screen.getByText("Test Player")).toBeInTheDocument();
    expect(screen.getByText("Seller Team")).toBeInTheDocument();
    expect(screen.getByText("Price: €12,000,000")).toBeInTheDocument();
    expect(screen.getByText("ATT")).toBeInTheDocument();
  });

  it("calls onBuy when buy button is clicked", () => {
    const onBuy = vi.fn();
    render(
      <TransferPlayerCard
        player={mockPlayer}
        onBuy={onBuy}
        isOwnPlayer={false}
        canBuy={true}
      />
    );

    fireEvent.click(screen.getByText("Buy Player"));
    expect(onBuy).toHaveBeenCalledWith(mockPlayer);
  });

  it("disables buy button when canBuy is false", () => {
    const onBuy = vi.fn();
    render(
      <TransferPlayerCard
        player={mockPlayer}
        onBuy={onBuy}
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

  it("shows 'Your Player' if isOwnPlayer is true", () => {
    const onBuy = vi.fn();
    render(
      <TransferPlayerCard
        player={mockPlayer}
        onBuy={onBuy}
        isOwnPlayer={true}
        canBuy={false}
      />
    );

    expect(screen.getByText("Your Player")).toBeInTheDocument();
    expect(screen.queryByText("Buy Player")).not.toBeInTheDocument();
  });
});

