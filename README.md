# 🫏 DonkeyType

```text
  ██████╗  ██████╗ ███╗   ██╗██╗  ██╗███████╗██╗   ██╗████████╗██╗   ██╗██████╗ ███████╗
  ██╔══██╗██╔═══██╗████╗  ██║██║ ██╔╝██╔════╝╚██╗ ██╔╝╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝
  ██║  ██║██║   ██║██╔██╗ ██║█████╔╝ █████╗   ╚████╔╝    ██║    ╚████╔╝ ██████╔╝█████╗  
  ██║  ██║██║   ██║██║╚██╗██║██╔═██╗ ██╔══╝    ╚██╔╝     ██║     ╚██╔╝  ██╔═══╝ ██╔══╝  
  ██████╔╝╚██████╔╝██║ ╚████║██║  ██╗███████╗   ██║      ██║      ██║   ██║     ███████╗
  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝   ╚═╝      ╚═╝      ╚═╝   ╚═╝     ╚══════╝
                     A Minimalist Typing Test Clone with Custom Themes
```

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Hosted-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🐴 What is DonkeyType?

DonkeyType is a **high-fidelity minimalist typing test application** heavily inspired by MonkeyType. Designed with high-performance typing mechanics and a slick aesthetic, it provides users with an instant tool to gauge, monitor, and train their typing speed (Words Per Minute) and typing accuracy. 

DonkeyType functions as a client-side Single Page Application (SPA) designed to compile instantly and run with buttery smooth animations, persistent stats tracking, and customizable typing parameters.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| Production Web App (Vercel Ready) | [https://donkey-type-ahk.vercel.app/](https://donkey-type-ahk.vercel.app/) |

---

## ✨ Feature List

### 🎯 High-Fidelity Typing Mechanics
- Responsive caret tracking with smooth transition effects.
- Direct character-by-character validation flagging mistakes in real-time.
- Audio profile selection including **Mechanical**, **Click**, and **Typewriter** sound feedback for keystrokes and errors.

### ⚙️ Rich Configuration Panel
- **Flexible Test Modes:** Switch seamlessly between `time` tests, `words` counts, formal `quote` selections, and open-ended `zen` mode.
- **Dynamic Word Sets:** Toggle vocabularies between `normal` (frequent English words), `english1000` (extended vocabulary), and `code` (common development syntax and symbols).

### 📈 Interactive Performance Analysis
- Built-in live tracking graphing raw speed, net speed (WPM), and precision errors per second.
- End-of-test review charts compiled dynamically with **Recharts** and **D3.js**.
- Detailed stats report breakdown mapping correct, incorrect, missed, and extra character counts.

### 🕶️ Aesthetic Theming & Interface Comfort
- Fully integrated global theme loader with 15+ gorgeous palettes (e.g. Donkey, Dark, Cyberpunk, Lavender, Matrix, Peach, and more).
- **Focus Mode:** A modular toggle to auto-hide the Header, Brand Navigation, and Footers the instant typing begins, minimizing cognitive load.

### 🛡️ Social Integration & Local Persistence
- **Social Sharing:** Instant "Share on Twitter" integration auto-populating results, alongside an elegant "Copy Results" clipboard utility.
- **Persistent Storage:** Browser-level `localStorage` integration records stats, daily completion streak, user settings, and leaderboard results offline.

---

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                  │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ React 18 / Vite Single Page Application                        │   │
│   │ (Tailwind CSS, Inter Typography, Framer Motion transitions)    │   │
│   └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼──────────────────────────────────────┐
│                            COMPONENT TREE                              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ App.tsx (Main Coordinator / Settings & Theme Engine)           │   │
│   │  ├─ Header.tsx (Logo, Tabs, Streak, Audio profile status)      │   │
│   │  ├─ TypingPanel.tsx (Caret engine, word selector, sound engine)│   │
│   │  ├─ ResultPanel.tsx (Performance metrics, Twitter/Copy social) │   │
│   │  ├─ LeaderboardPanel.tsx (Ranked user scores, filter panels)   │   │
│   │  ├─ StatsPanel.tsx (Overall history charts, streaks, stats)    │   │
│   │  └─ ThemeSelector.tsx (Real-time custom palette injection)     │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Client

| Technology | Role |
|------------|------|
| React 18+ | UI Component Framework |
| TypeScript | High-precision Type Safety |
| Vite 5+ | Fast compilation and bundling |
| Tailwind CSS | Utility-first responsive styling and palette variables |
| Framer Motion | Smooth tab transitions and interactive animations |
| Recharts & D3 | Dynamic charting and performance metrics |
| Lucide React | Clean, scalable modern icons |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel / Cloud Run | High-performance CDN hosting and edge routing |
| Local Storage | Secure sandboxed persistent cache for local history and leaderboard entries |

---

## ⚙️ How It Works

### 1. The Real-time Typing Engine
The caret tracks keystrokes on an off-screen `<input>` element to ensure full accessibility and flawless keyboard interaction on both mobile and desktop. Standard key triggers play context-appropriate key sounds dynamically.

### 2. Focus Mode Management
When enabled, an active key trigger sets `isFocusActive` state to true, firing high-performance CSS transition classes that gracefully slide out and fade away the Header and Footer to create an immersive, distraction-free environment.

### 3. Metric Calculations
- **WPM (Words Per Minute):** Calculated as `(charactersTyped / 5) / (secondsElapsed / 60)`.
- **Accuracy:** Tracked through the ratio of correct keys over total keystrokes.
- **Error Spikes:** Saved incrementally per second to construct beautiful line graphs on test completion.

---

## 📁 Project Structure

```text
DonkeyType/
│
├── assets/                       Static images and icons
├── src/                          Core Application Logic
│   ├── components/               React components
│   │   ├── Header.tsx            Header navigation, sound triggers & streak indicator
│   │   ├── TypingPanel.tsx       Typing area, input buffer, caret, sound player & focus mode
│   │   ├── ResultPanel.tsx       Speed summary, error details, Recharts graph & sharing hooks
│   │   ├── StatsPanel.tsx        Overall user history, records & cumulative charting
│   │   ├── LeaderboardPanel.tsx  Ranked system leaderboard with custom mode filters
│   │   └── ThemeSelector.tsx     Theme switcher with live configuration loader
│   │
│   ├── utils/                    Utility functions
│   │   └── audio.ts              Keypress sound synthesizer and context generator
│   │
│   ├── types.ts                  TypeScript global definitions and interface declarations
│   ├── data.ts                   English vocabularies (Normal, 1000) and curated quotes
│   ├── main.tsx                  React DOM entry point
│   └── index.css                 Tailwind directives and customized CSS overrides
│
├── index.html                    Main index viewport
├── package.json                  Dependency configurations & build commands
├── tsconfig.json                 TypeScript compiler parameters
├── vite.config.ts                Vite build rules
├── vercel.json                   Single-Page App URL routing and Vercel rewrite overrides
└── README.md                     Detailed project documentation
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Step 1 — Clone and Install Dependencies

```bash
# Install packages
npm install
```

### Step 2 — Start the Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Step 3 — Build and Lint Checks

```bash
# Check code structure
npm run lint

# Build production assets
npm run build
```

---

## 📡 Deployment (Vercel)

The project includes an optimized `vercel.json` rewrite configuration allowing smooth Single Page Application client-side routing on any target Vercel domain.

To deploy instantly:
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set the framework preset to **Vite**.
3. Hit **Deploy** — Vercel will build the React assets and publish the applet in seconds.

---

## 📄 License

This project is open-source and available for educational and commercial use under the MIT License.

---

**Made with ❤️ by [Abdul Hayy Khan](https://www.linkedin.com/in/abdulhayykhan)**
