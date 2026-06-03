import { useState, useEffect } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Screen }     from "@/components/ui/Screen";
import { AppText }    from "@/components/ui/AppText";
import { Card }       from "@/components/ui/Card";
import { Button }     from "@/components/ui/Button";
import { IconCircle } from "@/components/ui/IconCircle";
import { Pill }       from "@/components/ui/Pill";
import { BullScene }  from "@/components/bull/BullScene";
import { BullAgent }  from "@/components/bull/BullAgent";
import type { BullExpression } from "@/components/bull/BullAgent";
import { useGameStore } from "@/store/index";

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPRESSIONS: BullExpression[] = [
  "neutral",
  "thinking",
  "pleased",
  "concerned",
  "speaking",
];

const WELCOME =
  "Welcome to Capital Crusade! I'm your guide. Let's learn to invest like a strategist — not a gambler. 🐂";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DemoScreen() {
  const [exprIdx, setExprIdx]       = useState(0);
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    const id = setInterval(
      () => setExprIdx((i) => (i + 1) % EXPRESSIONS.length),
      3000,
    );
    return () => clearInterval(id);
  }, []);

  const handlePrimaryPress = () => {
    setLoadingBtn(true);
    setTimeout(() => setLoadingBtn(false), 1500);
  };

  return (
    <Screen scrollable padded>

      {/* ── Bull Scene ──────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(500)} style={{ marginTop: 16, marginBottom: 36 }}>
        <BullScene
          text={WELCOME}
          expression="pleased"
          layout="vertical"
          bullSize={148}
        />
      </Animated.View>

      {/* ── Expression showcase ─────────────────────────────────────────── */}
      <SectionLabel>Expressions (cycling every 3 s)</SectionLabel>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 36 }}>
        {EXPRESSIONS.map((expr, i) => (
          <View key={expr} style={{ alignItems: "center", gap: 4 }}>
            <BullAgent size={48} expression={expr} animated={false} />
            <AppText
              variant="micro"
              color={exprIdx === i ? "bull" : "muted"}
            >
              {expr}
            </AppText>
          </View>
        ))}
      </View>

      {/* ── Cards 2 × 2 ─────────────────────────────────────────────────── */}
      <SectionLabel>Cards</SectionLabel>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 36 }}>
        <View style={{ flex: 1, gap: 12 }}>
          <Card>
            <IconCircle emoji="📈" tone="success" />
            <AppText variant="caption" color="secondary" style={{ marginTop: 8 }}>
              Growth Stocks
            </AppText>
            <AppText variant="title" color="success">+24%</AppText>
          </Card>
          <Card onPress={() => {}}>
            <IconCircle emoji="🏦" tone="neutral" />
            <AppText variant="caption" color="secondary" style={{ marginTop: 8 }}>
              Bonds
            </AppText>
            <AppText variant="title" color="primary">Stable</AppText>
          </Card>
        </View>
        <View style={{ flex: 1, gap: 12 }}>
          <Card>
            <IconCircle emoji="🪙" tone="bull" />
            <AppText variant="caption" color="secondary" style={{ marginTop: 8 }}>
              Commodities
            </AppText>
            <AppText variant="title" color="bull">+8%</AppText>
          </Card>
          <Card onPress={() => {}}>
            <IconCircle emoji="📉" tone="danger" />
            <AppText variant="caption" color="secondary" style={{ marginTop: 8 }}>
              High Risk
            </AppText>
            <AppText variant="title" color="danger">−12%</AppText>
          </Card>
        </View>
      </View>

      {/* ── Buttons ─────────────────────────────────────────────────────── */}
      <SectionLabel>Buttons</SectionLabel>
      <View style={{ gap: 12, marginBottom: 36 }}>
        <Button
          label="Invest Now"
          variant="primary"
          onPress={handlePrimaryPress}
          loading={loadingBtn}
        />
        <Button label="Learn More"    variant="secondary" onPress={() => {}} />
        <Button label="Skip for now"  variant="ghost"     onPress={() => {}} />
        <Button label="Disabled"      variant="primary"   disabled />
      </View>

      {/* ── Pills ───────────────────────────────────────────────────────── */}
      <SectionLabel>Pills</SectionLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
        <Pill label="Gain +14%"  tone="success" />
        <Pill label="Loss −6%"   tone="danger"  />
        <Pill label="Neutral"    tone="neutral" />
        <Pill label="Q3 2024"    tone="neutral" />
        <Pill label="New High"   tone="success" />
        <Pill label="Stop Loss"  tone="danger"  />
      </View>

      {/* ── Typography ──────────────────────────────────────────────────── */}
      <SectionLabel>Typography</SectionLabel>
      <View style={{ gap: 10, marginBottom: 48 }}>
        <AppText variant="display" color="bull">Display · 36px</AppText>
        <AppText variant="title">Title · 24px</AppText>
        <AppText variant="heading">Heading · 18px</AppText>
        <AppText variant="body"    color="secondary">Body · 15px secondary</AppText>
        <AppText variant="caption" color="muted">Caption · 13px muted</AppText>
        <AppText variant="micro"   color="muted">Micro · 11px uppercase</AppText>
      </View>

      {/* ── Store debug panel ────────────────────────────────────────────── */}
      <StoreDebugPanel />

    </Screen>
  );
}

// ─── Store debug panel ────────────────────────────────────────────────────────

function StoreDebugPanel() {
  // Fine-grained selectors so only the values we care about cause re-renders
  const phase          = useGameStore((s) => s.phase);
  const selectedGoal   = useGameStore((s) => s.selectedGoal);
  const cash           = useGameStore((s) => s.cash);
  const holdingsCount  = useGameStore((s) => s.holdings.length);
  const currentDay     = useGameStore((s) => s.currentDay);
  const currentYear    = useGameStore((s) => s.currentYear);
  const isRunning      = useGameStore((s) => s.isRunning);
  const eventCount     = useGameStore((s) => s.events.length);

  const selectGoal    = useGameStore((s) => s.selectGoal);
  const buyAsset      = useGameStore((s) => s.buyAsset);
  const tick          = useGameStore((s) => s.tick);
  const resetGame     = useGameStore((s) => s.resetGame);

  const fmt = (n: number) =>
    "₹" + Math.round(n).toLocaleString("en-IN");

  return (
    <View style={{ marginBottom: 48 }}>
      <SectionLabel>Store debug</SectionLabel>

      {/* ── Live state values ── */}
      <Card padded>
        <AppText variant="caption" color="muted" style={{ marginBottom: 8 }}>
          LIVE STATE
        </AppText>
        <View style={{ gap: 6 }}>
          <Row label="Phase"          value={phase} />
          <Row label="Goal"           value={selectedGoal ?? "none"} />
          <Row label="Cash"           value={fmt(cash)} highlight />
          <Row label="Holdings"       value={String(holdingsCount)} />
          <Row label="Day / Year"     value={`${currentDay} / ${currentYear}`} />
          <Row label="Running"        value={isRunning ? "yes" : "no"} />
          <Row label="Log events"     value={String(eventCount)} />
        </View>
      </Card>

      {/* ── Test actions ── */}
      <AppText variant="caption" color="muted" style={{ marginTop: 16, marginBottom: 10 }}>
        TEST ACTIONS
      </AppText>
      <View style={{ gap: 10 }}>
        <Button
          label="Select retirement goal"
          variant="secondary"
          onPress={() => selectGoal("retirement_long")}
        />
        <Button
          label="Buy ₹10k Bharath Large-Cap"
          variant="secondary"
          onPress={() => buyAsset("bharath_largecap_eq", 10_000)}
        />
        <Button
          label="Tick day +1"
          variant="ghost"
          onPress={() => tick()}
        />
        <Button
          label="Reset game"
          variant="ghost"
          onPress={() => resetGame()}
        />
      </View>
    </View>
  );
}

// ─── Local helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <AppText variant="caption" color="muted" style={{ marginBottom: 12, letterSpacing: 1 }}>
      {children.toUpperCase()}
    </AppText>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <AppText variant="caption" color="muted">{label}</AppText>
      <AppText variant="caption" color={highlight ? "bull" : "secondary"}>{value}</AppText>
    </View>
  );
}
