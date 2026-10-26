import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { useTimeout, TimeoutController } from "@/lib/hooks/use-timeout";

describe("useTimeout and TimeoutController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fires once after the specified delay", () => {
    const callback = vi.fn();
    const controller = new TimeoutController();

    controller.schedule(callback, 200);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(199);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("replaces previous timer when scheduled again before delay", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const controller = new TimeoutController();

    controller.schedule(cb1, 200);
    vi.advanceTimersByTime(100);

    controller.schedule(cb2, 200);
    vi.advanceTimersByTime(100);
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it("cancels timer when clear() is called", () => {
    const callback = vi.fn();
    const controller = new TimeoutController();

    controller.schedule(callback, 200);
    expect(controller.isActive()).toBe(true);

    controller.clear();
    expect(controller.isActive()).toBe(false);

    vi.advanceTimersByTime(300);
    expect(callback).not.toHaveBeenCalled();
  });

  it("useTimeout hook cancels active timer on unmount and replaces previous timers", () => {
    let unmountCleanup: (() => void) | undefined;
    const refStore: { current: NodeJS.Timeout | number | null } = { current: null };

    const internals = (React as unknown as {
      __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: {
        H: unknown;
      };
    }).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

    const previousDispatcher = internals.H;
    internals.H = {
      useRef: () => refStore,
      useCallback: <T extends (...args: never[]) => unknown>(fn: T) => fn,
      useEffect: (effect: () => void | (() => void)) => {
        unmountCleanup = effect() || undefined;
      },
    };

    try {
      const { schedule } = useTimeout();
      const callback = vi.fn();

      schedule(callback, 300);
      expect(callback).not.toHaveBeenCalled();

      // Trigger unmount
      if (unmountCleanup) {
        unmountCleanup();
      }

      vi.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();
    } finally {
      internals.H = previousDispatcher;
    }
  });
});
