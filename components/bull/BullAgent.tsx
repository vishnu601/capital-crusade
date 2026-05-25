import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
  Circle,
  Path,
  G,
} from "react-native-svg";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BullExpression =
  | "neutral"
  | "thinking"
  | "pleased"
  | "concerned"
  | "speaking";

export interface BullAgentProps {
  size?: number;
  expression?: BullExpression;
  animated?: boolean;
}

// Animated SVG ellipse for the speaking mouth pulse
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Renders both eyes based on expression. Pure SVG, no hooks. */
function Eyes({ expression }: { expression: BullExpression }) {
  // pleased = arc eyes, no pupils
  if (expression === "pleased") {
    return (
      <G>
        {/* Left eye arc — ^_^ style */}
        <Path
          d="M 76 116 Q 90 105 104 116"
          fill="none"
          stroke="#2A3450"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Right eye arc */}
        <Path
          d="M 136 116 Q 150 105 164 116"
          fill="none"
          stroke="#2A3450"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </G>
    );
  }

  // Pupil offset per expression
  const pupil: Record<BullExpression, [number, number]> = {
    neutral:   [0, 0],
    thinking:  [4, -5],
    pleased:   [0, 0], // unused — handled above
    concerned: [0,  1],
    speaking:  [0,  0],
  };
  const [dx, dy] = pupil[expression];

  return (
    <G>
      {/* Left eye white */}
      <Ellipse cx={90} cy={115} rx={14} ry={11} fill="#F5F7FA" stroke="#2A3450" strokeWidth={1} />
      {/* Left pupil */}
      <Circle cx={90 + dx} cy={115 + dy} r={6} fill="#0A0E1A" />
      {/* Left shine */}
      <Circle cx={93 + dx} cy={112 + dy} r={2} fill="white" />

      {/* Right eye white */}
      <Ellipse cx={150} cy={115} rx={14} ry={11} fill="#F5F7FA" stroke="#2A3450" strokeWidth={1} />
      {/* Right pupil */}
      <Circle cx={150 + dx} cy={115 + dy} r={6} fill="#0A0E1A" />
      {/* Right shine */}
      <Circle cx={153 + dx} cy={112 + dy} r={2} fill="white" />
    </G>
  );
}

/** Renders eyebrows for expressions that need them. */
function Eyebrows({ expression }: { expression: BullExpression }) {
  if (expression === "thinking") {
    return (
      <G stroke="#4A2C00" strokeWidth={3} strokeLinecap="round" fill="none">
        <Path d="M 76 100 Q 90 95 104 100" />
        <Path d="M 136 95 Q 150 92 164 100" />
      </G>
    );
  }
  if (expression === "concerned") {
    return (
      <G stroke="#4A2C00" strokeWidth={3} strokeLinecap="round" fill="none">
        {/* Angled inward and down — angry V shape */}
        <Path d="M 76 105 Q 90 100 104 108" />
        <Path d="M 136 108 Q 150 100 164 105" />
      </G>
    );
  }
  return null;
}

/** Renders the mouth for non-speaking expressions. */
function StaticMouth({ expression }: { expression: Exclude<BullExpression, "speaking"> }) {
  const paths: Record<typeof expression, string> = {
    neutral:   "M 108 180 L 132 180",
    thinking:  "M 108 180 L 132 180",
    pleased:   "M 105 178 Q 120 190 135 178",
    concerned: "M 105 185 Q 120 177 135 185",
  };
  return (
    <Path
      d={paths[expression]}
      stroke="#4A2C00"
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BullAgent({
  size = 200,
  expression = "neutral",
  animated = true,
}: BullAgentProps) {
  // ── Breathing ──────────────────────────────────────────────────────────────
  const breathScale = useSharedValue(1);

  useEffect(() => {
    if (!animated) {
      breathScale.value = withTiming(1, { duration: 200 });
      return;
    }
    breathScale.value = withRepeat(
      withTiming(1.025, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [animated]);

  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  // ── Speaking mouth pulse ───────────────────────────────────────────────────
  const mouthRx = useSharedValue(8);

  useEffect(() => {
    if (expression === "speaking") {
      mouthRx.value = withRepeat(
        withTiming(10, { duration: 200, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    } else {
      mouthRx.value = 8;
    }
  }, [expression]);

  const mouthAnimatedProps = useAnimatedProps(() => ({
    rx: mouthRx.value,
  }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[{ width: size, height: size }, breathStyle]}>
      <Svg width={size} height={size} viewBox="0 0 240 240">
        <Defs>
          <LinearGradient id="headGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%"   stopColor="#FFB627" />
            <Stop offset="100%" stopColor="#E89B0E" />
          </LinearGradient>
        </Defs>

        {/* ── LAYER 1 — HORNS (behind head) ───────────────────────────── */}
        {/* Left horn: base ~14 px wide at (78,70), tapers to tip at (40,30) */}
        <Path
          d="M 72 74 Q 32 55 40 30 Q 48 25 50 34 Q 68 58 86 72 Z"
          fill="#FFD166"
          stroke="#FFB627"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Right horn: mirror */}
        <Path
          d="M 168 74 Q 208 55 200 30 Q 192 25 190 34 Q 172 58 154 72 Z"
          fill="#FFD166"
          stroke="#FFB627"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* ── LAYER 3 — EAR TUFTS (behind head, in front of horns) ──────── */}
        {/* Left ear */}
        <Path
          d="M 54 98 Q 44 82 52 72 Q 62 82 68 98 Z"
          fill="#E89B0E"
        />
        {/* Right ear */}
        <Path
          d="M 186 98 Q 196 82 188 72 Q 178 82 172 98 Z"
          fill="#E89B0E"
        />

        {/* ── LAYER 2 — HEAD (main face shape) ────────────────────────── */}
        {/*
          Wider at forehead, narrows into the snout region.
          Key points: forehead (60,80)→(180,80), cheeks out to ~x=200/x=40,
          then narrows down to snout at ~y=200.
        */}
        <Path
          d="M 60 80 Q 120 62 180 80 Q 208 115 165 175 Q 148 202 120 204 Q 92 202 75 175 Q 32 115 60 80 Z"
          fill="url(#headGrad)"
          stroke="#B8770A"
          strokeWidth={1.5}
        />

        {/* ── LAYER 4 — SNOUT ─────────────────────────────────────────── */}
        <Ellipse cx={120} cy={178} rx={27} ry={23} fill="#D88A05" />
        {/* Nostrils */}
        <Ellipse cx={108} cy={175} rx={5} ry={4} fill="#4A2C00" />
        <Ellipse cx={132} cy={175} rx={5} ry={4} fill="#4A2C00" />

        {/* ── LAYER 5 — NOSE RING ──────────────────────────────────────── */}
        <Circle
          cx={120}
          cy={195}
          r={8}
          fill="none"
          stroke="#2DD4BF"
          strokeWidth={2.5}
        />

        {/* ── LAYER 7 — EYEBROWS (below eyes so they render on top) ────── */}
        <Eyebrows expression={expression} />

        {/* ── LAYER 6 — EYES ───────────────────────────────────────────── */}
        <Eyes expression={expression} />

        {/* ── MOUTH ────────────────────────────────────────────────────── */}
        {expression === "speaking" ? (
          <AnimatedEllipse
            animatedProps={mouthAnimatedProps}
            cx={120}
            cy={182}
            ry={4}
            fill="#4A2C00"
          />
        ) : (
          <StaticMouth expression={expression} />
        )}
      </Svg>
    </Animated.View>
  );
}
