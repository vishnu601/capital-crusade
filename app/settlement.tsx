/**
 * /settlement — shown after the 10-year simulation completes naturally.
 *
 * Placeholder for Prompt 7. Shows final portfolio value and routes to debrief.
 */

import { View }         from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router }       from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText }    from "@/components/ui/AppText";
import { Button }     from "@/components/ui/Button";
import { Card }       from "@/components/ui/Card";
import { useGameStore } from "@/store/index";
import { calculatePortfolioValue, totalReturnPct } from "@/lib/selectors";
import { STARTING_CAPITAL } from "@/lib/constants";

export default function SettlementScreen() {
  const prices        = useGameStore((s) => s.prices);
  const holdings      = useGameStore((s) => s.holdings);
  const cash          = useGameStore((s) => s.cash);
  const txCostsPaid   = useGameStore((s) => s.transactionCostsPaid);
  const taxesPaid     = useGameStore((s) => s.taxesPaid);
  const exitLoadsPaid = useGameStore((s) => s.exitLoadsPaid);
  const currentDay    = useGameStore((s) => s.currentDay);
  const resetGame     = useGameStore((s) => s.resetGame);

  const portfolioValue = calculatePortfolioValue(
    { cash, holdings, transactionCostsPaid: txCostsPaid, taxesPaid, exitLoadsPaid },
    prices,
  );
  const retPct    = totalReturnPct(portfolioValue, STARTING_CAPITAL);
  const positive  = retPct >= 0;
  const cagr      = (Math.pow(portfolioValue / STARTING_CAPITAL, 1 / 10) - 1) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center", gap: 24 }}>

        <Animated.View entering={FadeInDown.duration(500)}>
          <AppText
            variant="display"
            color="primary"
            style={{ textAlign: "center", marginBottom: 4 }}
          >
            Game ended.
          </AppText>
          <AppText variant="body" color="muted" style={{ textAlign: "center" }}>
            Day {currentDay} of {3650 - 1}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <Card padded>
            <AppText variant="caption" color="muted" style={{ marginBottom: 12 }}>
              FINAL RESULTS
            </AppText>

            <ResultRow
              label="Portfolio value"
              value={`₹${Math.round(portfolioValue).toLocaleString("en-IN")}`}
              color={positive ? "#2DD4BF" : "#F87171"}
            />
            <ResultRow
              label="Total return"
              value={`${positive ? "+" : ""}${retPct.toFixed(1)}%`}
              color={positive ? "#2DD4BF" : "#F87171"}
            />
            <ResultRow
              label="CAGR"
              value={`${positive ? "+" : ""}${cagr.toFixed(2)}%`}
              color={positive ? "#2DD4BF" : "#F87171"}
            />

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "#2A3450",
                paddingTop: 10,
                marginTop: 8,
                gap: 6,
              }}
            >
              <ResultRow label="Transaction costs" value={`₹${Math.round(txCostsPaid).toLocaleString("en-IN")}`} />
              <ResultRow label="Exit loads"        value={`₹${Math.round(exitLoadsPaid).toLocaleString("en-IN")}`} />
              <ResultRow label="Taxes (STCG)"      value={`₹${Math.round(taxesPaid).toLocaleString("en-IN")}`} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={{ gap: 10 }}
        >
          <AppText
            variant="caption"
            color="muted"
            style={{ textAlign: "center" }}
          >
            🚧 Full debrief coming in next build
          </AppText>
          <Button label="View debrief"  variant="primary" onPress={() => router.replace("/debrief")} />
          <Button label="Back to menu"  variant="ghost"   onPress={() => { resetGame(); router.replace("/"); }} />
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

function ResultRow({
  label, value, color,
}: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
      <AppText variant="caption" color="muted">{label}</AppText>
      <AppText
        variant="caption"
        style={{ color: color ?? "#C5CCD9", fontFamily: "Inter_600SemiBold" }}
      >
        {value}
      </AppText>
    </View>
  );
}
