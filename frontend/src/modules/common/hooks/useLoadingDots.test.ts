import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLoadingDots } from "./useLoadingDots";

describe("useLoadingDots", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should start with empty string", () => {
    const { result } = renderHook(() => useLoadingDots());
    expect(result.current).toBe("");
  });

  it("should add dots over time", () => {
    const { result } = renderHook(() => useLoadingDots());

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(".");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("..");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("...");
  });

  it("should reset after three dots", () => {
    const { result } = renderHook(() => useLoadingDots());

    act(() => {
      vi.advanceTimersByTime(1500); // 3 dots
    });
    expect(result.current).toBe("...");

    act(() => {
      vi.advanceTimersByTime(500); // Reset
    });
    expect(result.current).toBe("");
  });

  it("should clean up interval on unmount", () => {
    const { unmount } = renderHook(() => useLoadingDots());
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

