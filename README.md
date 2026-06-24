# ⚡ Algo Studio — Visual Algorithmic Trading Bot Builder

> Build. Backtest. Deploy. — Drag-and-drop trading strategies for DeFi, no code required.

![Deployed](https://img.shields.io/badge/status-live-00FFAA?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square)
![Chains](https://img.shields.io/badge/chains-12-00FFAA?style=flat-square)

---

## 🚀 Live Demo

**→ [algo-trading-studio.vercel.app](https://algo-trading-studio.vercel.app)**

---

## 📋 Overview

Algo Studio is a **visual strategy builder** for algorithmic cryptocurrency trading. No coding required — drag indicators onto a canvas, connect logic nodes, and deploy to 12+ blockchains with one click.

Built for traders who want to backtest strategies against historical data, optimize gas fees, and monitor live P&L — all from a single dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Visual Node Editor** | 50+ pre-built indicator nodes. Drag, connect, ship. |
| **Real-time Backtesting** | Test against years of historical data with realistic slippage & fees. |
| **Multi-Chain Deploy** | One-click deployment to Ethereum, Solana, Arbitrum, and 9 more chains. |
| **Gas Optimization** | Built-in estimator with auto-tune execution timing. |
| **Risk Management** | Position sizing, max drawdown, stop-loss enforced on-chain. |
| **Live Monitoring** | Real-time P&L dashboards with Telegram/Discord alerts. |

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 + CSS custom properties
- **Fonts:** Inter + JetBrains Mono
- **Charts:** Chart.js + react-chartjs-2
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** Vercel (Edge Network)

---

## 🏗 Project Structure

```
algo-trading-studio/
├── src/
│   ├── app/
│   │   ├── globals.css        # Design tokens, theme, utilities
│   │   ├── layout.tsx         # Root layout (fonts, metadata)
│   │   └── page.tsx           # Landing page (Hero, Features, HowItWorks, Stats, LiveDemo, CTA, Footer)
│   └── ...
├── public/                    # Static assets
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind theme extensions
└── package.json
```

---

## 🧑‍💻 Getting Started

```bash
# Clone the repository
git clone https://github.com/whyuardi/algo-trading-studio.git
cd algo-trading-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗 Production Build

```bash
npm run build
npm start
```

---

## 📱 Mobile Responsive

Fully optimized for mobile viewports — all sections (Hero, Features, How It Works, Stats, Live Demo, CTA, Footer) adapt with compact padding, reduced font sizes, and stacked layouts.

---

## 🔗 Links

- **Live Site:** [algo-trading-studio.vercel.app](https://algo-trading-studio.vercel.app)
- **Repository:** [github.com/whyuardi/algo-trading-studio](https://github.com/whyuardi/algo-trading-studio)
- **Author:** [@whyuardi](https://github.com/whyuardi)

---

> Built with Next.js · Deployed on Vercel · Powered by caffeine ☕
