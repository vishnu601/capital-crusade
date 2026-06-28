/**
 * Geometric Brownian Motion price path generator.
 *
 * Formula per day:
 *   price[i] = price[i-1] × exp( drift·dt + diffusion·√dt · Z )
 *
 * where Z ~ N(0,1), dt = 1/252 (trading-days convention),
 * drift = annualReturn - 0.5·annualVol²,
 * diffusion = annualVol.
 *
 * generateAllPaths(seed) → one shared RNG stream produces all 6 asset
 * paths deterministically from a single seed.
 */

import { TOTAL_GAME_DAYS } from "@/lib/constants";
import { ASSETS }          from "@/lib/assets";
import type { AssetClass } from "@/types/game";
import { mulberry32, normalRandom } from "./seed";

// ─── Calibrations ─────────────────────────────────────────────────────────────

interface AssetCalibration {
  annualReturn: number;
  annualVol:    number;
}

const CALIBRATIONS: Record<AssetClass, AssetCalibration> = {
  equity: { annualReturn: 0.12,  annualVol: 0.22  },
  debt:   { annualReturn: 0.07,  annualVol: 0.04  },
  gold:   { annualReturn: 0.08,  annualVol: 0.15  },
  cash:   { annualReturn: 0.055, annualVol: 0.005 },
};

/** Per-asset volatility multipliers (applied on top of class calibration). */
const VOL_MULTIPLIERS: Record<string, number> = {
  bharath_smallcap_eq: 1.5,  // more dramatic swings
  lotus_elss_tax:      0.9,  // slightly tamer equity
};

// ─── Core generator ──────────────────────────────────────────────────────────

export function generatePricePath(
  startPrice: number,
  days: number,
  calibration: AssetCalibration,
  rng: () => number,
): number[] {
  const dt        = 1 / 252;
  const drift     = (calibration.annualReturn - 0.5 * calibration.annualVol ** 2) * dt;
  const diffusion = calibration.annualVol * Math.sqrt(dt);

  const prices: number[] = [startPrice];
  for (let i = 1; i < days; i++) {
    const z    = normalRandom(rng);
    const next = prices[i - 1] * Math.exp(drift + diffusion * z);
    prices.push(next);
  }
  return prices;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate BASE price paths for all 6 assets using a single seeded RNG.
 * Returns assetId → number[] of length TOTAL_GAME_DAYS (indices 0–3649).
 *
 * Pass the result to applyNewsImpacts() to get final in-game paths.
 */
export function generateAllPaths(seed: number): Record<string, number[]> {
  const rng   = mulberry32(seed);
  const paths: Record<string, number[]> = {};

  for (const asset of ASSETS) {
    const base       = { ...CALIBRATIONS[asset.class] };
    const volMult    = VOL_MULTIPLIERS[asset.id] ?? 1.0;
    const calibration: AssetCalibration = {
      annualReturn: base.annualReturn,
      annualVol:    base.annualVol * volMult,
    };
    paths[asset.id] = generatePricePath(100, TOTAL_GAME_DAYS, calibration, rng);
  }

  return paths;
}
