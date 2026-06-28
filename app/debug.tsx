/**
 * /debug — moved from the old app/index.tsx demo screen.
 * Navigate here manually (type the URL in Expo Go dev menu) during testing.
 */
import { View } from "react-native";
import { router } from "expo-router";

import { Screen }   from "@/components/ui/Screen";
import { AppText }  from "@/components/ui/AppText";
import { Button }   from "@/components/ui/Button";
import { Card }     from "@/components/ui/Card";
import { useGameStore } from "@/store/index";

export default function DebugScreen() {
  const phase         = useGameStore((s) => s.phase);
  const selectedGoal  = useGameStore((s) => s.selectedGoal);
  const cash          = useGameStore((s) => s.cash);
  const holdingsCount = useGameStore((s) => s.holdings.length);
  const currentDay    = useGameStore((s) => s.currentDay);
  const currentYear   = useGameStore((s) => s.currentYear);
  const isRunning     = useGameStore((s) => s.isRunning);
  const eventCount    = useGameStore((s) => s.events.length);

  const selectGoal    = useGameStore((s) => s.selectGoal);
  const buyAsset      = useGameStore((s) => s.buyAsset);
  const tickEngine   = useGameStore((s) => s.tickEngine);
  const resetGame     = useGameStore((s) => s.resetGame);

  const fmt = (n: number) => "₹" + Math.round(n).toLocaleString();

  return (
    <Screen scrollable padded>
      <AppText variant="title" color="bull" style={{ marginTop: 16, marginBottom: 24 }}>
        Store Debug
      </AppText>

      <Card padded>
        <AppText variant="caption" color="muted" style={{ marginBottom: 10 }}>
          LIVE STATE
        </AppText>
        <View style={{ gap: 8 }}>
          <Row label="Phase"      value={phase} />
          <Row label="Goal"       value={selectedGoal ?? "none"} />
          <Row label="Cash"       value={fmt(cash)} highlight />
          <Row label="Holdings"   value={String(holdingsCount)} />
          <Row label="Day / Year" value={`${currentDay} / ${currentYear}`} />
          <Row label="Running"    value={isRunning ? "yes" : "no"} />
          <Row label="Log events" value={String(eventCount)} />
        </View>
      </Card>

      <AppText variant="caption" color="muted" style={{ marginBottom: 12 }}>
        TEST ACTIONS
      </AppText>
      <View style={{ gap: 10, marginBottom: 32 }}>
        <Button label="Select retirement goal"       variant="secondary" onPress={() => selectGoal("retirement_long")} />
        <Button label="Buy ₹10k Bharath Large-Cap"  variant="secondary" onPress={() => buyAsset("bharath_largecap_eq", 10_000)} />
        <Button label="Tick day +1"                 variant="ghost"     onPress={() => tickEngine()} />
        <Button label="Reset game"                  variant="ghost"     onPress={() => resetGame()} />
        <Button label="← Back to menu"             variant="ghost"     onPress={() => router.replace("/")} />
      </View>
    </Screen>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <AppText variant="caption" color="muted">{label}</AppText>
      <AppText variant="caption" color={highlight ? "bull" : "secondary"}>{value}</AppText>
    </View>
  );
}
