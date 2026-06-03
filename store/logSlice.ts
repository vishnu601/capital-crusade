import type { StateCreator } from "zustand";
import type { GameStore } from "./index";
import type { LogEvent, LogEventType } from "@/types/game";

// ─── Slice type ───────────────────────────────────────────────────────────────

export interface LogSlice {
  // state
  events: LogEvent[];
  // actions
  /** Append an event, auto-stamping the real-world timestamp. */
  logEvent: (event: Omit<LogEvent, "timestamp">) => void;
  clearLog: () => void;
}

// ─── Slice creator ────────────────────────────────────────────────────────────

export const createLogSlice: StateCreator<GameStore, [], [], LogSlice> = (
  set,
) => ({
  events: [],

  logEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        { ...event, timestamp: Date.now() },
      ],
    })),

  clearLog: () => set({ events: [] }),
});
