import type { Goal, GoalId } from "@/types/game";

// ─── Economy constants ────────────────────────────────────────────────────────

export const STARTING_CAPITAL         = 100_000;  // ₹1,00,000
export const TOTAL_GAME_DAYS          = 3650;     // 10 years
export const TICK_REAL_MS             = 60;       // 1 game-day = 60ms at 1× speed
export const STCG_RATE                = 0.20;     // 20% short-term capital gains tax
export const STCG_THRESHOLD_DAYS      = 365;      // gains < 1 yr old are short-term
export const TRANSACTION_COST_PCT     = 0.001;    // 0.1% per buy or sell (brokerage + STT proxy)
/** Sell within this many real-world ms after a negative news event = panic sell */
export const PANIC_SELL_DETECTION_WINDOW_MS = 30_000;

// ─── Goal definitions ─────────────────────────────────────────────────────────

export const GOALS: Record<GoalId, Goal> = {
  retirement_long: {
    id: "retirement_long",
    title: "Retirement (25+ years)",
    description:
      "Long horizon. Time is your ally. Volatility is just weather.",
    horizonYears: 25,
    corridor: {
      equity: [65, 85],
      debt:   [10, 25],
      gold:   [5,  15],
      cash:   [0,   5],
    },
    maxSingleAssetPct: 35,
  },

  house_medium: {
    id: "house_medium",
    title: "Buy a house (5–7 years)",
    description:
      "Medium horizon. Capital preservation matters. Stability over upside.",
    horizonYears: 7,
    corridor: {
      equity: [20, 40],
      debt:   [45, 65],
      gold:   [10, 20],
      cash:   [5,  15],
    },
    maxSingleAssetPct: 25,
  },

  wealth_medium: {
    id: "wealth_medium",
    title: "Build wealth (10 years)",
    description: "Medium-long horizon. Aggressive but diversified.",
    horizonYears: 10,
    corridor: {
      equity: [55, 75],
      debt:   [15, 30],
      gold:   [5,  15],
      cash:   [5,  10],
    },
    maxSingleAssetPct: 30,
  },

  emergency_short: {
    id: "emergency_short",
    title: "Emergency fund (1–2 years)",
    description: "Short horizon. Liquidity and safety above all.",
    horizonYears: 2,
    corridor: {
      equity: [0,  10],
      debt:   [30, 50],
      gold:   [5,  10],
      cash:   [40, 60],
    },
    maxSingleAssetPct: 20,
  },
};
