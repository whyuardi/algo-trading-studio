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
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
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
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
      <GridBackground />

      {/* Glow orb */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 border border-border bg-card px-4 py-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            v2.4 — Now supporting 12 chains
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6 text-6xl font-black leading-[0.9] tracking-tighter sm:text-8xl md:text-9xl"
        >
          <span className="block text-foreground">Build.</span>
          <span className="block text-foreground">Backtest.</span>
          <span className="block text-accent">Deploy.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl"
        >
          The visual trading strategy builder for DeFi.
          Drag. Connect. Ship. No code. No limits.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#cta"
            className="group flex items-center gap-2 border border-accent bg-accent px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-background transition-all hover:shadow-[0_0_30px_rgba(0,255,170,0.4)]"
          >
            Start Building
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#features"
            className="flex items-center gap-2 border border-border bg-card px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-foreground/70 transition-all hover:border-accent/40 hover:text-accent"
          >
            Explore Features
            <ChevronRight className="h-4 w-4" />
          </a>
        </motion.div>

        {/* Code preview snippet */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-16 max-w-2xl border border-border bg-card/80 p-6 text-left font-mono text-xs backdrop-blur-sm sm:text-sm"
        >
          <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
            <span className="ml-2 text-muted">strategy.algo</span>
          </div>
          <pre className="overflow-x-auto text-foreground/60">
            <span className="text-accent">const</span> strategy = {'{'}
            {'\n'}{'  '}name: <span className="text-amber-400/80">&quot;Momentum Scalper&quot;</span>,
            {'\n'}{'  '}chain: <span className="text-amber-400/80">&quot;ethereum&quot;</span>,
            {'\n'}{'  '}indicators: [<span className="text-amber-400/80">&quot;RSI&quot;</span>, <span className="text-amber-400/80">&quot;MACD&quot;</span>, <span className="text-amber-400/80">&quot;VWAP&quot;</span>],
            {'\n'}{'  '}risk: {'{ '}maxDrawdown: <span className="text-accent">0.05</span>, stopLoss: <span className="text-accent">0.02</span> {'}'},
            {'\n'}{'}'};
            {'\n'}
            {'\n'}<span className="text-accent">await</span> strategy.<span className="text-foreground/80">deploy</span>();  <span className="text-muted">// deployed to mainnet ✓</span>
          </pre>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
    <section id="features" className="relative border-t border-border bg-background px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-16 max-w-2xl">
          <span className="mb-4 block font-mono text-xs uppercase tracking-[0.3em] text-accent">
            // Features
          </span>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Everything you need.
            <br />
            <span className="text-muted">Nothing you don&apos;t.</span>
          </h2>
        </div>

        {/* Features grid */}
        <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative border border-border bg-card p-6 transition-all duration-300 hover:border-accent/30 hover:bg-card/80"
            >
              {/* Corner tag */}
              <span className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-widest text-muted/50">
                {f.tag}
              </span>

              <div className="mb-4 flex h-10 w-10 items-center justify-center border border-border bg-background transition-colors group-hover:border-accent/30">
                <f.icon className="h-5 w-5 text-accent" />
              </div>

              <h3 className="mb-2 font-mono text-sm font-bold uppercase tracking-wide text-foreground">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
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
    <section id="how-it-works" className="relative border-t border-border bg-card/30 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-16 max-w-2xl">
          <span className="mb-4 block font-mono text-xs uppercase tracking-[0.3em] text-accent">
            // How it works
          </span>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Three steps.
            <br />
            <span className="text-muted">Zero friction.</span>
          </h2>
        </div>

        {/* Steps */}
        <div ref={ref} className="grid gap-6 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative border border-border bg-card p-8"
            >
              {/* Step number */}
              <span className="mb-6 block font-mono text-6xl font-black text-accent/10">
                {s.num}
              </span>

              {/* Connector line between steps (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="absolute top-1/2 right-0 hidden h-[2px] w-8 translate-x-full bg-border lg:block" />
              )}

              <div className="mb-4 flex h-10 w-10 items-center justify-center border border-accent/20 bg-accent/5">
                <s.icon className="h-5 w-5 text-accent" />
              </div>

              <h3 className="mb-3 font-mono text-lg font-bold uppercase tracking-wide text-foreground">
                {s.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                {s.description}
              </p>

              {/* Code-like detail */}
              <div className="border-t border-border pt-4">
                <span className="font-mono text-xs text-accent/70">
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

function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="stats" className="relative border-t border-border bg-background px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="mb-4 block font-mono text-xs uppercase tracking-[0.3em] text-accent">
            // By the numbers
          </span>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Trusted at scale.
          </h2>
        </div>

        {/* Stats grid */}
        <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative border border-border bg-card p-8 text-center"
            >
              <s.icon className="mx-auto mb-4 h-6 w-6 text-accent/40" />
              <div className="mb-2 font-mono text-4xl font-black text-foreground sm:text-5xl">
                <AnimatedCounter end={s.value} suffix={s.suffix} />
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted">
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
    <section id="cta" className="relative border-t border-border bg-background px-6 py-24 sm:py-32">
      <GridBackground />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="mb-6 block font-mono text-xs uppercase tracking-[0.3em] text-accent">
          // Ready?
        </span>

        <h2 className="mb-6 text-5xl font-black tracking-tight sm:text-7xl">
          Start Building
          <br />
          <span className="text-accent">Now.</span>
        </h2>

        <p className="mx-auto mb-10 max-w-xl text-lg text-muted">
          Join 10,000+ traders building strategies with visual tools.
          Free tier available. No credit card required.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#"
            className="group flex animate-glow items-center gap-3 border border-accent bg-accent px-10 py-5 font-mono text-sm font-bold uppercase tracking-widest text-background transition-all hover:bg-accent-dim"
          >
            <Zap className="h-4 w-4" />
            Launch Studio
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {['No lock-in', 'Open source SDK', 'SOC 2 Type II', 'Self-custody'].map((badge) => (
            <span
              key={badge}
              className="border border-border bg-card/50 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted"
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
    <footer className="border-t border-border bg-card/30 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#" className="mb-4 flex items-center gap-2 font-mono text-sm font-bold">
              <Terminal className="h-5 w-5 text-accent" />
              <span className="text-accent">ALGO</span>
              <span className="text-foreground/60">STUDIO</span>
            </a>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Visual algorithmic trading for the decentralized future.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-foreground/60">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-muted transition-colors hover:text-accent"
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
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted/50">
            &copy; 2026 AlgoStudio. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted/50">
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
      <CTA />
      <Footer />
    </main>
  );
}