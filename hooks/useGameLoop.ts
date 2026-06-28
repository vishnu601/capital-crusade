/**
 * useGameLoop — drives the simulation clock via setInterval.
 *
 * 3650 days × 165 ms ≈ 10 min at 1× speed.
 * At 2×: ~5 min. At 4×: ~2.5 min.
 *
 * Interval is cleared and recreated whenever isRunning, isPaused, or speed
 * changes — so speed adjustments take effect immediately.
 */

import { useEffect } from "react";
import { useGameStore } from "@/store/index";

/** Base milliseconds per in-game day at 1× speed. */
export const BASE_TICK_MS = 165;

export function useGameLoop(): void {
  const isRunning  = useGameStore((s) => s.isRunning);
  const isPaused   = useGameStore((s) => s.isPaused);
  const speed      = useGameStore((s) => s.speed);
  const tickEngine = useGameStore((s) => s.tickEngine);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const intervalMs = BASE_TICK_MS / speed;
    const id = setInterval(() => {
      tickEngine();
    }, intervalMs);

    return () => clearInterval(id);
  }, [isRunning, isPaused, speed, tickEngine]);
}
