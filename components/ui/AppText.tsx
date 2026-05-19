import { Text, TextStyle } from "react-native";

type TextVariant = "display" | "title" | "heading" | "body" | "caption" | "micro";
type TextColor = "primary" | "secondary" | "muted" | "disabled" | "bull" | "success" | "danger";

interface AppTextProps {
  variant?: TextVariant;
  color?: TextColor;
  children: React.ReactNode;
  className?: string;
  style?: TextStyle;
  numberOfLines?: number;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  display: { fontSize: 36, lineHeight: 40, fontFamily: "Inter_800ExtraBold" },
  title:   { fontSize: 24, lineHeight: 30, fontFamily: "Inter_700Bold" },
  heading: { fontSize: 18, lineHeight: 24, fontFamily: "Inter_600SemiBold" },
  body:    { fontSize: 15, lineHeight: 22, fontFamily: "Inter_400Regular" },
  caption: { fontSize: 13, lineHeight: 18, fontFamily: "Inter_500Medium" },
  micro:   { fontSize: 11, lineHeight: 14, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
};

const colorMap: Record<TextColor, string> = {
  primary:   "#F5F7FA",
  secondary: "#C5CCD9",
  muted:     "#8B95A7",
  disabled:  "#4A5468",
  bull:      "#FFB627",
  success:   "#2DD4BF",
  danger:    "#F87171",
};

export function AppText({ variant = "body", color = "primary", children, className, style, numberOfLines }: AppTextProps) {
  return (
    <Text
      className={className}
      style={[variantStyles[variant], { color: colorMap[color] }, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
