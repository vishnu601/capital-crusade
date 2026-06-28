/**
 * News timeline generator.
 *
 * Produces 18–22 news events for a 10-year game run, seeded deterministically.
 *
 * Guarantees:
 *   - ≥1  global_crisis
 *   - 2–3 rate events (rate_hike / rate_cut)
 *   - ≥1  tax_law_change  (so the ELSS lock-in lesson lands)
 *   - ≥1  small_cap_crash (so small-cap vol is felt)
 *   - ≥3  earnings events (beat + miss)
 *
 * Events are spaced ≥30 days apart, bounded to days [45, TOTAL_GAME_DAYS - 45].
 */

import type { NewsCategory, NewsEvent } from "@/types/game";
import { NEWS_IMPACTS_TABLE }           from "./newsImpact";
import { mulberry32 }                   from "./seed";
import { TOTAL_GAME_DAYS }              from "@/lib/constants";

// ─── Headline / body variants ────────────────────────────────────────────────

const VARIANTS: Record<NewsCategory, Array<{ headline: string; body: string }>> = {
  rate_hike: [
    {
      headline: "RBI raises repo rate by 25 bps",
      body:     "The central bank cited persistent inflation in its policy statement. Bond markets reacted overnight.",
    },
    {
      headline: "Rate hike spooks bond markets",
      body:     "Yields jumped as the RBI signaled tighter policy ahead. Duration funds fell.",
    },
    {
      headline: "MPC turns hawkish, hikes rates",
      body:     "Six of seven members voted for the hike, surprising consensus. Debt NAVs dropped.",
    },
    {
      headline: "RBI front-loads rate hike cycle",
      body:     "A 50 bps hike — twice the expected — signals the central bank is serious about inflation.",
    },
  ],

  rate_cut: [
    {
      headline: "RBI cuts repo rate to boost growth",
      body:     "The central bank pivoted dovish amid slowing GDP prints. Bond prices jumped.",
    },
    {
      headline: "Surprise rate cut lifts bonds and equities",
      body:     "Markets rallied across the board on the unexpected policy easing.",
    },
    {
      headline: "MPC votes to ease policy",
      body:     "Growth slowdown fears drove the unexpected cut. Cash fund yields will drift lower.",
    },
    {
      headline: "RBI signals extended rate cut cycle",
      body:     "Governor hinted at further cuts if inflation stays under 4%. Duration funds rallied hard.",
    },
  ],

  earnings_beat: [
    {
      headline: "Index heavyweights deliver blowout earnings",
      body:     "Nifty50 companies beat consensus by 12% — strongest quarter in three years.",
    },
    {
      headline: "Corporate earnings surge past estimates",
      body:     "Strong demand and margin expansion drove broad-based beats across sectors.",
    },
    {
      headline: "Q2 results season off to roaring start",
      body:     "Early reporters delivered double-digit profit growth, lifting market sentiment.",
    },
    {
      headline: "Record profits lift broad market confidence",
      body:     "Earnings momentum spread from large caps to mid-cap names this quarter.",
    },
    {
      headline: "Tech and banking lead earnings beat season",
      body:     "The two largest index sectors posted their best combined quarter in five years.",
    },
  ],

  earnings_miss: [
    {
      headline: "Disappointing earnings drag indices lower",
      body:     "Revenue misses and margin compression hit sentiment across consumer sectors.",
    },
    {
      headline: "Q3 earnings season disappoints across the board",
      body:     "Sluggish demand and elevated input costs weighed on corporate profits.",
    },
    {
      headline: "Corporate profits fall short of estimates",
      body:     "Rising raw material costs and weak rural demand drove widespread misses.",
    },
    {
      headline: "Earnings season rattles investor confidence",
      body:     "Multiple sectors missed analyst forecasts; mid-caps sold off sharply.",
    },
  ],

  global_crisis: [
    {
      headline: "Global markets in turmoil",
      body:     "Indian indices fell sharply in sympathy with a US-led selloff. FII outflows spiked.",
    },
    {
      headline: "Banking sector contagion fears grip markets",
      body:     "A major US bank failure sparked risk-off sentiment across all asset classes.",
    },
    {
      headline: "Geopolitical shock rattles global markets",
      body:     "Oil spiked overnight; equities sold off worldwide as safe-haven demand surged.",
    },
    {
      headline: "Global recession fears trigger broad selloff",
      body:     "Synchronized slowdown data from the US, Europe, and China shook investor confidence.",
    },
    {
      headline: "Financial system stress: risk-off across the board",
      body:     "Credit spreads blew out globally. Gold and US Treasuries were the only safe havens.",
    },
  ],

  inflation_spike: [
    {
      headline: "CPI data shocks markets — hits decade high",
      body:     "Headline inflation surged to 8.2%, well above consensus. Debt markets sold off hard.",
    },
    {
      headline: "Food and fuel prices drive inflation surge",
      body:     "Supply chain disruptions and a weak monsoon pushed food inflation to a 10-year high.",
    },
    {
      headline: "Inflation overshoots RBI target by wide margin",
      body:     "Core inflation proved sticky. Markets now price three more rate hikes this year.",
    },
    {
      headline: "WPI and CPI both jump — stagflation fears rise",
      body:     "Wholesale and retail prices moved in tandem, signaling broad-based price pressure.",
    },
  ],

  budget_positive: [
    {
      headline: "Union Budget surprises with massive capex push",
      body:     "Government announces ₹10 lakh crore infrastructure spend; cyclical stocks rally.",
    },
    {
      headline: "Budget lowers income tax — consumption boost expected",
      body:     "Personal income tax cuts lifted consumer sentiment and FMCG sector stocks.",
    },
    {
      headline: "Fiscal discipline holds; markets cheer",
      body:     "Finance minister held the deficit at 5.1% of GDP, better than feared. Bonds rallied.",
    },
    {
      headline: "Infrastructure push sparks rally in cyclical stocks",
      body:     "Road, rail, and port stocks led the gains as the Budget lifted spending estimates.",
    },
    {
      headline: "Budget brings PLI expansion and export incentives",
      body:     "Manufacturing and export-linked sectors jumped on the production-linked incentive news.",
    },
  ],

  budget_negative: [
    {
      headline: "Budget hikes capital gains tax — equities sell off",
      body:     "Equity investors sold on the unexpected LTCG and STCG rate increases.",
    },
    {
      headline: "Fiscal slippage worries bond markets",
      body:     "Higher-than-expected borrowing targets pushed 10-year yields sharply higher.",
    },
    {
      headline: "New surcharges and cess dampen market sentiment",
      body:     "Broad-based tax increases hit both equity and consumption-linked sectors.",
    },
    {
      headline: "Spending cuts signal growth slowdown ahead",
      body:     "Lower capex targets and subsidy rollbacks dragged infrastructure stocks lower.",
    },
  ],

  currency_weakness: [
    {
      headline: "Rupee slips to record low against the dollar",
      body:     "Capital outflows and a surging dollar index pushed INR past 87. Gold jumped.",
    },
    {
      headline: "INR weakens sharply; import costs surge",
      body:     "FII selling accelerated as the rupee lost 3% in a week. Oil importers bore the brunt.",
    },
    {
      headline: "Rupee depreciation adds to inflation pressure",
      body:     "A weaker currency raises import costs, stoking inflation fears and bond selloff.",
    },
    {
      headline: "Dollar strength hits all EM currencies including INR",
      body:     "Fed hawkishness triggered broad EM selloff; Indian equities saw FII outflows.",
    },
  ],

  tax_law_change: [
    {
      headline: "Government introduces LTCG tax on equity mutual funds",
      body:     "10% long-term capital gains tax on equity fund gains above ₹1 lakh. Investors rattled.",
    },
    {
      headline: "Debt fund taxation overhauled — indexation gone",
      body:     "Indexation benefit removed for debt fund purchases; gains taxed at slab rate.",
    },
    {
      headline: "ELSS lock-in period extended in surprise Budget move",
      body:     "Tax-saving fund investors face a longer mandatory hold before redemption.",
    },
    {
      headline: "STCG rate hiked to 20% on equity redemptions",
      body:     "Investors who sell within a year now face a higher tax hit. Funds see redemption spike.",
    },
  ],

  small_cap_rally: [
    {
      headline: "Small caps surge as domestic flows rotate down the market cap",
      body:     "Mid and small-cap indices outpaced large caps for the third straight month.",
    },
    {
      headline: "Small-cap index hits record on earnings upgrades",
      body:     "A string of positive Q2 results drove analysts to upgrade small-cap earnings forecasts.",
    },
    {
      headline: "Retail SIP flows fuel small-cap momentum",
      body:     "Domestic retail investors poured record amounts into small-cap funds this month.",
    },
    {
      headline: "Value hunters snap up beaten-down small caps",
      body:     "After months of underperformance, quality small caps attracted aggressive buying.",
    },
  ],

  small_cap_crash: [
    {
      headline: "Small-cap carnage as liquidity dries up",
      body:     "Forced selling by leveraged retail investors triggered a circuit-breaker day.",
    },
    {
      headline: "Small-cap funds face record redemptions",
      body:     "SEBI's new circular sparked mass redemptions; fund managers sold at distressed prices.",
    },
    {
      headline: "Broader market rout hits small caps hardest",
      body:     "While large caps fell 4%, the small-cap index crashed 11% in a single session.",
    },
    {
      headline: "Promoter pledge unwinds trigger small-cap selloff",
      body:     "Margin calls on pledged shares cascaded through the broader small-cap segment.",
    },
    {
      headline: "SEBI circuit breakers can't stop small-cap bloodbath",
      body:     "Twenty-two small-cap stocks hit lower circuits as panic selling overwhelmed buyers.",
    },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickRandom<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateSpacedDays(
  rng: () => number,
  count: number,
  minDay: number,
  maxDay: number,
  minGap: number,
): number[] {
  const days: number[] = [];
  for (let i = 0; i < count; i++) {
    let day:    number;
    let tries = 0;
    do {
      day = minDay + Math.floor(rng() * (maxDay - minDay + 1));
      tries++;
    } while (tries < 300 && days.some((d) => Math.abs(d - day) < minGap));
    days.push(day);
  }
  return days;
}

/** Compute the max durationDays across all asset classes for a category. */
function maxDuration(category: NewsCategory): number {
  const impact = NEWS_IMPACTS_TABLE[category];
  return Math.max(
    impact.equity.durationDays,
    impact.debt.durationDays,
    impact.gold.durationDays,
    impact.cash.durationDays,
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a deterministic news timeline for the given seed.
 * Returns events sorted ascending by day.
 */
export function generateNewsTimeline(seed: number): NewsEvent[] {
  // Separate RNG stream from price generator (XOR with magic constant)
  const rng = mulberry32((seed ^ 0xF00D_CAFE) >>> 0);

  const totalCount = 18 + Math.floor(rng() * 5); // 18–22

  // ── Required event pool ─────────────────────────────────────────────────
  const required: NewsCategory[] = [
    "global_crisis",
    "rate_hike",
    "rate_cut",
    "tax_law_change",
    "small_cap_crash",
    "earnings_beat",
    "earnings_miss",
    rng() < 0.5 ? "rate_hike" : "rate_cut", // second rate event
    rng() < 0.5 ? "earnings_beat" : "earnings_miss",
  ];

  // ── Optional fill ────────────────────────────────────────────────────────
  const optional: NewsCategory[] = [
    "earnings_beat",
    "earnings_miss",
    "inflation_spike",
    "budget_positive",
    "budget_negative",
    "currency_weakness",
    "small_cap_rally",
    "global_crisis",      // second crisis allowed
    "inflation_spike",    // extra weight
    "budget_positive",
    "rate_hike",
    "rate_cut",
  ];

  const categoryPool: NewsCategory[] = [...required];
  while (categoryPool.length < totalCount) {
    categoryPool.push(pickRandom(rng, optional));
  }

  // Shuffle so required events don't cluster at the front
  const shuffled = shuffle(rng, categoryPool.slice(0, totalCount));

  // ── Assign spaced days ───────────────────────────────────────────────────
  const rawDays = generateSpacedDays(
    rng,
    shuffled.length,
    45,
    TOTAL_GAME_DAYS - 45,
    30,
  );
  rawDays.sort((a, b) => a - b);

  // ── Build events ─────────────────────────────────────────────────────────
  return shuffled
    .map((category, i): NewsEvent => {
      const variant = pickRandom(rng, VARIANTS[category]);
      return {
        id:                `${category}_${i}`,
        day:               rawDays[i],
        category,
        headline:          variant.headline,
        body:              variant.body,
        impactDurationDays: maxDuration(category),
      };
    })
    .sort((a, b) => a.day - b.day);
}
