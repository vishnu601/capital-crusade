/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "bg-primary":        "#0A0E1A",
        "bg-elevated":       "#141B2D",
        "bg-overlay":        "#1E2740",
        "border-subtle":     "#2A3450",
        "accent-bull":       "#FFB627",
        "accent-bull-glow":  "#FFD166",
        "accent-success":    "#2DD4BF",
        "accent-success-soft":"#134E4A",
        "accent-danger":     "#F87171",
        "accent-danger-soft":"#4C1D1D",
        "text-primary":      "#F5F7FA",
        "text-secondary":    "#C5CCD9",
        "text-muted":        "#8B95A7",
        "text-disabled":     "#4A5468",
      },
      fontSize: {
        "display": ["36px", { lineHeight: "40px", fontWeight: "800" }],
        "title":   ["24px", { lineHeight: "30px", fontWeight: "700" }],
        "heading": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body":    ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "caption": ["13px", { lineHeight: "18px", fontWeight: "500" }],
        "micro":   ["11px", { lineHeight: "14px", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};
