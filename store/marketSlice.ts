import type { StateCreator } from "zustand";
import type { GameStore }    from "./index";
import type { NewsEvent }    from "@/types/game";
import { ASSETS }            from "@/lib/assets";
import { TOTAL_GAME_DAYS }   from "@/lib/constants";
import { generateSeed }      from "@/lib/engine/seed";
import { generateAllPaths }  from "@/lib/engine/priceGenerator";
import { generateNewsTimeline } from "@/lib/engine/newsGenerator";
import { applyNewsImpacts }  from "@/lib/engine/newsImpact";
import { dayToYear }         from "@/lib/selectors";

// ─── Slice type ───────────────────────────────────────────────────────────────

export interface MarketSlice {
  gameSeed:            number;
  currentDay:          number;
  currentYear:         number;
  isRunning:           boolean;
  isPaused:            boolean;
  speed:               1 | 2 | 4;
  quitEarly:           boolean;
  prices:              Record<string, number>;
  priceHistory:        Record<string, number[]>;
  pricePaths:          Record<string, number[]>;
  newsTimeline:        NewsEvent[];
  firedNewsIds:        string[];
  activeNews:          NewsEvent | null;
  gameStartTimestamp:  number | null;
  totalPausedMs:       number;
  lastPauseTimestamp:  number | null;

  startSimulation:  (seed?: number) => void;
  tickEngine:       () => void;
  pauseSimulation:  () => void;
  resumeSimulation: () => void;
  endSimulation:    () => void;
  quitSimulation:   () => void;
  setSpeed:         (speed: 1 | 2 | 4) => void;
  resetMarket:      () => void;
}

// ─── Module-level constants ───────────────────────────────────────────────────

const ASSET_IDS = ASSETS.map((a) => a.id);

const EMPTY_PATHS: Record<string, number[]> =
  Object.fromEntries(ASSET_IDS.map((id) => [id, []]));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildInitialPrices(): Record<string, number> {
  return Object.fromEntries(ASSET_IDS.map((id) => [id, 100]));
}

function buildInitialHistory(): Record<string, number[]> {
  return Object.fromEntries(ASSET_IDS.map((id) => [id, [100]]));
}

/**
 * Read prices for `day` from pre-generated paths and write them into
 * `prices` and `history` in-place. Returns both for use in `set()`.
 * Pre-allocated history arrays are written to directly (O(1) per asset).
 */
function applyDayPrices(
  paths:   Record<string, number[]>,
  history: Record<string, number[]>,
  day:     number,
  fallbackPrices: Record<string, number>,
): { prices: Record<string, number>; priceHistory: Record<string, number[]> } {
  const prices: Record<string, number> = {};
  for (const id of ASSET_IDS) {
    const p = paths[id][day] ?? fallbackPrices[id];
    prices[id]    = p;
    history[id][day] = p;
  }
  // Shallow-clone outer object so Zustand sees a new reference
  return { prices, priceHistory: { ...history } };
}

// ─── Slice creator ────────────────────────────────────────────────────────────

export const createMarketSlice: StateCreator<GameStore, [], [], MarketSlice> = (
  set,
  get,
) => ({
  gameSeed:           0,
  currentDay:         0,
  currentYear:        0,
  isRunning:          false,
  isPaused:           false,
  speed:              1,
  quitEarly:          false,
  prices:             buildInitialPrices(),
  priceHistory:       buildInitialHistory(),
  pricePaths:         EMPTY_PATHS,
  newsTimeline:       [],
  firedNewsIds:       [],
  activeNews:         null,
  gameStartTimestamp: null,
  totalPausedMs:      0,
  lastPauseTimestamp: null,

  startSimulation: (providedSeed?: number) => {
    const seed       = providedSeed ?? generateSeed();
    const basePaths  = generateAllPaths(seed);
    const news       = generateNewsTimeline(seed);
    const finalPaths = applyNewsImpacts(basePaths, news, ASSETS);

    // Pre-allocate history arrays — tickEngine writes to index directly (O(1))
    const day0Prices:  Record<string, number>   = {};
    const day0History: Record<string, number[]> = {};
    for (const id of ASSET_IDS) {
      day0Prices[id]           = finalPaths[id][0];
      const arr                = new Array<number>(TOTAL_GAME_DAYS);
      arr[0]                   = finalPaths[id][0];
      day0History[id]          = arr;
    }

    get().logEvent({ type: "game_started", day: 0, payload: { seed, newsCount: news.length } });
    get().setPhase("simulation");

    set({
      gameSeed:           seed,
      currentDay:         0,
      currentYear:        0,
      isRunning:          true,
      isPaused:           false,
      quitEarly:          false,
      prices:             day0Prices,
      priceHistory:       day0History,
      pricePaths:         finalPaths,
      newsTimeline:       news,
      firedNewsIds:       [],
      activeNews:         null,
      gameStartTimestamp: Date.now(),
      totalPausedMs:      0,
      lastPauseTimestamp: null,
    });
  },

  tickEngine: () => {
    const s = get();
    if (!s.isRunning || s.isPaused) return;

    const nextDay = s.currentDay + 1;

    if (nextDay >= TOTAL_GAME_DAYS) {
      const lastDay = TOTAL_GAME_DAYS - 1;
      const { prices, priceHistory } = applyDayPrices(s.pricePaths, s.priceHistory, lastDay, s.prices);
      set({ currentDay: lastDay, currentYear: dayToYear(lastDay), prices, priceHistory });
      get().endSimulation();
      return;
    }

    const { prices, priceHistory } = applyDayPrices(s.pricePaths, s.priceHistory, nextDay, s.prices);

    // Fire any news events scheduled for today
    const toFire = s.newsTimeline.filter(
      (e) => e.day === nextDay && !s.firedNewsIds.includes(e.id),
    );

    let activeNews: NewsEvent | null = s.activeNews;
    const newFiredIds = toFire.length ? [...s.firedNewsIds] : s.firedNewsIds;

    for (const event of toFire) {
      newFiredIds.push(event.id);
      activeNews = event;
      get().logEvent({
        type:    "news_event",
        day:     nextDay,
        payload: { eventId: event.id, category: event.category, headline: event.headline },
      });
    }

    set({
      currentDay:   nextDay,
      currentYear:  dayToYear(nextDay),
      prices,
      priceHistory,
      firedNewsIds: newFiredIds,
      activeNews,
    });
  },

  pauseSimulation: () => {
    const s = get();
    if (!s.isRunning || s.isPaused) return;
    s.logEvent({ type: "simulation_paused", day: s.currentDay, payload: {} });
    set({ isPaused: true, lastPauseTimestamp: Date.now() });
  },

  resumeSimulation: () => {
    const s = get();
    if (!s.isRunning || !s.isPaused) return;
    const pausedMs = s.lastPauseTimestamp ? Date.now() - s.lastPauseTimestamp : 0;
    s.logEvent({ type: "simulation_resumed", day: s.currentDay, payload: { pausedMs } });
    set({ isPaused: false, totalPausedMs: s.totalPausedMs + pausedMs, lastPauseTimestamp: null });
  },

  endSimulation: () => {
    const s = get();
    s.logEvent({ type: "game_ended", day: s.currentDay, payload: {} });
    set({ isRunning: false, isPaused: false });
    s.setPhase("settlement");
  },

  quitSimulation: () => {
    const s = get();
    s.logEvent({ type: "game_quit", day: s.currentDay, payload: {} });
    set({ isRunning: false, isPaused: false, quitEarly: true });
  },

  setSpeed: (speed) => set({ speed }),

  resetMarket: () =>
    set({
      gameSeed:           0,
      currentDay:         0,
      currentYear:        0,
      isRunning:          false,
      isPaused:           false,
      speed:              1,
      quitEarly:          false,
      prices:             buildInitialPrices(),
      priceHistory:       buildInitialHistory(),
      pricePaths:         EMPTY_PATHS,
      newsTimeline:       [],
      firedNewsIds:       [],
      activeNews:         null,
      gameStartTimestamp: null,
      totalPausedMs:      0,
      lastPauseTimestamp: null,
    }),
});
