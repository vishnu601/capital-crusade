import { useState, useEffect, useRef } from "react";
import { View, ScrollView, Pressable, Modal } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText }    from "@/components/ui/AppText";
import { Button }     from "@/components/ui/Button";
import { BullAgent }  from "@/components/bull/BullAgent";
import { BullSpeech } from "@/components/bull/BullSpeech";
import { Pill }       from "@/components/ui/Pill";
import { CLASS_COLOR } from "@/components/ui/CorridorBar";
import { ASSETS }     from "@/lib/assets";
import type { Asset, AssetClass } from "@/types/game";
import { useGameStore } from "@/store/index";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CLASS_EMOJI: Record<AssetClass, string> = {
  equity: "📈",
  debt:   "🏦",
  gold:   "🪙",
  cash:   "💧",
};

const CLASS_PILL_TONE: Record<AssetClass, "success" | "neutral" | "bull"> = {
  equity: "success",
  debt:   "neutral",
  gold:   "bull",
  cash:   "neutral",
};

function formatPct(n: number) {
  return (n * 100).toFixed(2) + "%";
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DossierScreen() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [viewedIds, setViewedIds]         = useState<Set<string>>(new Set());
  const [seconds, setSeconds]             = useState(0);

  const secondsRef = useRef(0);
  const logEvent   = useGameStore((s) => s.logEvent);
  const currentDay = useGameStore((s) => s.currentDay);

  // ── Reading timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Mark viewed ───────────────────────────────────────────────────────────
  const handleOpenAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setViewedIds((prev) => new Set(prev).add(asset.id));
  };

  // ── Continue ──────────────────────────────────────────────────────────────
  const handleContinue = () => {
    logEvent({
      type:    "news_event", // closest existing type; dossier_read added in a future prompt
      day:     currentDay,
      payload: {
        event:        "dossier_read",
        secondsSpent: secondsRef.current,
        assetsViewed: viewedIds.size,
        totalAssets:  ASSETS.length,
      },
    });
    router.push("/plan-commit");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
      <View style={{ flex: 1 }}>

        {/* ── Mini bull header ──────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
          <BullAgent size={60} expression="neutral" animated />
          <View style={{ flex: 1, paddingTop: 4 }}>
            <BullSpeech
              text="Six funds available. Read carefully or don't — your call."
              speed="fast"
              tail="left"
            />
          </View>
        </View>

        {/* ── Title row + timer ─────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 16, marginBottom: 8 }}>
          <AppText variant="heading" color="primary">Asset Dossier</AppText>
          <AppText variant="caption" color="muted">
            🕐 {formatTime(seconds)}
          </AppText>
        </View>

        {/* ── Asset list ───────────────────────────────────────────────── */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {ASSETS.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              viewed={viewedIds.has(asset.id)}
              onPress={() => handleOpenAsset(asset)}
            />
          ))}
        </ScrollView>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#0A0E1A", borderTopWidth: 1, borderTopColor: "#2A3450",
          paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <AppText variant="caption" color="muted">
              Viewed: {viewedIds.size} of {ASSETS.length}
            </AppText>
            {viewedIds.size === ASSETS.length && (
              <Animated.View entering={FadeIn.duration(300)}>
                <AppText variant="micro" color="success">All reviewed ✓</AppText>
              </Animated.View>
            )}
          </View>
          <Button label="Continue to plan →" variant="primary" onPress={handleContinue} />
        </View>

      </View>

      {/* ── Asset detail modal ────────────────────────────────────────── */}
      <AssetModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </SafeAreaView>
  );
}

// ─── Asset card (list row) ────────────────────────────────────────────────────

function AssetCard({
  asset,
  viewed,
  onPress,
}: {
  asset: Asset;
  viewed: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View style={{
        backgroundColor: "#141B2D",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: viewed ? "#134E4A" : "#2A3450",
        padding: 14,
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
      }}>
        {/* Class emoji */}
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: CLASS_COLOR[asset.class] + "22",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <AppText style={{ fontSize: 20 }}>{CLASS_EMOJI[asset.class]}</AppText>
        </View>

        {/* Info */}
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <AppText variant="caption" color="primary" style={{ fontFamily: "Inter_600SemiBold", flex: 1 }} numberOfLines={1}>
              {asset.name}
            </AppText>
            {viewed && (
              <AppText variant="micro" color="success" style={{ marginLeft: 8 }}>✓</AppText>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Pill label={asset.class.charAt(0).toUpperCase() + asset.class.slice(1)} tone={CLASS_PILL_TONE[asset.class]} />
            <AppText variant="micro" color="muted">
              {formatPct(asset.expenseRatio)} p.a.
            </AppText>
          </View>
          <AppText variant="caption" color="muted" numberOfLines={1}>
            {asset.description}
          </AppText>
        </View>

        {/* Chevron */}
        <AppText variant="body" color="muted">›</AppText>
      </View>
    </Pressable>
  );
}

// ─── Asset detail modal ───────────────────────────────────────────────────────

function AssetModal({ asset, onClose }: { asset: Asset | null; onClose: () => void }) {
  if (!asset) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={{
            backgroundColor: "#141B2D",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderColor: "#2A3450",
            padding: 24,
            paddingBottom: 40,
            maxHeight: "88%",
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <View style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: CLASS_COLOR[asset.class] + "22",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <AppText style={{ fontSize: 24 }}>{CLASS_EMOJI[asset.class]}</AppText>
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="heading" color="primary">{asset.name}</AppText>
                  <Pill label={asset.class.charAt(0).toUpperCase() + asset.class.slice(1)} tone={CLASS_PILL_TONE[asset.class]} />
                </View>
              </View>

              {/* Stats */}
              <View style={{ backgroundColor: "#1E2740", borderRadius: 12, padding: 14, gap: 10, marginBottom: 16 }}>
                <StatRow label="Expense ratio"   value={formatPct(asset.expenseRatio) + " per year"} />
                <StatRow
                  label="Exit load"
                  value={
                    asset.exitLoadPct > 0
                      ? `${formatPct(asset.exitLoadPct)} if sold within ${asset.exitLoadPeriodDays} days`
                      : "None"
                  }
                />
                <StatRow label="Asset class" value={asset.class.charAt(0).toUpperCase() + asset.class.slice(1)} />
              </View>

              {/* Description */}
              <AppText variant="body" color="secondary" style={{ marginBottom: 16, lineHeight: 24 }}>
                {asset.description}
              </AppText>

              {/* Buried fact callout */}
              <View style={{
                borderWidth: 1.5,
                borderColor: "#FFB627",
                backgroundColor: "#FFB62710",
                borderRadius: 12,
                padding: 14,
                gap: 6,
                marginBottom: 20,
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <AppText style={{ fontSize: 16 }}>⚠️</AppText>
                  <AppText variant="caption" color="bull" style={{ fontFamily: "Inter_600SemiBold" }}>
                    Key detail
                  </AppText>
                </View>
                <AppText variant="body" color="primary" style={{ lineHeight: 22 }}>
                  {asset.buriedFact}
                </AppText>
              </View>

              <Button label="Got it" variant="primary" onPress={onClose} />
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <AppText variant="caption" color="muted">{label}</AppText>
      <AppText variant="caption" color="secondary" style={{ textAlign: "right", flex: 1 }}>{value}</AppText>
    </View>
  );
}
