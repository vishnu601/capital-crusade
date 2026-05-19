import { useEffect } from "react";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  RadialGradient,
  Ellipse,
  Circle,
  Path,
  G,
} from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Expression data ─────────────────────────────────────────────────────────

interface ExpressionConfig {
  /** Pupil offset from eye centre */
  pupilDx: number;
  pupilDy: number;
  /** Vertical radius of the white sclera (full = 10, squint → smaller) */
  scleraRy: number;
  /** Y offset applied to both eyebrow paths (positive = brows closer to eyes) */
  browDy: number;
  /** Mouth SVG path string (centred around x=100, muzzle region) */
  mouth: string;
  /** Show mouth as open (filled ellipse) instead of a line */
  mouthOpen: boolean;
}

const EXPRESSIONS: Record<BullExpression, ExpressionConfig> = {
  neutral: {
    pupilDx: 0,
    pupilDy: 0,
    scleraRy: 9,
    browDy: 0,
    mouth: "M 86 139 Q 100 146 114 139",
    mouthOpen: false,
  },
  thinking: {
    pupilDx: 4,
    pupilDy: -3,
    scleraRy: 6.5,
    browDy: -3,
    mouth: "M 86 141 Q 100 139 114 141",
    mouthOpen: false,
  },
  pleased: {
    pupilDx: 0,
    pupilDy: 0,
    scleraRy: 2.5, // thin arc = ^_^ squint
    browDy: -5,
    mouth: "M 84 136 Q 100 150 116 136",
    mouthOpen: false,
  },
  concerned: {
    pupilDx: 0,
    pupilDy: 2,
    scleraRy: 9,
    browDy: 5, // brows pushed DOWN toward eyes
    mouth: "M 86 143 Q 100 136 114 143",
    mouthOpen: false,
  },
  speaking: {
    pupilDx: 0,
    pupilDy: 0,
    scleraRy: 8,
    browDy: 0,
    mouth: "M 86 136 Q 100 152 114 136", // placeholder; mouthOpen draws ellipse
    mouthOpen: true,
  },
};

// ─── Eye sub-component (pure SVG, no hooks) ───────────────────────────────────

function Eye({
  cx,
  cy,
  cfg,
}: {
  cx: number;
  cy: number;
  cfg: ExpressionConfig;
}) {
  const { pupilDx, pupilDy, scleraRy } = cfg;
  const isSquint = scleraRy <= 3;

  return (
    <G>
      {/* White sclera */}
      <Ellipse cx={cx} cy={cy} rx={11} ry={scleraRy} fill="white" />
      {/* Pupil + shine — hidden when fully squinted */}
      {!isSquint && (
        <G>
          <Circle
            cx={cx + pupilDx}
            cy={cy + pupilDy}
            r={5.5}
            fill="#111827"
          />
          {/* Shine dot */}
          <Circle
            cx={cx + pupilDx + 2}
            cy={cy + pupilDy - 2}
            r={1.5}
            fill="white"
          />
        </G>
      )}
    </G>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BullAgent({
  size = 200,
  expression = "neutral",
  animated = true,
}: BullAgentProps) {
  const breathScale = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      breathScale.value = withRepeat(
        withTiming(1.025, {
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      );
    } else {
      breathScale.value = withTiming(1, { duration: 200 });
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  const cfg = EXPRESSIONS[expression];

  // Eyebrow base Y coordinates (for neutral)
  const browLeftY1 = 80;
  const browLeftY2 = 76;
  const browRightY1 = 76;
  const browRightY2 = 80;

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          {/* Face gradient — lighter at top, richer at bottom */}
          <LinearGradient id="faceGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor="#FFD166" />
            <Stop offset="60%" stopColor="#FFB627" />
            <Stop offset="100%" stopColor="#E09A10" />
          </LinearGradient>

          {/* Horn gradient */}
          <LinearGradient id="hornGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor="#FFE599" />
            <Stop offset="100%" stopColor="#FFD166" />
          </LinearGradient>

          {/* Muzzle gradient — slightly darker / warmer */}
          <LinearGradient id="muzzleGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor="#F0A820" />
            <Stop offset="100%" stopColor="#D4900A" />
          </LinearGradient>

          {/* Subtle cheek highlight */}
          <RadialGradient
            id="cheekHighlight"
            cx="0.35"
            cy="0.3"
            r="0.55"
            fx="0.35"
            fy="0.3"
          >
            <Stop offset="0%" stopColor="#FFE599" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#FFB627" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* ── Horns ──────────────────────────────────────────────────────── */}
        {/* Left horn: sweeps up-left then tips slightly right */}
        <Path
          d="M 64 70 C 52 52, 46 32, 58 18 C 64 30, 70 50, 72 66"
          fill="url(#hornGrad)"
        />
        {/* Right horn */}
        <Path
          d="M 136 70 C 148 52, 154 32, 142 18 C 136 30, 130 50, 128 66"
          fill="url(#hornGrad)"
        />

        {/* ── Ears ───────────────────────────────────────────────────────── */}
        <Ellipse cx={56} cy={108} rx={15} ry={20} fill="#E09A10" />
        <Ellipse cx={144} cy={108} rx={15} ry={20} fill="#E09A10" />
        {/* Inner ear */}
        <Ellipse cx={56} cy={110} rx={8} ry={12} fill="#C07800" />
        <Ellipse cx={144} cy={110} rx={8} ry={12} fill="#C07800" />

        {/* ── Main face ──────────────────────────────────────────────────── */}
        <Ellipse cx={100} cy={107} rx={58} ry={63} fill="url(#faceGrad)" />

        {/* Cheek highlight overlay */}
        <Ellipse cx={100} cy={107} rx={58} ry={63} fill="url(#cheekHighlight)" />

        {/* ── Muzzle ─────────────────────────────────────────────────────── */}
        <Ellipse cx={100} cy={140} rx={29} ry={19} fill="url(#muzzleGrad)" />

        {/* ── Nostrils ───────────────────────────────────────────────────── */}
        <Ellipse cx={91} cy={144} rx={5} ry={4} fill="#9A6000" />
        <Ellipse cx={109} cy={144} rx={5} ry={4} fill="#9A6000" />

        {/* ── Nose ring ──────────────────────────────────────────────────── */}
        <Circle
          cx={100}
          cy={151}
          r={6.5}
          fill="none"
          stroke="#2DD4BF"
          strokeWidth={2.5}
        />

        {/* ── Eyebrows ───────────────────────────────────────────────────── */}
        {/* Left brow */}
        <Path
          d={`M 71 ${browLeftY1 + cfg.browDy} Q 82 ${browLeftY2 + cfg.browDy} 93 ${browLeftY1 - 1 + cfg.browDy}`}
          stroke="#C07800"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
        {/* Right brow */}
        <Path
          d={`M 107 ${browRightY1 - 1 + cfg.browDy} Q 118 ${browRightY2 + cfg.browDy} 129 ${browRightY1 + cfg.browDy}`}
          stroke="#C07800"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Eyes ───────────────────────────────────────────────────────── */}
        <Eye cx={83} cy={97} cfg={cfg} />
        <Eye cx={117} cy={97} cfg={cfg} />

        {/* ── Mouth ──────────────────────────────────────────────────────── */}
        {cfg.mouthOpen ? (
          /* Speaking: open oval mouth */
          <Ellipse cx={100} cy={141} rx={12} ry={7} fill="#7A4A00" />
        ) : (
          <Path
            d={cfg.mouth}
            stroke="#9A6000"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </Svg>
    </Animated.View>
  );
}
