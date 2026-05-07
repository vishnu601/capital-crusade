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
        "bg-primary": "#0A0E1A",
        "bg-elevated": "#141B2D",
        "accent-bull": "#FFB627",
        "accent-success": "#2DD4BF",
        "accent-danger": "#F87171",
        "text-primary": "#F5F7FA",
        "text-muted": "#8B95A7",
      },
    },
  },
  plugins: [],
};
