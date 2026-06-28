/**
 * /play — simulation screen.
 *
 * TOP BAR (3 rows):
 *   Row 1 — countdown mm:ss  |  Quit X
 *   Row 2 — "Year N of 10"   |  ₹ portfolio value
 *   Row 3 — "Day NNNN"       |  LIVE / PAUSED pill
 *
 * BODY (scroll):
 *   1. Asset price list (6 rows, live-updating)
 *   2. News card — latest fired event or "Markets quiet"
 *   3. Placeholder card — "Trade button coming next build"
 *
 * BOTTOM BAR:
 *   Pause/Resume  |  1× 2× 4× speed pills  |  End now (debug)
 *
 * QUIT MODAL:
 *   Auto-pauses when opened. "Keep playing" resumes. "Quit anyway" → '/'
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  View, ScrollView, Pressable, Modal, StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { router }         from "expo-router";
import { SafeAreaView }   from "react-native-safe-area-context";

import { AppText }     from "@/components/ui/AppText";
import { Button }      from "@/components/ui/Button";
import { Card }        from "@/components/ui/Card";
import { Pill }        from "@/components/ui/Pill";
import { useGameStore }  from "@/store/index";
import { useGameLoop, BASE_TICK_MS } from "@/hooks/useGameLoop";
import { calculatePortfolioValue }   from "@/lib/selectors";
import { ASSETS }          from "@/lib/assets";
import { TOTAL_GAME_DAYS, STARTING_CAPITAL } from "@/lib/constants";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PlayScreen() {
  useGameLoop();

  // ── Store state ─────────────────────────────────────────────────────────
  const phase              = useGameStore((s) => s.phase);
  const currentDay         = useGameStore((s) => s.currentDay);
  const currentYear        = useGameStore((s) => s.currentYear);
  const isRunning          = useGameStore((s) => s.isRunning);
  const isPaused           = useGameStore((s) => s.isPaused);
  const speed              = useGameStore((s) => s.speed);
  const quitEarly          = useGameStore((s) => s.quitEarly);
  const prices             = useGameStore((s) => s.prices);
  const priceHistory       = useGameStore((s) => s.priceHistory);
  const newsTimeline       = useGameStore((s) => s.newsTimeline);
  const firedNewsIds       = useGameStore((s) => s.firedNewsIds);
  const activeNews         = useGameStore((s) => s.activeNews);
  const holdings           = useGameStore((s) => s.holdings);
  const cash               = useGameStore((s) => s.cash);

  const pauseSimulation    = useGameStore((s) => s.pauseSimulation);
  const resumeSimulation   = useGameStore((s) => s.resumeSimulation);
  const endSimulation      = useGameStore((s) => s.endSimulation);
  const quitSimulation     = useGameStore((s) => s.quitSimulation);
  const setSpeed           = useGameStore((s) => s.setSpeed);

  // ── Local state ─────────────────────────────────────────────────────────
  const [quitModalOpen, setQuitModalOpen] = useState(false);

  // ── Redirect when simulation ends naturally ───────────────────────────
  useEffect(() => {
    if (phase === "settlement" && !quitEarly) {
      const id = setTimeout(() => router.replace("/settlement"), 500);
      return () => clearTimeout(id);
    }
  }, [phase, quitEarly]);

  // Guard: not started
  useEffect(() => {
    if (!isRunning && currentDay === 0 && phase !== "simulation") {
      router.replace("/ready");
    }
  }, []);

  // ── Countdown ────────────────────────────────────────────────────────────
  // We recompute on every render triggered by currentDay / speed changes.
  // A separate 250ms ticker forces smooth updates during slow 1× play.
  const [, forceRender] = useState(0);
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => forceRender((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [isPaused]);

  const remainingDays = Math.max(0, TOTAL_GAME_DAYS - 1 - currentDay);
  const remainingMs   = (remainingDays * BASE_TICK_MS) / speed;
  const totalSec      = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  const countdown = `${mm}:${ss}`;

  // ── Portfolio value ───────────────────────────────────────────────────
  const portfolioValue = calculatePortfolioValue(
    { cash, holdings, transactionCostsPaid: 0, taxesPaid: 0, exitLoadsPaid: 0 },
    prices,
  );
  const returnPct  = ((portfolioValue - STARTING_CAPITAL) / STARTING_CAPITAL) * 100;
  const returnPos  = returnPct >= 0;

  // ── Quit modal handlers ──────────────────────────────────────────────
  const handleQuitTap = useCallback(() => {
    pauseSimulation();
    setQuitModalOpen(true);
  }, [pauseSimulation]);

  const handleKeepPlaying = useCallback(() => {
    setQuitModalOpen(false);
    resumeSimulation();
  }, [resumeSimulation]);

  const handleQuitConfirm = useCallback(() => {
    setQuitModalOpen(false);
    quitSimulation();
    router.replace("/");
  }, [quitSimulation]);

  // ── Pause / resume toggle ────────────────────────────────────────────
  const handlePauseResume = useCallback(() => {
    if (isPaused) resumeSimulation();
    else pauseSimulation();
  }, [isPaused, pauseSimulation, resumeSimulation]);

  return (
    <SafeAreaView style={styles.root}>

      {/* ══ Top bar ══════════════════════════════════════════════════════ */}
      <View style={styles.topBarContainer}>

        {/* Row 1: Countdown | Quit */}
        <View style={styles.row1}>
          <AppText style={styles.countdown}>{countdown}</AppText>
          <Pressable onPress={handleQuitTap} style={styles.quitBtn} hitSlop={12}>
            <AppText style={styles.quitX}>✕</AppText>
          </Pressable>
        </View>

        {/* Row 2: Year | Portfolio */}
        <View style={styles.row2}>
          <AppText variant="body" color="secondary">
            Year {currentYear + 1} of 10
          </AppText>
          <AppText
            variant="body"
            style={{ color: returnPos ? "#2DD4BF" : "#F87171", fontFamily: "Inter_700Bold" }}
          >
            ₹{Math.round(portfolioValue).toLocaleString("en-IN")}
          </AppText>
        </View>

        {/* Row 3: Day | status pill */}
        <View style={styles.row3}>
          <AppText variant="caption" color="muted">Day {currentDay}</AppText>
          <Pill
            label={isPaused ? "PAUSED" : "LIVE"}
            tone={isPaused ? "bull" : "success"}
          />
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentDay / (TOTAL_GAME_DAYS - 1)) * 100)}%` as `${number}%` },
            ]}
          />
        </View>
      </View>

      {/* ══ Scrollable body ══════════════════════════════════════════════ */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── 1. Asset prices ─────────────────────────────────────────── */}
        <SectionHeader title="Assets" />
        <Card padded>
          {ASSETS.map((asset, i) => {
            const price    = prices[asset.id] ?? 100;
            const history  = priceHistory[asset.id] ?? [];
            const prevPrice = history.length > 1 ? history[history.length - 2] : price;
            const chg      = ((price - prevPrice) / prevPrice) * 100;
            const up       = chg >= 0;
            return (
              <View
                key={asset.id}
                style={[
                  styles.assetRow,
                  i < ASSETS.length - 1 && styles.assetRowBorder,
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <View style={[styles.classDot, { backgroundColor: CLASS_COLOR[asset.class] }]} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" color="secondary" numberOfLines={1}>
                      {asset.name}
                    </AppText>
                    <AppText variant="micro" color="muted">{asset.class}</AppText>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <AppText
                    variant="body"
                    style={{
                      color: CLASS_COLOR[asset.class],
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    ₹{price.toFixed(2)}
                  </AppText>
                  <AppText
                    variant="micro"
                    style={{ color: up ? "#2DD4BF" : "#F87171" }}
                  >
                    {up ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%
                  </AppText>
                </View>
              </View>
            );
          })}
        </Card>

        {/* ── 2. News card ────────────────────────────────────────────── */}
        <SectionHeader title="News" />
        {activeNews ? (
          <Animated.View key={activeNews.id} entering={FadeInDown.duration(350)}>
            <Card padded>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Pill label={activeNews.category.replace(/_/g, " ").toUpperCase()} tone="bull" />
                <AppText variant="micro" color="muted">Day {activeNews.day}</AppText>
              </View>
              <AppText
                variant="body"
                color="primary"
                style={{ fontFamily: "Inter_600SemiBold", marginBottom: 6 }}
              >
                {activeNews.headline}
              </AppText>
              <AppText variant="caption" color="muted">{activeNews.body}</AppText>
            </Card>
          </Animated.View>
        ) : (
          <Card padded>
            <AppText variant="caption" color="muted" style={{ textAlign: "center" }}>
              No news yet. Markets quiet.
            </AppText>
          </Card>
        )}

        {firedNewsIds.length > 0 && (
          <AppText
            variant="micro"
            color="muted"
            style={{ textAlign: "right", marginTop: 4, marginBottom: 4 }}
          >
            {firedNewsIds.length} event{firedNewsIds.length > 1 ? "s" : ""} fired
          </AppText>
        )}

        {/* ── 3. Placeholder ──────────────────────────────────────────── */}
        <SectionHeader title="Trade" />
        <Card padded>
          <View style={{ alignItems: "center", gap: 8, paddingVertical: 8 }}>
            <AppText variant="caption" color="muted" style={{ textAlign: "center" }}>
              🚧 Trade button coming in next build
            </AppText>
            <AppText variant="micro" color="muted" style={{ textAlign: "center" }}>
              The engine you're watching is the foundation.
            </AppText>
          </View>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ══ Bottom bar ═══════════════════════════════════════════════════ */}
      <View style={styles.bottomBar}>
        {/* Pause / Resume */}
        <Pressable onPress={handlePauseResume} style={styles.pauseBtn}>
          <AppText
            variant="caption"
            style={{
              color: isPaused ? "#2DD4BF" : "#FFB627",
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {isPaused ? "▶  Resume" : "⏸  Pause"}
          </AppText>
        </Pressable>

        {/* Speed selector */}
        <View style={styles.speedSelector}>
          {([1, 2, 4] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSpeed(s)}
              style={[styles.speedPill, speed === s && styles.speedPillActive]}
            >
              <AppText
                variant="micro"
                style={{
                  color: speed === s ? "#0A0E1A" : "#8B95A7",
                  fontFamily: speed === s ? "Inter_700Bold" : "Inter_400Regular",
                }}
              >
                {s}×
              </AppText>
            </Pressable>
          ))}
        </View>

        {/* End now (debug) */}
        <Pressable
          onPress={() => endSimulation()}
          style={styles.debugBtn}
        >
          <AppText variant="micro" style={{ color: "#F87171" }}>
            End (debug)
          </AppText>
        </Pressable>
      </View>

      {/* ══ Quit modal ═══════════════════════════════════════════════════ */}
      <Modal
        visible={quitModalOpen}
        transparent
        animationType="fade"
        onRequestClose={handleKeepPlaying}
      >
        <TouchableWithoutFeedback onPress={handleKeepPlaying}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <AppText
                  variant="heading"
                  color="primary"
                  style={{ textAlign: "center", marginBottom: 10 }}
                >
                  Quit this session?
                </AppText>
                <AppText
                  variant="caption"
                  color="muted"
                  style={{ textAlign: "center", marginBottom: 24 }}
                >
                  Your progress won't count. You can always start a new game.
                </AppText>

                <Button
                  label="Keep playing"
                  variant="primary"
                  onPress={handleKeepPlaying}
                />
                <View style={{ height: 10 }} />
                <Pressable onPress={handleQuitConfirm} style={styles.quitConfirmBtn}>
                  <AppText
                    variant="caption"
                    style={{ color: "#F87171", fontFamily: "Inter_600SemiBold" }}
                  >
                    Quit anyway
                  </AppText>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <AppText
      variant="caption"
      color="muted"
      style={{ marginTop: 20, marginBottom: 8, letterSpacing: 1 }}
    >
      {title.toUpperCase()}
    </AppText>
  );
}

// ─── Asset class colours (matches CorridorBar) ────────────────────────────────

const CLASS_COLOR: Record<string, string> = {
  equity: "#2DD4BF",
  debt:   "#6B8FFF",
  gold:   "#FFB627",
  cash:   "#8B95A7",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },

  // ── Top bar ──────────────────────────────────────────────────────────────
  topBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3450",
    gap: 4,
  },
  row1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countdown: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: "Inter_800ExtraBold",
    color: "#F5F7FA",
    letterSpacing: 1,
  },
  quitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E2740",
    borderWidth: 1,
    borderColor: "#2A3450",
    alignItems: "center",
    justifyContent: "center",
  },
  quitX: {
    color: "#8B95A7",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  row2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row3: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  progressTrack: {
    height: 2,
    backgroundColor: "#2A3450",
    borderRadius: 1,
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFB627",
    borderRadius: 1,
  },

  // ── Body ─────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // ── Asset rows ────────────────────────────────────────────────────────────
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  assetRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#2A3450",
  },
  classDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Bottom bar ────────────────────────────────────────────────────────────
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A3450",
    backgroundColor: "#0A0E1A",
  },
  pauseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2A3450",
    backgroundColor: "#141B2D",
    minWidth: 110,
    alignItems: "center",
  },
  speedSelector: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A3450",
  },
  speedPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#141B2D",
  },
  speedPillActive: {
    backgroundColor: "#FFB627",
  },
  debugBtn: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4C1D1D",
    backgroundColor: "#1A0E0E",
  },

  // ── Quit modal ────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10,14,26,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#141B2D",
    borderWidth: 1,
    borderColor: "#2A3450",
    borderRadius: 16,
    padding: 24,
  },
  quitConfirmBtn: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4C1D1D",
    backgroundColor: "#1A0E0E",
  },
});
