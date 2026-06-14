/**
 * CorridorBar — horizontal 4-segment allocation bar.
 * Segments are proportional to the allocation values (should sum to ~100).
 * Used in goal-select, plan-commit, and ready screens.
 */
import { View, ViewStyle } from "react-native";
import { AppText } from "./AppText";
import type { AssetClass } from "@/types/game";

// ─── Colors (debt uses a blue not in the main palette) ───────────────────────

export const CLASS_COLOR: Record<AssetClass, string> = {
  equity: "#2DD4BF", // accent-success teal
  debt:   "#6B8FFF", // periwinkle blue
  gold:   "#FFB627", // accent-bull
  cash:   "#8B95A7", // text-muted gray
};

const CLASS_LABEL: Record<AssetClass, string> = {
  equity: "Eq",
  debt:   "Db",
  gold:   "Au",
  cash:   "Ca",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CorridorBarProps {
  allocation: { equity: number; debt: number; gold: number; cash: number };
  height?: number;
  /** Show percentage labels inside each segment */
  showLabels?: boolean;
  /** Round corners on the whole bar */
  rounded?: boolean;
  /** Extra style applied to the outer container */
  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CorridorBar({
  allocation,
  height = 18,
  showLabels = true,
  rounded = true,
  style,
}: CorridorBarProps) {
  const segments: { key: AssetClass; value: number }[] = [
    { key: "equity", value: allocation.equity },
    { key: "debt",   value: allocation.debt },
    { key: "gold",   value: allocation.gold },
    { key: "cash",   value: allocation.cash },
  ];

  // Normalise so they fill 100% even if the values don't sum exactly
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 100;

  return (
    <View
      style={[{
        flexDirection: "row",
        height,
        borderRadius: rounded ? height / 2 : 4,
        overflow: "hidden",
        backgroundColor: "#2A3450",
      }, style]}
    >
      {segments.map(({ key, value }) => {
        const pct = (value / total) * 100;
        if (pct < 0.5) return null; // skip invisible slivers
        return (
          <View
            key={key}
            style={{
              flex: value,
              backgroundColor: CLASS_COLOR[key],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showLabels && pct >= 8 && (
              <AppText
                variant="micro"
                style={{ color: "#0A0E1A", fontSize: 9, lineHeight: 12 }}
              >
                {Math.round(pct)}%
              </AppText>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

/** Small inline legend row: coloured dot + label for each class. */
export function CorridorLegend() {
  const classes: AssetClass[] = ["equity", "debt", "gold", "cash"];
  const fullLabel: Record<AssetClass, string> = {
    equity: "Equity",
    debt:   "Debt",
    gold:   "Gold",
    cash:   "Cash",
  };

  return (
    <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
      {classes.map((c) => (
        <View key={c} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: CLASS_COLOR[c] }}
          />
          <AppText variant="micro" color="muted">{fullLabel[c]}</AppText>
        </View>
      ))}
    </View>
  );
}
