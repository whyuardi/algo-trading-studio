'use client';

import { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Layers,
  BarChart3,
  Globe,
  Gauge,
  Shield,
  Activity,
  ArrowRight,
  ChevronRight,
  ArrowDownRight,
  Zap,
  GitBranch,
  Rocket,
  Menu,
  X,
  Terminal,
  Cpu,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

/* ------------------------------------------------------------------ */
/*  ANIMATED COUNTER                                                   */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const startTime = performance.now();
    let rafId: number;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = progress * (2 - progress);
      const currentVal = eased * end;

      setCount(currentVal);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [inView, end]);

  const displayValue = Number.isInteger(end) ? Math.round(count).toLocaleString() : count.toFixed(1);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{displayValue}{suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  GRID BACKGROUND (brutalist pixel grid)                             */
/* ------------------------------------------------------------------ */
function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Horizontal lines */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, var(--accent) 79px, var(--accent) 80px)`,
        }}
      />
      {/* Vertical lines */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 79px, var(--accent) 79px, var(--accent) 80px)`,
        }}
      />
      {/* Gradient overlay from top */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-transparent to-[#0A0A0F]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NAVBAR                                                             */
/* ------------------------------------------------------------------ */
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = ['Features', 'How It Works', 'Stats', 'Pricing'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight">
          <Terminal className="h-5 w-5 text-accent" />
          <span className="text-accent">ALGO</span>
          <span className="text-foreground/60">STUDIO</span>
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
              className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              {l}
            </a>
          ))}
          <a
            href="#cta"
            className="border border-accent bg-accent/10 px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-accent transition-all hover:bg-accent hover:text-background"
          >
            Launch App
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-muted md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border bg-background/95 px-6 py-6 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setOpen(false)}
                className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
              >
                {l}
              </a>
            ))}
            <a
              href="#cta"
              onClick={() => setOpen(false)}
              className="mt-2 border border-accent bg-accent/10 px-5 py-3 text-center font-mono text-xs font-bold uppercase tracking-widest text-accent transition-all hover:bg-accent hover:text-background"
            >
              Launch App
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden px-6 pt-16">
      <GridBackground />

      {/* Glow orb */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
      />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-0 text-center sm:px-4">

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex w-max max-w-full items-center gap-2 border border-border bg-card px-3 py-1.5 sm:mb-8 sm:px-4 sm:py-2"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="truncate font-mono text-[10px] uppercase tracking-widest text-muted sm:text-xs">
            v2.4 — Now supporting 12 chains
          </span>
        </motion.div>

        {/* Main headline — inline wraps on mobile, stacked on desktop */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-4 text-5xl font-black leading-[1.1] tracking-tight sm:mb-6 sm:text-6xl sm:leading-[0.9] sm:tracking-tighter md:text-8xl lg:text-9xl"
        >
          <span className="inline sm:block text-foreground">Build.<span className="hidden sm:inline"><br /></span> </span>
          <span className="inline sm:block text-foreground">Backtest.<span className="hidden sm:inline"><br /></span> </span>
          <span className="inline sm:block text-accent">Deploy.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mb-8 max-w-full px-2 text-base leading-relaxed text-muted sm:mb-10 sm:max-w-2xl sm:px-0 sm:text-lg lg:text-xl"
        >
          The visual trading strategy builder for DeFi.
          Drag. Connect. Ship. No code. No limits.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4"
        >
          <a
            href="/builder"
            className="group flex w-full items-center justify-center gap-2 border border-accent bg-accent px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-background transition-all hover:shadow-[0_0_30px_rgba(0,255,170,0.4)] sm:w-auto sm:px-8 sm:py-4 sm:text-sm"
          >
            Start Building
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
          </a>
          <a
            href="#features"
            className="group flex w-full items-center justify-center gap-2 border border-border bg-card px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-foreground/70 transition-all hover:border-accent/40 hover:text-accent sm:w-auto sm:px-8 sm:py-4 sm:text-sm"
          >
            Explore Features
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
          </a>
        </motion.div>

        {/* Code preview snippet */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-10 w-full max-w-full border border-border bg-card/80 p-4 text-left font-mono text-xs backdrop-blur-sm sm:mt-16 sm:max-w-2xl sm:p-6 sm:text-sm"
        >
          <div className="mb-2 flex items-center gap-2 border-b border-border pb-2 sm:mb-3 sm:pb-3">
            <div className="h-2 w-2 rounded-full bg-foreground/10 sm:h-2.5 sm:w-2.5" />
            <div className="h-2 w-2 rounded-full bg-foreground/10 sm:h-2.5 sm:w-2.5" />
            <div className="h-2 w-2 rounded-full bg-foreground/10 sm:h-2.5 sm:w-2.5" />
            <span className="ml-1.5 truncate text-muted sm:ml-2">strategy.algo</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre text-foreground/60">
            <span className="text-accent">const</span> strategy = {'{'}
            {'\n'}{'  '}name: <span className="text-amber-400/80">&quot;Momentum Scalper&quot;</span>,
            {'\n'}{'  '}chain: <span className="text-amber-400/80">&quot;ethereum&quot;</span>,
            {'\n'}{'  '}indicators: [<span className="text-amber-400/80">&quot;RSI&quot;</span>, <span className="text-amber-400/80">&quot;MACD&quot;</span>, <span className="text-amber-400/80">&quot;VWAP&quot;</span>],
            {'\n'}{'  '}risk: {'{ '}maxDrawdown: <span className="text-accent">0.05</span>, stopLoss: <span className="text-accent">0.02</span> {'}'},
            {'\n'}{'}'};
            {'\n'}
            {'\n'}
          </pre>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:bottom-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Scroll</span>
          <ArrowDownRight className="h-4 w-4 rotate-90 text-muted" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FEATURES                                                           */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    icon: Layers,
    title: 'Visual Node Editor',
    description: 'Drag-and-drop strategy builder with 50+ pre-built indicator nodes. No code required.',
    tag: 'CORE',
  },
  {
    icon: BarChart3,
    title: 'Real-time Backtesting',
    description: 'Test against years of historical data. See slippage, fees, and real-world execution.',
    tag: 'ANALYTICS',
  },
  {
    icon: Globe,
    title: 'Multi-Chain Deploy',
    description: 'One-click deployment to 12 chains. Ethereum, Solana, Arbitrum, and more.',
    tag: 'INFRA',
  },
  {
    icon: Gauge,
    title: 'Gas Optimization',
    description: 'Built-in gas estimator. Auto-tune execution timing to minimize fees.',
    tag: 'PERF',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Position sizing, max drawdown, stop-loss. Risk limits enforced on-chain.',
    tag: 'SECURITY',
  },
  {
    icon: Activity,
    title: 'Live Monitoring',
    description: 'Real-time P&L dashboards. Alerts via Telegram, Discord, email.',
    tag: 'OPS',
  },
];

function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="relative border-t border-border bg-background px-4 py-12 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-10 max-w-2xl sm:mb-16">
          <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.3em] text-accent sm:mb-4 sm:text-xs">
            // Features
          </span>
          <h2 className="text-3xl font-black leading-[1.15] tracking-tight sm:text-5xl">
            Everything you need.
            <br />
            <span className="text-muted">Nothing you don&apos;t.</span>
          </h2>
        </div>

        {/* Features grid */}
        <div ref={ref} className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative border border-border bg-card p-5 transition-all duration-300 hover:border-accent/30 hover:bg-card/80 sm:p-6"
            >
              {/* Corner tag */}
              <span className="absolute top-2 right-2 font-mono text-[9px] uppercase tracking-widest text-muted/50 sm:top-3 sm:right-3 sm:text-[10px]">
                {f.tag}
              </span>

              <div className="mb-3 flex h-9 w-9 items-center justify-center border border-border bg-background transition-colors group-hover:border-accent/30 sm:mb-4 sm:h-10 sm:w-10">
                <f.icon className="h-4 w-4 text-accent sm:h-5 sm:w-5" />
              </div>

              <h3 className="mb-1.5 font-mono text-xs font-bold uppercase tracking-wide text-foreground sm:mb-2 sm:text-sm">
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted sm:text-sm">
                {f.description}
              </p>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS                                                       */
/* ------------------------------------------------------------------ */
const STEPS = [
  {
    num: '01',
    icon: Layers,
    title: 'Drag Indicators',
    description: 'Pull RSI, MACD, Bollinger Bands, or any of 50+ indicators onto the canvas. Build your edge visually.',
    detail: 'No YAML. No JSON. Just drag.',
  },
  {
    num: '02',
    icon: GitBranch,
    title: 'Connect Logic',
    description: 'Wire indicators to buy/sell signals with conditional nodes. Set entry rules, exits, and risk limits.',
    detail: 'IF RSI < 30 AND volume > avg → BUY',
  },
  {
    num: '03',
    icon: Rocket,
    title: 'Deploy Bot',
    description: 'One click to deploy on any supported chain. Monitor live via dashboard. Pause or modify anytime.',
    detail: 'From canvas to mainnet in 60 seconds.',
  },
];

function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" className="relative border-t border-border bg-card/30 px-4 py-12 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-10 max-w-2xl sm:mb-16">
          <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.3em] text-accent sm:mb-4 sm:text-xs">
            // How it works
          </span>
          <h2 className="text-3xl font-black leading-[1.15] tracking-tight sm:text-5xl">
            Three steps.
            <br />
            <span className="text-muted">Zero friction.</span>
          </h2>
        </div>

        {/* Steps */}
        <div ref={ref} className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative border border-border bg-card p-5 sm:p-8"
            >
              {/* Step number */}
              <span className="mb-4 block font-mono text-4xl font-black text-accent/15 sm:mb-6 sm:text-6xl sm:text-accent/10">
                {s.num}
              </span>

              {/* Connector line between steps (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="absolute top-1/2 right-0 hidden h-[2px] w-8 translate-x-full bg-border lg:block" />
              )}

              <div className="mb-3 flex h-9 w-9 items-center justify-center border border-accent/20 bg-accent/5 sm:mb-4 sm:h-10 sm:w-10">
                <s.icon className="h-4 w-4 text-accent sm:h-5 sm:w-5" />
              </div>

              <h3 className="mb-2 font-mono text-sm font-bold uppercase tracking-wide text-foreground sm:mb-3 sm:text-lg">
                {s.title}
              </h3>
              <p className="mb-3 text-xs leading-relaxed text-muted sm:mb-4 sm:text-sm">
                {s.description}
              </p>

              {/* Code-like detail */}
              <div className="border-t border-border pt-3 sm:pt-4">
                <span className="font-mono text-[10px] text-accent/70 sm:text-xs">
                  {s.detail}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  STATS                                                              */
/* ------------------------------------------------------------------ */
const STATS = [
  { value: 10000, suffix: '+', label: 'Strategies Built', icon: Layers },
  { value: 500, suffix: '+', label: 'Active Bots', icon: Cpu },
  { value: 99.9, suffix: '%', label: 'Uptime', icon: Activity },
  { value: 12, suffix: '', label: 'Chains Supported', icon: Globe },
];

/* ------------------------------------------------------------------ */
/*  LIVE DEMO                                                         */
/* ------------------------------------------------------------------ */
const DEMO_LABELS = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
const DEMO_EQUITY = [
  10000, 10080, 10150, 10090, 10210, 10300, 10250, 10380, 10420, 10510,
  10470, 10590, 10680, 10620, 10740, 10830, 10780, 10900, 11020, 10950,
  11080, 11170, 11250, 11180, 11320, 11410, 11350, 11490, 11580, 11670,
];

function LiveDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const chartData = {
    labels: DEMO_LABELS,
    datasets: [
      {
        label: 'Equity Curve',
        data: DEMO_EQUITY,
        borderColor: '#00FFAA',
        backgroundColor: 'rgba(0, 255, 170, 0.06)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111118',
        borderColor: '#1A1A24',
        borderWidth: 1,
        titleFont: { family: 'monospace', size: 11 },
        bodyFont: { family: 'monospace', size: 12, weight: 'bold' as const },
        titleColor: '#4A4845',
        bodyColor: '#00FFAA',
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) =>
            `Equity: $${(ctx.parsed.y ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  } as const;

  return (
    <section id="live-demo" className="relative border-t border-border bg-card/30 px-4 py-12 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-10 text-center sm:mb-16">
          <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.3em] text-accent sm:mb-4 sm:text-xs">
            // Live Demo
          </span>
          <h2 className="text-3xl font-black leading-[1.15] tracking-tight sm:text-5xl">
            See it in action.
            <br />
            <span className="text-muted">Real strategy performance.</span>
          </h2>
        </div>

        <div ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-5xl overflow-hidden border border-border bg-card"
          >
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent sm:h-2.5 sm:w-2.5" />
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-foreground sm:text-sm">
                  Momentum Scalper
                </span>
                <span className="border border-accent/20 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-accent sm:px-2 sm:text-[10px]">
                  Live
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted sm:text-xs">
                Ethereum &middot; 30-day backtest
              </span>
            </div>

            {/* Chart */}
            <div className="h-48 px-3 pt-3 sm:h-72 sm:px-4 sm:pt-4">
              <Line data={chartData} options={chartOptions} />
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
              {[
                { label: 'Total Return', value: '+16.7%', positive: true },
                { label: 'Sharpe Ratio', value: '2.34', positive: true },
                { label: 'Win Rate', value: '68.2%', positive: true },
                { label: 'Max Drawdown', value: '-3.8%', positive: false },
              ].map((m) => (
                <div key={m.label} className="border-border p-2.5 text-center sm:p-4 sm:border-r last:border-r-0">
                  <div className="mb-0.5 font-mono text-[9px] uppercase tracking-widest text-muted sm:mb-1 sm:text-[10px]">
                    {m.label}
                  </div>
                  <div className={`font-mono text-sm font-bold sm:text-lg ${m.positive ? 'text-accent' : 'text-red-400'}`}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA bar */}
            <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
              <p className="font-mono text-[10px] text-muted sm:text-xs">
                Strategy: RSI &lt; 30 &amp; MACD crossover &amp; Volume spike &rarr; Buy
              </p>
              <a
                href="/builder"
                className="group inline-flex w-full items-center justify-center gap-2 border border-accent bg-accent/10 px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-accent transition-all hover:bg-accent hover:text-background whitespace-nowrap sm:w-auto sm:px-6 sm:py-3 sm:text-xs"
              >
                Try Builder
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="stats" className="relative border-t border-border bg-background px-4 py-12 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-10 text-center sm:mb-16">
          <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.3em] text-accent sm:mb-4 sm:text-xs">
            // By the numbers
          </span>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Trusted at scale.
          </h2>
        </div>

        {/* Stats grid */}
        <div ref={ref} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative border border-border bg-card p-5 text-center sm:p-8"
            >
              <s.icon className="mx-auto mb-3 h-5 w-5 text-accent/40 sm:mb-4 sm:h-6 sm:w-6" />
              <div className="mb-1 font-mono text-2xl font-black text-foreground sm:mb-2 sm:text-4xl lg:text-5xl">
                <AnimatedCounter end={s.value} suffix={s.suffix} />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted sm:text-xs">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA                                                                */
/* ------------------------------------------------------------------ */
function CTA() {
  return (
    <section id="cta" className="relative border-t border-border bg-background px-4 py-12 sm:px-6 sm:py-32">
      <GridBackground />

      <div className="relative z-10 mx-auto max-w-3xl px-0 text-center sm:px-4">
        <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.3em] text-accent sm:mb-6 sm:text-xs">
          // Ready?
        </span>

        <h2 className="mb-4 text-4xl font-black leading-[1.1] tracking-tight sm:mb-6 sm:text-5xl lg:text-7xl">
          Start Building
          <br />
          <span className="text-accent">Now.</span>
        </h2>

        <p className="mx-auto mb-8 max-w-full px-2 text-base leading-relaxed text-muted sm:mb-10 sm:max-w-xl sm:px-0 sm:text-lg">
          Join 10,000+ traders building strategies with visual tools.
          Free tier available. No credit card required.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="/builder"
            className="group flex w-full max-w-xs items-center justify-center gap-3 border border-accent bg-accent px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-background transition-all hover:bg-accent-dim sm:w-auto sm:px-10 sm:py-5 sm:text-sm"
          >
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Launch Studio
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12 sm:gap-6">
          {['No lock-in', 'Open source SDK', 'SOC 2 Type II', 'Self-custody'].map((badge) => (
            <span
              key={badge}
              className="border border-border bg-card/50 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-muted sm:px-4 sm:py-2 sm:text-[10px]"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOOTER                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  const columns = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Roadmap', 'Changelog', 'API Docs'],
    },
    {
      title: 'Resources',
      links: ['Documentation', 'Tutorials', 'Strategy Templates', 'Blog', 'Status'],
    },
    {
      title: 'Community',
      links: ['Discord', 'Telegram', 'Twitter / X', 'GitHub', 'Forum'],
    },
    {
      title: 'Company',
      links: ['About', 'Careers', 'Legal', 'Privacy', 'Terms'],
    },
  ];

  return (
    <footer className="border-t border-border bg-card/30 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 grid-cols-1 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5 lg:mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#" className="mb-3 flex items-center gap-2 font-mono text-sm font-bold sm:mb-4">
              <Terminal className="h-5 w-5 text-accent" />
              <span className="text-accent">ALGO</span>
              <span className="text-foreground/60">STUDIO</span>
            </a>
            <p className="mt-2 text-[11px] leading-relaxed text-muted sm:mt-3 sm:text-xs">
              Visual algorithmic trading for the decentralized future.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/60 sm:mb-4 sm:text-xs">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-1.5 sm:gap-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[11px] text-muted transition-colors hover:text-accent sm:text-xs"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:gap-4 sm:pt-8">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted/50 sm:text-[10px]">
            &copy; 2026 AlgoStudio. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted/50 sm:text-[10px]">
                All systems operational
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <LiveDemo />
      <CTA />
      <Footer />
    </main>
  );
}