import { useState } from "react";
import { View, Modal, Pressable, ScrollView } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText }   from "@/components/ui/AppText";
import { Button }    from "@/components/ui/Button";
import { BullAgent } from "@/components/bull/BullAgent";

export default function MenuScreen() {
  const [howToOpen, setHowToOpen] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}>

        {/* ── Top: title ──────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={{ alignItems: "center", marginTop: 32 }}>
          <AppText
            variant="display"
            color="bull"
            style={{ textAlign: "center", letterSpacing: 1 }}
          >
            CAPITAL{"\n"}CRUSADE
          </AppText>
          <AppText
            variant="body"
            color="muted"
            style={{ marginTop: 8, textAlign: "center", letterSpacing: 0.5 }}
          >
            Strategy beats reaction
          </AppText>
        </Animated.View>

        {/* ── Middle: bull ────────────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(700).delay(300)}>
          <BullAgent size={200} expression="pleased" animated />
        </Animated.View>

        {/* ── Bottom: buttons ─────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(500)}
          style={{ width: "100%", gap: 12 }}
        >
          <Button
            label="Begin"
            variant="primary"
            onPress={() => router.push("/briefing")}
          />
          <Button
            label="How to play"
            variant="ghost"
            onPress={() => setHowToOpen(true)}
          />
          <AppText
            variant="micro"
            color="disabled"
            style={{ textAlign: "center", marginTop: 8 }}
          >
            v0.4
          </AppText>
        </Animated.View>

      </View>

      {/* ── How to play modal ────────────────────────────────────────── */}
      <HowToPlayModal visible={howToOpen} onClose={() => setHowToOpen(false)} />
    </SafeAreaView>
  );
}

// ─── How to play modal ────────────────────────────────────────────────────────

function HowToPlayModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", padding: 24 }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={{ backgroundColor: "#141B2D", borderRadius: 24, borderWidth: 1, borderColor: "#2A3450", padding: 24 }}>
            <AppText variant="title" color="bull" style={{ marginBottom: 16 }}>
              How to play
            </AppText>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12 }}>
                <Para>
                  You have ₹1,00,000 and ten years. The simulation runs at
                  60× speed — ten real minutes represents an entire decade.
                </Para>
                <Para>
                  Each year, markets move. News breaks. Corrections happen.
                  Your job is to stick to your strategy — or consciously deviate
                  and live with the consequences.
                </Para>
                <Para>
                  Before the simulation starts, you'll:{"\n"}
                  1. Pick an investing goal{"\n"}
                  2. Read the asset dossiers (or skip them){"\n"}
                  3. Commit to an allocation strategy and discipline rules
                </Para>
                <Para>
                  At the end, Duri debriefs you: what you did, what it cost, and
                  what the optimal patient investor would have earned instead.
                </Para>
                <Para color="muted">
                  The game doesn't require luck. It requires discipline.
                </Para>
              </View>
            </ScrollView>
            <View style={{ marginTop: 20 }}>
              <Button label="Got it" variant="primary" onPress={onClose} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Para({ children, color = "secondary" }: { children: React.ReactNode; color?: "secondary" | "muted" }) {
  return (
    <AppText variant="body" color={color} style={{ lineHeight: 24 }}>
      {children}
    </AppText>
  );
}
