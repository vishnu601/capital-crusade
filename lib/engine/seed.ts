/**
 * Seeded pseudo-random number generation.
 *
 * mulberry32 — tiny, fast, high-quality 32-bit PRNG.
 * Produces identical sequences for the same seed → deterministic replays.
 */

export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Box-Muller transform → N(0,1) sample.
 * Consumes two uniform values from `rng`.
 */
export function normalRandom(rng: () => number): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1 === 0 ? 1e-10 : u1)) * Math.cos(2 * Math.PI * u2);
}

/** Generate a random uint32 seed suitable for mulberry32. */
export function generateSeed(): number {
  return ((Date.now() & 0xFFFF) * 65537 + Math.trunc(Math.random() * 0xFFFF_FFFF)) >>> 0;
}
