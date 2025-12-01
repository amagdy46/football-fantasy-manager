import type { Position } from "@/types";

export const formatCurrency = (value: string | number): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(num);
};

export const positionColors: Record<Position, string> = {
  GK: "bg-yellow-500",
  DEF: "bg-blue-600",
  MID: "bg-green-600",
  ATT: "bg-red-600",
};

export const getPositionColor = (position: string): string => {
  return positionColors[position as Position] || "bg-gray-600";
};
