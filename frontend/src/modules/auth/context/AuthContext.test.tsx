import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "../hooks/useAuth";

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("AuthProvider", () => {
    it("should render children", () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should initialize with no user when localStorage is empty", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should initialize with user from localStorage", () => {
      const mockUser = { id: "123", email: "test@example.com" };
      const mockToken = "test-token";

      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("useAuth", () => {
    it("should throw error when used outside AuthProvider", () => {
      // Suppress console.error for this test
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleError.mockRestore();
    });

    it("should provide login function", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const mockUser = { id: "123", email: "test@example.com" };
      const mockToken = "new-token";

      act(() => {
        result.current.login(mockToken, mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem("token")).toBe(mockToken);
      expect(localStorage.getItem("user")).toBe(JSON.stringify(mockUser));
    });

    it("should provide logout function", () => {
      const mockUser = { id: "123", email: "test@example.com" };
      const mockToken = "test-token";

      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });
});
