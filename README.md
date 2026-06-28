# 📈 Capital Crusade — Financial Market Simulation & Strategy Game

<div align="center">

[![React Native](https://img.shields.io/badge/React_Native-0.74+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK_51+-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![Reanimated](https://img.shields.io/badge/Motion-Reanimated_3-FF4154?style=for-the-badge)](https://docs.swmansion.com/react-native-reanimated/)
[![Tailwind / NativeWind](https://img.shields.io/badge/Styling-NativeWind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://www.nativewind.dev/)
[![Zustand](https://img.shields.io/badge/State-Zustand-443E38?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**An interactive, mobile financial education simulation game built with Expo, Reanimated, and NativeWind. Navigate real-time macroeconomic shocks, portfolio allocation, and market cycles across a fast-paced 10-year simulation.**

[Gameplay & Features](#-gameplay--features) • [Simulation Engine](#-simulation-engine) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started)

</div>

---

## 🎮 Gameplay & Features

Most financial education apps are boring textbooks or static quizzes. **Capital Crusade** turns macroeconomic literacy and portfolio risk management into a fast-paced, high-stakes mobile simulation:

- 📊 **Real-Time Economic Engine**: Experience 10 simulated market years in minutes. Dynamic asset price fluctuation models for equities, fixed income, gold, cash, and real estate.
- ⚡ **Macro Events & Black Swans**: React in real time to market shocks — inflation spikes, interest rate cuts, tech booms, and recessions.
- 🎛️ **Interactive Controls**: Multi-speed simulation controls (`1×`, `2×`, `4×`), pause/resume, and responsive portfolio reallocation sliders.
- 📜 **Dossiers & Market Briefings**: In-depth asset dossiers break down risk profiles, historical volatility, and strategic roles of each asset class.
- 🏆 **Comprehensive Debrief & Settlement**: End-of-year settlement screens and final debriefs analyze your Sharpe-like risk-adjusted performance, net worth trajectory, and behavioral biases.
- 🔊 **Haptics & Rich Audio**: Tactile feedback on trades and market announcements with smooth physics-based micro-interactions powered by React Native Reanimated.

---

## ⚙️ Simulation Engine

The core simulation loop runs inside [`lib/engine/`](lib/engine/) and [`store/marketSlice.ts`](store/marketSlice.ts):
- **Tick Rate**: Configurable interval ticks representing simulated days.
- **Price Generation**: Stochastic price movement incorporating drift, asset-specific volatility, and correlation matrices.
- **Event Dispatcher**: News events fire based on state triggers or probability distributions, dynamically shifting asset trend coefficients.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Mobile Core** | React Native (v0.74) & Expo SDK 51 |
| **Navigation** | Expo Router (Typed file-based routing) |
| **Animation & Physics** | React Native Reanimated 3 |
| **Styling** | NativeWind v4 (Tailwind CSS for React Native) |
| **State Management** | Zustand (Modular game & market slices) |
| **Audio & Haptics** | `expo-av` and `expo-haptics` |
| **Language** | TypeScript |

---

## 📱 Screen Flow & Architecture

```text
Capital-crusade/
├── app/                  # File-based navigation
│   ├── index.tsx         # Main Menu & How to Play
│   ├── goal-select.tsx   # Choose financial target & risk tolerance
│   ├── briefing.tsx      # Economic environment & starting conditions
│   ├── ready.tsx         # Pre-flight countdown
│   ├── play.tsx          # Real-time simulation view (prices, news, speed controls)
│   ├── settlement.tsx    # Annual portfolio rebalancing & dividend payouts
│   ├── debrief.tsx       # Game Over performance breakdown & report card
│   └── dossier.tsx       # Educational asset deep-dives
├── components/           # Reusable UI primitives (AppText, Button, BullAgent)
├── store/                
│   ├── gameStore.ts      # Global game orchestration
│   └── marketSlice.ts    # Market prices, portfolio positions & history
├── lib/
│   ├── engine/           # Economic simulation math & event loops
│   └── selectors.ts      # Memoized financial metrics & calculations
└── types/                # Domain models (Asset, Event, GameState, Portfolio)
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- [Bun](https://bun.sh) (recommended) or `npm`
- [Expo Go](https://expo.dev/go) app on iOS or Android

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vishnu601/capital-crusade.git
   cd capital-crusade
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Start the development server**:
   ```bash
   bun run start -c
   ```

4. **Launch the Game**:
   - Scan the terminal QR code using **Expo Go** on your device.
   - Or press `i` for iOS Simulator / `a` for Android Emulator.

---

## 📄 License

MIT License — Copyright (c) 2026 Vishnu Ganesh. See [LICENSE](LICENSE) for details.
