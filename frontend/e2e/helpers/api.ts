/// <reference types="node" />
import { request as playwrightRequest } from "@playwright/test";

const API_URL = process.env.E2E_API_URL || "http://localhost:3001/api";

export interface Team {
  id: string;
  name: string;
  budget: string;
  isReady: boolean;
  players: Player[];
}

export interface Player {
  id: string;
  name: string;
  position: string;
  isOnTransferList: boolean;
  askingPrice: string | null;
}

/**
 * Helper for API calls during E2E tests
 */
export class ApiHelper {
  private static async getRequestContext() {
    return await playwrightRequest.newContext();
  }

  static async authenticate(
    email: string,
    password: string
  ): Promise<{ token: string }> {
    const context = await this.getRequestContext();
    try {
      const response = await context.post(`${API_URL}/auth`, {
        data: { email, password },
      });
      if (!response.ok()) throw new Error(`Auth failed: ${response.status()}`);
      return response.json();
    } finally {
      await context.dispose();
    }
  }

  static async getTeam(token: string): Promise<Team> {
    const context = await this.getRequestContext();
    try {
      const response = await context.get(`${API_URL}/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok())
        throw new Error(`Get team failed: ${response.status()}`);
      return response.json();
    } finally {
      await context.dispose();
    }
  }

  static async getTeamStatus(token: string): Promise<{ isReady: boolean }> {
    const context = await this.getRequestContext();
    try {
      const response = await context.get(`${API_URL}/team/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok())
        throw new Error(`Get status failed: ${response.status()}`);
      return response.json();
    } finally {
      await context.dispose();
    }
  }

  static async waitForTeamReady(
    token: string,
    maxWaitMs = 30000
  ): Promise<Team> {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getTeamStatus(token);
      if (status.isReady) return this.getTeam(token);
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error("Team creation timed out");
  }

  static async buyPlayer(token: string, playerId: string): Promise<void> {
    const context = await this.getRequestContext();
    try {
      const response = await context.post(
        `${API_URL}/transfers/buy/${playerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok()) {
        const error = await response.json();
        throw new Error(`Buy failed: ${error.message || response.status()}`);
      }
    } finally {
      await context.dispose();
    }
  }
}
