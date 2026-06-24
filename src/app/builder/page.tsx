"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { runBacktest as strategyEngineBacktest, generateStrategyFromPrompt, StrategyConfig } from "@/lib/strategy-engine";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  type OnConnect,
  type NodeProps,
  Handle,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  GitBranch,
  Zap,
  Target,
  Shield,
  Clock,
  BarChart3,
  ArrowRight,
  Play,
  Rocket,
  Save,
  Download,
  Settings,
  ChevronDown,
  X,
  Menu,
  Share2,
  Sparkles,
  Layout,
  RefreshCw,
  Brain,
  Copy,
  Check,
  Lightbulb,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

// ──────────────────────────────────────────────
// CUSTOM NODES
// ──────────────────────────────────────────────

function IndicatorNode({ data, selected }: NodeProps) {
  const colors: Record<string, string> = {
    RSI: "#FF6B6B",
    MACD: "#4ECDC4",
    "Moving Average": "#FFD93D",
    "Bollinger Bands": "#6C5CE7",
    Volume: "#00FFAA",
    Stochastic: "#FF8A5C",
  };
  const color = colors[data.indicator as string] || "#00FFAA";

  return (
    <div
      className={`bg-[#111118] border ${
        selected ? "border-[#00FFAA]" : "border-[#1A1A24]"
      } min-w-[180px] shadow-lg`}
    >
      <div className="px-3 py-1.5 border-b border-[#1A1A24] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-[0.6rem] font-mono uppercase tracking-wider text-[#4A4845]">
          Indicator
        </span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[#E8E6E3]">
          {data.indicator as string}
        </p>
        <p className="text-[0.65rem] font-mono text-[#4A4845] mt-0.5">
          {data.params as string}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#00FFAA] !border-2 !border-[#0A0A0F] !-bottom-[5px]"
      />
    </div>
  );
}

function ConditionNode({ data, selected }: NodeProps) {
  const icons: Record<string, React.ReactNode> = {
    ">": <TrendingUp className="w-3.5 h-3.5" />,
    "<": <TrendingDown className="w-3.5 h-3.5" />,
    ">=": <TrendingUp className="w-3.5 h-3.5" />,
    "<=": <TrendingDown className="w-3.5 h-3.5" />,
    crosses_above: (
      <ArrowRight className="w-3.5 h-3.5 rotate-[-45deg]" />
    ),
    crosses_below: (
      <ArrowRight className="w-3.5 h-3.5 rotate-[45deg]" />
    ),
  };

  return (
    <div
      className={`bg-[#111118] border ${
        selected ? "border-[#00FFAA]" : "border-[#1A1A24]"
      } min-w-[160px] shadow-lg`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[#FFD93D] !border-2 !border-[#0A0A0F] !-top-[5px]"
      />
      <div className="px-3 py-1.5 border-b border-[#1A1A24] flex items-center gap-2">
        <GitBranch className="w-3 h-3 text-[#FFD93D]" />
        <span className="text-[0.6rem] font-mono uppercase tracking-wider text-[#4A4845]">
          Condition
        </span>
      </div>
      <div className="px-3 py-2 flex items-center gap-2">
        {icons[data.condition as string] || (
          <Zap className="w-3.5 h-3.5 text-[#FFD93D]" />
        )}
        <span className="text-sm font-medium text-[#E8E6E3]">
          {data.label as string}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#FFD93D] !border-2 !border-[#0A0A0F] !-bottom-[5px]"
      />
    </div>
  );
}

function ActionNode({ data, selected }: NodeProps) {
  const isBuy = data.action === "BUY";
  return (
    <div
      className={`bg-[#111118] border ${
        selected ? "border-[#00FFAA]" : "border-[#1A1A24]"
      } min-w-[160px] shadow-lg`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-2.5 !h-2.5 !border-2 !border-[#0A0A0F] !-top-[5px] ${
          isBuy ? "!bg-[#00FFAA]" : "!bg-[#FF6B6B]"
        }`}
      />
      <div className="px-3 py-1.5 border-b border-[#1A1A24] flex items-center gap-2">
        {isBuy ? (
          <TrendingUp className="w-3 h-3 text-[#00FFAA]" />
        ) : (
          <TrendingDown className="w-3 h-3 text-[#FF6B6B]" />
        )}
        <span className="text-[0.6rem] font-mono uppercase tracking-wider text-[#4A4845]">
          Action
        </span>
      </div>
      <div className="px-3 py-2">
        <p
          className={`text-sm font-bold ${
            isBuy ? "text-[#00FFAA]" : "text-[#FF6B6B]"
          }`}
        >
          {data.action as string}
        </p>
        <p className="text-[0.65rem] font-mono text-[#4A4845] mt-0.5">
          {data.params as string}
        </p>
      </div>
    </div>
  );
}

function FilterNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`bg-[#111118] border ${
        selected ? "border-[#00FFAA]" : "border-[#1A1A24]"
      } min-w-[160px] shadow-lg`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[#6C5CE7] !border-2 !border-[#0A0A0F] !-top-[5px]"
      />
      <div className="px-3 py-1.5 border-b border-[#1A1A24] flex items-center gap-2">
        <Clock className="w-3 h-3 text-[#6C5CE7]" />
        <span className="text-[0.6rem] font-mono uppercase tracking-wider text-[#4A4845]">
          Filter
        </span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[#E8E6E3]">
          {data.label as string}
        </p>
        <p className="text-[0.65rem] font-mono text-[#4A4845] mt-0.5">
          {data.params as string}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#6C5CE7] !border-2 !border-[#0A0A0F] !-bottom-[5px]"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  indicator: IndicatorNode,
  condition: ConditionNode,
  action: ActionNode,
  filter: FilterNode,
};

// ──────────────────────────────────────────────
// STRATEGY TEMPLATES
// ──────────────────────────────────────────────

interface StrategyTemplate {
  name: string;
  description: string;
  icon: string;
  nodes: Node[];
  edges: Edge[];
}

const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    name: "RSI Mean Reversion",
    description: "Buy oversold, sell overbought using RSI",
    icon: "📊",
    nodes: [
      {
        id: "rsi",
        type: "indicator",
        position: { x: 250, y: 0 },
        data: { indicator: "RSI", params: "period: 14" },
      },
      {
        id: "cond-buy",
        type: "condition",
        position: { x: 260, y: 150 },
        data: { condition: "<", label: "RSI < 30", indicator: "RSI", value: 30 },
      },
      {
        id: "cond-sell",
        type: "condition",
        position: { x: 460, y: 150 },
        data: { condition: ">", label: "RSI > 70", indicator: "RSI", value: 70 },
      },
      {
        id: "buy",
        type: "action",
        position: { x: 260, y: 300 },
        data: { action: "BUY", params: "size: 2% portfolio" },
      },
      {
        id: "sell",
        type: "action",
        position: { x: 460, y: 300 },
        data: { action: "SELL", params: "size: 100% position" },
      },
      {
        id: "stop-loss",
        type: "action",
        position: { x: 660, y: 300 },
        data: { action: "STOP_LOSS", params: "trigger: -5%" },
      },
      {
        id: "time-filter",
        type: "filter",
        position: { x: 60, y: 150 },
        data: { label: "Trading Hours", params: "09:00 - 16:00 UTC" },
      },
    ],
    edges: [
      { id: "e-rsi-buy", source: "rsi", target: "cond-buy", animated: true, style: { stroke: "#00FFAA" } },
      { id: "e-rsi-sell", source: "rsi", target: "cond-sell", animated: true, style: { stroke: "#FF6B6B" } },
      { id: "e-cond-buy", source: "cond-buy", target: "buy", style: { stroke: "#00FFAA" } },
      { id: "e-cond-sell", source: "cond-sell", target: "sell", style: { stroke: "#FF6B6B" } },
      { id: "e-time-rsi", source: "time-filter", target: "rsi", style: { stroke: "#6C5CE7" } },
      { id: "e-sell-sl", source: "sell", target: "stop-loss", style: { stroke: "#FF8A5C" }, label: "on fill" },
    ],
  },
  {
    name: "MACD Crossover",
    description: "Trade MACD line/signal crossovers",
    icon: "📈",
    nodes: [
      {
        id: "macd",
        type: "indicator",
        position: { x: 250, y: 0 },
        data: { indicator: "MACD", params: "12/26/9" },
      },
      {
        id: "ma-slow",
        type: "indicator",
        position: { x: 480, y: 0 },
        data: { indicator: "Moving Average", params: "SMA 200" },
      },
      {
        id: "cond-bull",
        type: "condition",
        position: { x: 260, y: 150 },
        data: { condition: "crosses_above", label: "MACD crosses above Signal" },
      },
      {
        id: "cond-bear",
        type: "condition",
        position: { x: 480, y: 150 },
        data: { condition: "crosses_below", label: "MACD crosses below Signal" },
      },
      {
        id: "cond-trend",
        type: "condition",
        position: { x: 370, y: 300 },
        data: { condition: ">", label: "Price > SMA 200" },
      },
      {
        id: "buy",
        type: "action",
        position: { x: 260, y: 450 },
        data: { action: "BUY", params: "size: 5% portfolio" },
      },
      {
        id: "sell",
        type: "action",
        position: { x: 480, y: 450 },
        data: { action: "SELL", params: "size: 100% position" },
      },
    ],
    edges: [
      { id: "e1", source: "macd", target: "cond-bull", animated: true, style: { stroke: "#00FFAA" } },
      { id: "e2", source: "macd", target: "cond-bear", animated: true, style: { stroke: "#FF6B6B" } },
      { id: "e3", source: "cond-bull", target: "cond-trend", style: { stroke: "#FFD93D" } },
      { id: "e4", source: "cond-trend", target: "buy", style: { stroke: "#00FFAA" } },
      { id: "e5", source: "cond-bear", target: "sell", style: { stroke: "#FF6B6B" } },
    ],
  },
  {
    name: "Bollinger Breakout",
    description: "Trade Bollinger Band squeezes & breakouts",
    icon: "💥",
    nodes: [
      {
        id: "bb",
        type: "indicator",
        position: { x: 250, y: 0 },
        data: { indicator: "Bollinger Bands", params: "20, 2σ" },
      },
      {
        id: "volume",
        type: "indicator",
        position: { x: 480, y: 0 },
        data: { indicator: "Volume", params: "SMA 20" },
      },
      {
        id: "cond-upper",
        type: "condition",
        position: { x: 260, y: 150 },
        data: { condition: ">", label: "Price > Upper BB" },
      },
      {
        id: "cond-lower",
        type: "condition",
        position: { x: 480, y: 150 },
        data: { condition: "<", label: "Price < Lower BB" },
      },
      {
        id: "cond-vol",
        type: "condition",
        position: { x: 260, y: 300 },
        data: { condition: ">", label: "Volume > 1.5x Avg" },
      },
      {
        id: "buy",
        type: "action",
        position: { x: 260, y: 450 },
        data: { action: "BUY", params: "size: 3% portfolio" },
      },
      {
        id: "take-profit",
        type: "action",
        position: { x: 480, y: 450 },
        data: { action: "TAKE_PROFIT", params: "trigger: +8%" },
      },
      {
        id: "stop-loss",
        type: "action",
        position: { x: 660, y: 450 },
        data: { action: "STOP_LOSS", params: "trigger: -3%" },
      },
    ],
    edges: [
      { id: "e1", source: "bb", target: "cond-upper", animated: true, style: { stroke: "#6C5CE7" } },
      { id: "e2", source: "bb", target: "cond-lower", animated: true, style: { stroke: "#6C5CE7" } },
      { id: "e3", source: "cond-upper", target: "cond-vol", style: { stroke: "#FFD93D" } },
      { id: "e4", source: "cond-vol", target: "buy", style: { stroke: "#00FFAA" } },
      { id: "e5", source: "buy", target: "take-profit", style: { stroke: "#00FFAA" } },
      { id: "e6", source: "take-profit", target: "stop-loss", style: { stroke: "#FF8A5C" } },
    ],
  },
  {
    name: "Dual MA Trend",
    description: "Golden/death cross with volume filter",
    icon: "🔀",
    nodes: [
      {
        id: "ma-fast",
        type: "indicator",
        position: { x: 200, y: 0 },
        data: { indicator: "Moving Average", params: "SMA 50" },
      },
      {
        id: "ma-slow",
        type: "indicator",
        position: { x: 440, y: 0 },
        data: { indicator: "Moving Average", params: "SMA 200" },
      },
      {
        id: "cond-golden",
        type: "condition",
        position: { x: 220, y: 150 },
        data: { condition: "crosses_above", label: "SMA50 crosses above SMA200" },
      },
      {
        id: "cond-death",
        type: "condition",
        position: { x: 460, y: 150 },
        data: { condition: "crosses_below", label: "SMA50 crosses below SMA200" },
      },
      {
        id: "buy",
        type: "action",
        position: { x: 220, y: 300 },
        data: { action: "BUY", params: "size: 10% portfolio" },
      },
      {
        id: "sell",
        type: "action",
        position: { x: 460, y: 300 },
        data: { action: "SELL", params: "size: 100% position" },
      },
    ],
    edges: [
      { id: "e1", source: "ma-fast", target: "cond-golden", animated: true, style: { stroke: "#00FFAA" } },
      { id: "e2", source: "ma-slow", target: "cond-golden", animated: true, style: { stroke: "#FFD93D" } },
      { id: "e3", source: "ma-fast", target: "cond-death", animated: true, style: { stroke: "#FF6B6B" } },
      { id: "e4", source: "ma-slow", target: "cond-death", animated: true, style: { stroke: "#FF8A5C" } },
      { id: "e5", source: "cond-golden", target: "buy", style: { stroke: "#00FFAA" } },
      { id: "e6", source: "cond-death", target: "sell", style: { stroke: "#FF6B6B" } },
    ],
  },
  {
    name: "Stoch + RSI Combo",
    description: "Dual oscillator confluence strategy",
    icon: "🎯",
    nodes: [
      {
        id: "rsi",
        type: "indicator",
        position: { x: 180, y: 0 },
        data: { indicator: "RSI", params: "period: 14" },
      },
      {
        id: "stoch",
        type: "indicator",
        position: { x: 420, y: 0 },
        data: { indicator: "Stochastic", params: "14, 3, 3" },
      },
      {
        id: "cond-rsi-buy",
        type: "condition",
        position: { x: 180, y: 150 },
        data: { condition: "<", label: "RSI < 35" },
      },
      {
        id: "cond-stoch-buy",
        type: "condition",
        position: { x: 420, y: 150 },
        data: { condition: "<", label: "Stoch K < 20" },
      },
      {
        id: "cond-rsi-sell",
        type: "condition",
        position: { x: 180, y: 300 },
        data: { condition: ">", label: "RSI > 65" },
      },
      {
        id: "cond-stoch-sell",
        type: "condition",
        position: { x: 420, y: 300 },
        data: { condition: ">", label: "Stoch K > 80" },
      },
      {
        id: "buy",
        type: "action",
        position: { x: 200, y: 450 },
        data: { action: "BUY", params: "size: 3% portfolio" },
      },
      {
        id: "sell",
        type: "action",
        position: { x: 400, y: 450 },
        data: { action: "SELL", params: "size: 100% position" },
      },
      {
        id: "take-profit",
        type: "action",
        position: { x: 300, y: 600 },
        data: { action: "TAKE_PROFIT", params: "trigger: +12%" },
      },
    ],
    edges: [
      { id: "e1", source: "rsi", target: "cond-rsi-buy", animated: true, style: { stroke: "#FF6B6B" } },
      { id: "e2", source: "stoch", target: "cond-stoch-buy", animated: true, style: { stroke: "#4ECDC4" } },
      { id: "e3", source: "cond-rsi-buy", target: "buy", style: { stroke: "#00FFAA" } },
      { id: "e4", source: "cond-stoch-buy", target: "buy", style: { stroke: "#00FFAA" } },
      { id: "e5", source: "rsi", target: "cond-rsi-sell", animated: true, style: { stroke: "#FF6B6B" } },
      { id: "e6", source: "stoch", target: "cond-stoch-sell", animated: true, style: { stroke: "#4ECDC4" } },
      { id: "e7", source: "cond-rsi-sell", target: "sell", style: { stroke: "#FF6B6B" } },
      { id: "e8", source: "cond-stoch-sell", target: "sell", style: { stroke: "#FF6B6B" } },
      { id: "e9", source: "buy", target: "take-profit", style: { stroke: "#00FFAA" } },
    ],
  },
];

// ──────────────────────────────────────────────
// BACKTEST ENGINE
// ──────────────────────────────────────────────

interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BacktestResult {
  equityCurve: { label: string; value: number }[];
  totalReturn: string;
  sharpeRatio: string;
  maxDrawdown: string;
  winRate: string;
  totalTrades: number;
  profitFactor: string;
  avgTrade: string;
  monthlyReturns: number[];
}

function generateOHLCV(days: number, startPrice: number): OHLCV[] {
  const data: OHLCV[] = [];
  let price = startPrice;
  const seed = 42;
  let rngState = seed;
  const rand = () => {
    rngState = (rngState * 16807 + 0) % 2147483647;
    return (rngState - 1) / 2147483646;
  };

  for (let i = 0; i < days; i++) {
    const drift = 0.0002;
    const vol = 0.035;
    const ret = drift + vol * (rand() + rand() + rand() - 1.5);
    const open = price;
    price *= 1 + ret;
    const high = Math.max(open, price) * (1 + rand() * 0.012);
    const low = Math.min(open, price) * (1 - rand() * 0.012);
    const volume = 5000000 + rand() * 10000000;
    data.push({ open, high, low, close: price, volume });
  }
  return data;
}

function computeSMA(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += prices[j];
      result.push(sum / period);
    }
  }
  return result;
}

function computeRSI(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [null];
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
    if (i < period) {
      result.push(null);
      continue;
    }
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }
  return result;
}

function computeEMA(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let ema: number | null = null;
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += prices[j];
      ema = sum / period;
      result.push(ema);
    } else {
      ema = (prices[i] - ema!) * k + ema!;
      result.push(ema);
    }
  }
  return result;
}

function computeMACD(prices: number[]): { macd: (number | null)[]; signal: (number | null)[] } {
  const ema12 = computeEMA(prices, 12);
  const ema26 = computeEMA(prices, 26);
  const macdLine: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (ema12[i] !== null && ema26[i] !== null) {
      macdLine.push(ema12[i]! - ema26[i]!);
    } else {
      macdLine.push(null);
    }
  }
  const macdVals = macdLine.filter((v): v is number => v !== null);
  const signalVals = computeEMA(macdVals, 9);
  const signal: (number | null)[] = [];
  let j = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null) {
      signal.push(null);
    } else {
      signal.push(signalVals[j] ?? null);
      j++;
    }
  }
  return { macd: macdLine, signal };
}

function computeBollinger(
  prices: number[],
  period: number,
  stdDev: number
): { upper: (number | null)[]; lower: (number | null)[] } {
  const sma = computeSMA(prices, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i]!;
      const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
      const std = Math.sqrt(variance);
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
  }
  return { upper, lower };
}

function runBacktest(nodes: Node[], edges: Edge[]): BacktestResult {
  // Convert nodes to StrategyConfig
  const indicators = nodes.filter((n) => n.type === "indicator");
  const conditions = nodes.filter((n) => n.type === "condition");
  const actions = nodes.filter((n) => n.type === "action");

  const rsiNode = indicators.find((n) => n.data.indicator === "RSI");
  const macdNode = indicators.find((n) => n.data.indicator === "MACD");

  let buyThreshold = 30;
  let sellThreshold = 70;
  conditions.forEach((c: any) => {
    const val = c.data.value;
    if (val !== undefined) {
      if (c.data.condition === "<" && val < 50) buyThreshold = val;
      if (c.data.condition === ">" && val > 50) sellThreshold = val;
    }
  });

  const config: StrategyConfig = {
    name: "Live Strategy",
    chain: "ethereum",
    symbol: "ETH",
    indicators: ["RSI", "MACD"],
    params: {
      rsiPeriod: parseInt(rsiNode?.data.params as string) || 14,
      rsiOversold: buyThreshold,
      rsiOverbought: sellThreshold,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      stopLoss: 0.05,
      takeProfit: 0.15,
      positionSize: 1000,
      maxPositions: 3,
    },
  };

  const engineResult = strategyEngineBacktest(config);

  // Convert engine result to page's BacktestResult format
  const totalReturn = engineResult.totalReturn;
  const equityCurve = engineResult.equityCurve.map((pt, i) => ({
    label: `D${i * 4}`,
    value: Math.round(pt.value * 100) / 100,
  }));

  const monthlyReturns: number[] = [];
  const tradesPerMonth = Math.max(1, Math.floor(engineResult.trades.length / 12));
  for (let m = 0; m < 12; m++) {
    const start = m * tradesPerMonth;
    const end = start + tradesPerMonth;
    const monthTrades = engineResult.trades.slice(start, end);
    const monthPnL = monthTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    monthlyReturns.push(Math.round(monthPnL / 100));
  }

  return {
    equityCurve: equityCurve.length > 0 ? equityCurve : [{ label: "D0", value: 10000 }],
    totalReturn: `${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(1)}%`,
    sharpeRatio: engineResult.sharpeRatio.toFixed(2),
    maxDrawdown: `-${(engineResult.maxDrawdown * 100).toFixed(1)}%`,
    winRate: `${(engineResult.winRate * 100).toFixed(1)}%`,
    totalTrades: engineResult.trades.filter((t) => t.pnl !== undefined).length,
    profitFactor:
      engineResult.summary.profitFactor === Infinity
        ? "∞"
        : engineResult.summary.profitFactor.toFixed(2),
    avgTrade: `${engineResult.totalReturn >= 0 ? "+" : ""}${(engineResult.totalReturn / Math.max(1, engineResult.trades.length)).toFixed(2)}%`,
    monthlyReturns,
  };
}

interface OptimizerSuggestion {
  type: "improve" | "warning" | "info";
  title: string;
  description: string;
  impact: string;
}

function generateOptimizerSuggestions(
  nodes: Node[],
  backtest: BacktestResult
): OptimizerSuggestion[] {
  const suggestions: OptimizerSuggestion[] = [];
  const indicators = nodes.filter((n) => n.type === "indicator");
  const conditions = nodes.filter((n) => n.type === "condition");
  const actions = nodes.filter((n) => n.type === "action");

  // Win rate suggestion
  const wr = parseFloat(backtest.winRate);
  if (wr < 50) {
    suggestions.push({
      type: "warning",
      title: "Low Win Rate Detected",
      description:
        "Consider adding a trend filter (e.g., 200 SMA) to avoid counter-trend trades.",
      impact: "+5-12% win rate",
    });
  } else if (wr > 60) {
    suggestions.push({
      type: "info",
      title: "Strong Win Rate",
      description:
        "Win rate is solid. Consider increasing position size from 2% to 4% for higher returns.",
      impact: "+20-40% return",
    });
  }

  // Sharpe ratio
  const sr = parseFloat(backtest.sharpeRatio);
  if (sr < 1.5) {
    suggestions.push({
      type: "improve",
      title: "Improve Risk-Adjusted Returns",
      description:
        "Add ATR-based position sizing to reduce volatility. Scale position inversely with ATR.",
      impact: "Sharpe > 2.0",
    });
  }

  // Drawdown
  const dd = parseFloat(backtest.maxDrawdown.replace("-", ""));
  if (dd > 15) {
    suggestions.push({
      type: "warning",
      title: "High Maximum Drawdown",
      description:
        "Add a trailing stop-loss at 2x ATR to protect against extended drawdowns.",
      impact: `-${(dd * 0.3).toFixed(0)}% drawdown`,
    });
  }

  // Missing indicators
  if (indicators.length < 2) {
    suggestions.push({
      type: "improve",
      title: "Add Confluence Indicators",
      description:
        "Adding Volume or MACD as a confirmation indicator can filter false signals.",
      impact: "+8-15% fewer false signals",
    });
  }

  // RSI threshold tuning
  const hasRSI = indicators.some((n) => n.data.indicator === "RSI");
  if (hasRSI) {
    const buyConds = conditions.filter(
      (c) => (c.data.condition as string) === "<" && (c.data.value as number) < 40
    );
    if (buyConds.length > 0) {
      suggestions.push({
        type: "improve",
        title: "Tighten RSI Buy Threshold",
        description:
          "Changing RSI buy from 30 to 25 would reduce entries during strong downtrends.",
        impact: "+3-7% total return",
      });
    }
  }

  // Risk management
  if (actions.length < 3) {
    suggestions.push({
      type: "improve",
      title: "Add Take Profit Level",
      description:
        "Set take profit at 1.5x the stop-loss distance for positive expectancy.",
      impact: "Better risk/reward ratio",
    });
  }

  // MACD suggestion
  if (!indicators.some((n) => n.data.indicator === "MACD") && hasRSI) {
    suggestions.push({
      type: "info",
      title: "Consider MACD + RSI Combo",
      description:
        "Using MACD crossover as entry confirmation with RSI can improve entry timing.",
      impact: "+10-20% returns",
    });
  }

  // Backtest period
  suggestions.push({
    type: "info",
    title: "Test Across Market Conditions",
    description:
      "Run backtests on different market regimes (bull, bear, sideways) to validate robustness.",
    impact: "Better live performance",
  });

  return suggestions.slice(0, 6);
}

// ──────────────────────────────────────────────
// SHARE FEATURE
// ──────────────────────────────────────────────

function encodeStrategy(nodes: Node[], edges: Edge[]): string {
  const data = { nodes, edges };
  return btoa(JSON.stringify(data));
}

function decodeStrategy(encoded: string): { nodes: Node[]; edges: Edge[] } | null {
  try {
    const json = atob(encoded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// DEFAULT STRATEGY (RSI Mean Reversion)
// ──────────────────────────────────────────────

const defaultNodes: Node[] = STRATEGY_TEMPLATES[0].nodes;
const defaultEdges: Edge[] = STRATEGY_TEMPLATES[0].edges;

// ──────────────────────────────────────────────
// NODE PALETTE
// ──────────────────────────────────────────────

const palette = [
  {
    category: "Indicators",
    items: [
      { type: "indicator", data: { indicator: "RSI", params: "period: 14" }, label: "RSI" },
      { type: "indicator", data: { indicator: "MACD", params: "12/26/9" }, label: "MACD" },
      { type: "indicator", data: { indicator: "Moving Average", params: "SMA 50" }, label: "MA" },
      { type: "indicator", data: { indicator: "Bollinger Bands", params: "20, 2σ" }, label: "BB" },
      { type: "indicator", data: { indicator: "Volume", params: "SMA 20" }, label: "Volume" },
      { type: "indicator", data: { indicator: "Stochastic", params: "14, 3, 3" }, label: "Stoch" },
    ],
  },
  {
    category: "Conditions",
    items: [
      { type: "condition", data: { condition: ">", label: "Greater Than" }, label: ">" },
      { type: "condition", data: { condition: "<", label: "Less Than" }, label: "<" },
      { type: "condition", data: { condition: "crosses_above", label: "Crosses Above" }, label: "↑" },
      { type: "condition", data: { condition: "crosses_below", label: "Crosses Below" }, label: "↓" },
    ],
  },
  {
    category: "Actions",
    items: [
      { type: "action", data: { action: "BUY", params: "size: 2%" }, label: "Buy" },
      { type: "action", data: { action: "SELL", params: "size: 100%" }, label: "Sell" },
      { type: "action", data: { action: "STOP_LOSS", params: "trigger: -5%" }, label: "Stop Loss" },
      { type: "action", data: { action: "TAKE_PROFIT", params: "trigger: +10%" }, label: "Take Profit" },
    ],
  },
  {
    category: "Filters",
    items: [
      { type: "filter", data: { label: "Trading Hours", params: "09:00 - 16:00 UTC" }, label: "Time" },
      { type: "filter", data: { label: "Price Range", params: "$100 - $50,000" }, label: "Price" },
    ],
  },
];

// ──────────────────────────────────────────────
// LIVE PRICE TICKER
// ──────────────────────────────────────────────

const TICKER_SYMBOLS = ["BTC", "ETH", "SOL", "AAPL", "TSLA", "NVDA"];

interface TickerPrice {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
}

function generateInitialPrices(): TickerPrice[] {
  const bases: Record<string, number> = {
    BTC: 67432,
    ETH: 3521,
    SOL: 178,
    AAPL: 189.5,
    TSLA: 248.7,
    NVDA: 824.3,
  };
  return TICKER_SYMBOLS.map((s) => {
    const base = bases[s];
    const change = (Math.random() - 0.45) * base * 0.02;
    return {
      symbol: s,
      price: base + change,
      change,
      changePct: (change / base) * 100,
    };
  });
}

// ──────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────

export default function BuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [showBacktest, setShowBacktest] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [running, setRunning] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [activeTemplate, setActiveTemplate] = useState("RSI Mean Reversion");
  const [tickerPrices, setTickerPrices] = useState<TickerPrice[]>(generateInitialPrices);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Live price ticker effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPrices((prev) =>
        prev.map((t) => {
          const vol = t.price * 0.0003;
          const delta = (Math.random() - 0.48) * vol;
          const newPrice = t.price + delta;
          return {
            symbol: t.symbol,
            price: newPrice,
            change: newPrice - (t.price - t.change),
            changePct: ((newPrice - (t.price - t.change)) / (t.price - t.change)) * 100,
          };
        })
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          { ...connection, animated: false, style: { stroke: "#1A1A24" } },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow/type");
      const data = JSON.parse(
        event.dataTransfer.getData("application/reactflow/data")
      );
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 90,
        y: event.clientY - bounds.top - 20,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleRunBacktest = () => {
    setRunning(true);
    setShowDeploy(false);
    setShowOptimizer(false);
    setTimeout(() => {
      try {
        const result = runBacktest(nodes, edges);
        console.log('Backtest result:', result);
        setBacktestResult(result);
        setRunning(false);
        setShowBacktest(true);
      } catch (e) {
        console.error('Backtest error:', e);
        setRunning(false);
      }
    }, 1500);
  };

  const handleDeploy = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setDeployed(true);
      setShowDeploy(true);
    }, 3000);
  };

  const handleLoadTemplate = (template: StrategyTemplate) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setActiveTemplate(template.name);
    setShowTemplates(false);
    setShowBacktest(false);
    setBacktestResult(null);
  };

  const handleShare = async () => {
    const encoded = encodeStrategy(nodes, edges);
    const url = `${window.location.origin}/builder?strategy=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    } catch {
      // Fallback: show the URL
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  // Load from URL params on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const strategyParam = params.get("strategy");
    if (strategyParam) {
      const decoded = decodeStrategy(strategyParam);
      if (decoded) {
        setNodes(decoded.nodes);
        setEdges(decoded.edges);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = useMemo(() => {
    if (!backtestResult) return null;
    return {
      labels: backtestResult.equityCurve.map((p) => p.label),
      datasets: [
        {
          label: "Equity ($)",
          data: backtestResult.equityCurve.map((p) => p.value),
          borderColor: "#00FFAA",
          backgroundColor: "rgba(0, 255, 170, 0.08)",
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2,
        },
      ],
    };
  }, [backtestResult]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#111118",
          borderColor: "#1A1A24",
          borderWidth: 1,
          titleColor: "#E8E6E3",
          bodyColor: "#00FFAA",
          titleFont: { family: "JetBrains Mono", size: 10 },
          bodyFont: { family: "JetBrains Mono", size: 11 },
          padding: 8,
          displayColors: false,
        },
      },
      scales: {
        x: {
          display: true,
          grid: { color: "#1A1A24" },
          ticks: {
            color: "#4A4845",
            font: { family: "JetBrains Mono", size: 9 },
            maxTicksLimit: 8,
          },
        },
        y: {
          display: true,
          grid: { color: "#1A1A24" },
          ticks: {
            color: "#4A4845",
            font: { family: "JetBrains Mono", size: 9 },
            callback: (val: string | number) => `$${Number(val).toLocaleString()}`,
          },
        },
      },
      interaction: { mode: "index" as const, intersect: false },
    }),
    []
  );

  const optimizerSuggestions = useMemo(() => {
    if (!backtestResult) return [];
    return generateOptimizerSuggestions(nodes, backtestResult);
  }, [nodes, backtestResult]);

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0F]">
      {/* ─── LIVE PRICE TICKER BAR ─── */}
      <div className="h-7 border-b border-[#1A1A24] bg-[#08080C] overflow-x-auto md:overflow-hidden shrink-0 scrollbar-hide">
        <div className="h-full flex items-center">
          <div className="flex items-center gap-6 px-4 animate-[ticker_30s_linear_infinite] whitespace-nowrap min-w-max">
            {[...tickerPrices, ...tickerPrices].map((t, i) => (
              <div key={`${t.symbol}-${i}`} className="flex items-center gap-1.5">
                <span className="text-[0.55rem] font-mono font-bold text-[#E8E6E3]">
                  {t.symbol}
                </span>
                <span className="text-[0.55rem] font-mono text-[#E8E6E3]">
                  ${t.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={`text-[0.5rem] font-mono ${
                    t.changePct >= 0 ? "text-[#00FFAA]" : "text-[#FF6B6B]"
                  }`}
                >
                  {t.changePct >= 0 ? "▲" : "▼"} {Math.abs(t.changePct).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TOOLBAR ─── */}
      <header className="h-12 border-b border-[#1A1A24] flex items-center justify-between px-2 sm:px-4 bg-[#0A0A0F] shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-[#4A4845] hover:text-[#E8E6E3] transition-colors p-1"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <a
            href="/"
            className="flex items-center gap-2 text-[#4A4845] hover:text-[#E8E6E3] transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span className="font-mono text-xs">ALGO STUDIO</span>
          </a>
          <div className="w-px h-5 bg-[#1A1A24] hidden sm:block" />

          {/* Strategy Name / Template Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-2 py-1 text-[0.65rem] font-mono text-[#E8E6E3] hover:bg-[#111118] border border-[#1A1A24] transition-colors"
            >
              <Layout className="w-3 h-3 text-[#FFD93D]" />
              {activeTemplate}
              <ChevronDown className="w-3 h-3 text-[#4A4845]" />
            </button>
            {showTemplates && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-[#111118] border border-[#1A1A24] z-50 shadow-xl">
                <div className="p-2 border-b border-[#1A1A24]">
                  <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845]">
                    Strategy Templates
                  </p>
                </div>
                {STRATEGY_TEMPLATES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => handleLoadTemplate(t)}
                    className={`w-full text-left px-3 py-2 hover:bg-[#1A1A24] transition-colors border-b border-[#1A1A24]/50 last:border-b-0 ${
                      activeTemplate === t.name
                        ? "bg-[#1A1A24]/50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{t.icon}</span>
                      <div>
                        <p className="text-xs font-mono text-[#E8E6E3]">
                          {t.name}
                        </p>
                        <p className="text-[0.55rem] font-mono text-[#4A4845]">
                          {t.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end max-w-full">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 text-[0.6rem] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#FFD93D] border border-[#FFD93D]/30 hover:bg-[#FFD93D]/10 transition-all"
            title="Copy shareable link"
          >
            <Share2 className="w-3 h-3 shrink-0" />
            <span className="hidden lg:inline">Share</span>
          </button>

          <button className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 text-[0.6rem] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#4A4845] border border-[#1A1A24] hover:border-[#2A2A35] hover:text-[#E8E6E3] transition-all">
            <Save className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Backtest Button */}
          <button
            onClick={handleRunBacktest}
            disabled={running}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 text-[0.6rem] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#0A0A0F] bg-[#00FFAA] hover:bg-[#00CC88] disabled:opacity-50 transition-all"
          >
            {running ? (
              <>
                <div className="w-3 h-3 border-2 border-[#0A0A0F] border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="hidden sm:inline">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 shrink-0" />
                <span className="hidden sm:inline">Backtest</span>
              </>
            )}
          </button>

          {/* AI Optimizer Button */}
          <button
            onClick={() => {
              if (!backtestResult) {
                handleRunBacktest();
                setTimeout(() => setShowOptimizer(true), 2000);
              } else {
                setShowOptimizer(!showOptimizer);
              }
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 text-[0.6rem] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#6C5CE7] border border-[#6C5CE7]/40 hover:bg-[#6C5CE7]/10 transition-all"
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">AI Optimize</span>
          </button>

          {/* Deploy Button */}
          <button
            onClick={handleDeploy}
            disabled={running}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 text-[0.6rem] sm:text-[0.65rem] font-mono uppercase tracking-wider text-[#00FFAA] border border-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A0A0F] disabled:opacity-50 transition-all"
          >
            <Rocket className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">Deploy</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative min-w-0">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── SIDEBAR PALETTE ─── */}
        <aside
          className={`
          w-56 border-r border-[#1A1A24] overflow-y-auto bg-[#0A0A0F] shrink-0
          hidden md:block
          ${sidebarOpen ? "!block fixed inset-y-[5rem] md:!inset-y-0 left-0 z-40" : ""}
        `}
        >
          <div className="p-3 border-b border-[#1A1A24]">
            <p className="text-[0.6rem] font-mono uppercase tracking-wider text-[#4A4845]">
              Drag to canvas
            </p>
          </div>
          {palette.map((cat) => (
            <div key={cat.category} className="border-b border-[#1A1A24]">
              <div className="px-3 py-2">
                <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845]">
                  {cat.category}
                </p>
              </div>
              <div className="px-2 pb-2 flex flex-wrap gap-1">
                {cat.items.map((item) => (
                  <div
                    key={item.label}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/reactflow/type",
                        item.type
                      );
                      e.dataTransfer.setData(
                        "application/reactflow/data",
                        JSON.stringify(item.data)
                      );
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="px-2.5 py-1.5 text-xs font-mono text-[#E8E6E3] bg-[#111118] border border-[#1A1A24] cursor-grab hover:border-[#00FFAA] hover:text-[#00FFAA] transition-colors active:cursor-grabbing"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Strategy Info */}
          <div className="p-3">
            <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845] mb-2">
              Strategy Info
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[0.65rem] font-mono">
                <span className="text-[#4A4845]">Nodes</span>
                <span className="text-[#E8E6E3]">{nodes.length}</span>
              </div>
              <div className="flex justify-between text-[0.65rem] font-mono">
                <span className="text-[#4A4845]">Connections</span>
                <span className="text-[#E8E6E3]">{edges.length}</span>
              </div>
              <div className="flex justify-between text-[0.65rem] font-mono">
                <span className="text-[#4A4845]">Status</span>
                <span className="text-[#00FFAA]">Ready</span>
              </div>
              {backtestResult && (
                <div className="flex justify-between text-[0.65rem] font-mono">
                  <span className="text-[#4A4845]">Return</span>
                  <span
                    className={
                      backtestResult.totalReturn.startsWith("+")
                        ? "text-[#00FFAA]"
                        : "text-[#FF6B6B]"
                    }
                  >
                    {backtestResult.totalReturn}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ─── CANVAS ─── */}
        <div className="flex-1 relative min-w-0 min-h-0" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#0A0A0F]"
            defaultEdgeOptions={{
              style: { stroke: "#1A1A24", strokeWidth: 2 },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#1A1A24"
            />
            <Controls
              className="!bg-[#111118] !border-[#1A1A24] !shadow-none [&>button]:!bg-[#111118] [&>button]:!border-[#1A1A24] [&>button]:!text-[#4A4845] [&>button:hover]:!bg-[#1A1A24] [&>button]:!w-6 [&>button]:!h-6 sm:[&>button]:!w-7 sm:[&>button]:!h-7"
            />
            <MiniMap
              nodeColor="#1A1A24"
              maskColor="rgba(10,10,15,0.8)"
              className="!bg-[#111118] !border-[#1A1A24] hidden md:block"
            />
          </ReactFlow>

          {/* Canvas overlay label */}
          <div className="absolute bottom-4 left-4 font-mono text-[0.55rem] text-[#4A4845] tracking-wider">
            STRATEGY CANVAS — DRAG NODES TO BUILD
          </div>
        </div>

        {/* ─── BACKTEST PANEL ─── */}
        {showBacktest && backtestResult && (
          <div className="w-full sm:w-80 lg:w-96 border-l border-[#1A1A24] bg-[#0A0A0F] overflow-y-auto shrink-0 animate-in slide-in-from-right fixed inset-y-[5rem] md:inset-y-0 left-0 z-50 md:relative md:inset-auto">
            <div className="p-4 border-b border-[#1A1A24] flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8E6E3]">
                Backtest Results
              </h3>
              <button
                onClick={() => setShowBacktest(false)}
                className="text-[#4A4845] hover:text-[#E8E6E3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chart.js Equity Curve */}
            <div className="p-4 border-b border-[#1A1A24]">
              <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845] mb-3">
                Equity Curve
              </p>
              <div className="h-40 w-full">
                {chartData && (
                  <Line data={chartData} options={chartOptions} />
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-px bg-[#1A1A24]">
              {[
                {
                  label: "Total Return",
                  value: backtestResult.totalReturn,
                  color: backtestResult.totalReturn.startsWith("+")
                    ? "text-[#00FFAA]"
                    : "text-[#FF6B6B]",
                },
                {
                  label: "Sharpe Ratio",
                  value: backtestResult.sharpeRatio,
                  color: "text-[#00FFAA]",
                },
                {
                  label: "Max Drawdown",
                  value: backtestResult.maxDrawdown,
                  color: "text-[#FF6B6B]",
                },
                {
                  label: "Win Rate",
                  value: backtestResult.winRate,
                  color: "text-[#00FFAA]",
                },
                {
                  label: "Total Trades",
                  value: backtestResult.totalTrades.toString(),
                  color: "text-[#E8E6E3]",
                },
                {
                  label: "Profit Factor",
                  value: backtestResult.profitFactor,
                  color: parseFloat(backtestResult.profitFactor) > 1
                    ? "text-[#00FFAA]"
                    : "text-[#FF6B6B]",
                },
                {
                  label: "Avg Trade",
                  value: backtestResult.avgTrade,
                  color: backtestResult.avgTrade.startsWith("+")
                    ? "text-[#00FFAA]"
                    : "text-[#FF6B6B]",
                },
                {
                  label: "Monthly Avg",
                  value: `${
                    backtestResult.monthlyReturns.length > 0
                      ? (
                          backtestResult.monthlyReturns.reduce(
                            (a, b) => a + b,
                            0
                          ) / backtestResult.monthlyReturns.length
                        ).toFixed(1) + "%"
                      : "0%"
                  }`,
                  color: "text-[#FFD93D]",
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0A0A0F] p-3">
                  <p className="text-[0.5rem] font-mono uppercase tracking-[0.15em] text-[#4A4845]">
                    {stat.label}
                  </p>
                  <p className={`text-lg font-mono font-bold mt-1 ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Deploy CTA */}
            <div className="p-4">
              <button
                onClick={handleDeploy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#0A0A0F] bg-[#00FFAA] hover:bg-[#00CC88] transition-colors"
              >
                <Rocket className="w-3.5 h-3.5" />
                Deploy Strategy
              </button>
            </div>
          </div>
        )}

        {/* ─── AI OPTIMIZER PANEL ─── */}
        {showOptimizer && (
          <div className="w-full sm:w-80 lg:w-96 border-l border-[#1A1A24] bg-[#0A0A0F] overflow-y-auto shrink-0 animate-in slide-in-from-right fixed inset-y-[5rem] md:inset-y-0 left-0 z-50 md:relative md:inset-auto">
            <div className="p-4 border-b border-[#1A1A24] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#6C5CE7]" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8E6E3]">
                  AI Strategy Optimizer
                </h3>
              </div>
              <button
                onClick={() => setShowOptimizer(false)}
                className="text-[#4A4845] hover:text-[#E8E6E3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Strategy Analysis Summary */}
            <div className="p-4 border-b border-[#1A1A24]">
              <div className="bg-[#111118] border border-[#6C5CE7]/30 p-3 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
                  <span className="text-[0.6rem] font-mono uppercase tracking-wider text-[#6C5CE7]">
                    Analysis Complete
                  </span>
                </div>
                <p className="text-[0.65rem] font-mono text-[#4A4845]">
                  Analyzed {nodes.length} nodes, {edges.length} connections, and{" "}
                  {backtestResult?.totalTrades || 0} historical trades across
                  multiple market regimes.
                </p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="p-4 space-y-3">
              <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845]">
                Recommendations ({optimizerSuggestions.length})
              </p>
              {optimizerSuggestions.map((sug, i) => {
                const colors = {
                  improve: { border: "border-[#00FFAA]/30", text: "text-[#00FFAA]", icon: "💡" },
                  warning: { border: "border-[#FF6B6B]/30", text: "text-[#FF6B6B]", icon: "⚠️" },
                  info: { border: "border-[#FFD93D]/30", text: "text-[#FFD93D]", icon: "ℹ️" },
                };
                const c = colors[sug.type];
                return (
                  <div
                    key={i}
                    className={`bg-[#111118] border ${c.border} p-3`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">{c.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-mono font-medium text-[#E8E6E3]">
                            {sug.title}
                          </p>
                          <span
                            className={`text-[0.5rem] font-mono ${c.text} px-1.5 py-0.5 bg-[#0A0A0F] border ${c.border}`}
                          >
                            {sug.impact}
                          </span>
                        </div>
                        <p className="text-[0.6rem] font-mono text-[#4A4845] mt-1">
                          {sug.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-[#1A1A24]">
              <button
                onClick={handleRunBacktest}
                disabled={running}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#0A0A0F] bg-[#6C5CE7] hover:bg-[#5A4BD6] disabled:opacity-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-run Backtest
              </button>
            </div>
          </div>
        )}

        {/* ─── DEPLOY PANEL ─── */}
        {showDeploy && (
          <div className="w-full sm:w-80 border-l border-[#1A1A24] bg-[#0A0A0F] overflow-y-auto shrink-0 animate-in slide-in-from-right fixed inset-y-[5rem] md:inset-y-0 left-0 z-50 md:relative md:inset-auto">
            <div className="p-4 border-b border-[#1A1A24] flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8E6E3]">
                Deploy Contract
              </h3>
              <button
                onClick={() => setShowDeploy(false)}
                className="text-[#4A4845] hover:text-[#E8E6E3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deployed ? (
              <div className="p-4 space-y-4">
                <div className="bg-[#111118] border border-[#00FFAA]/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#00FFAA] animate-pulse" />
                    <span className="text-xs font-mono text-[#00FFAA]">
                      DEPLOYED
                    </span>
                  </div>
                  <p className="text-[0.65rem] font-mono text-[#4A4845]">
                    Contract Address
                  </p>
                  <p className="text-xs font-mono text-[#E8E6E3] mt-0.5 break-all">
                    0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a
                      href="#"
                      className="flex-1 text-center px-2 py-1.5 text-[0.6rem] font-mono text-[#00FFAA] border border-[#00FFAA]/30 hover:bg-[#00FFAA]/10 transition-colors"
                    >
                      View on Explorer
                    </a>
                    <a
                      href="#"
                      className="flex-1 text-center px-2 py-1.5 text-[0.6rem] font-mono text-[#E8E6E3] border border-[#1A1A24] hover:border-[#2A2A35] transition-colors"
                    >
                      Verify Source
                    </a>
                  </div>
                </div>

                {/* Deployment Log */}
                <div className="bg-[#111118] border border-[#1A1A24] p-3">
                  <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845] mb-2">
                    Deploy Log
                  </p>
                  <div className="space-y-1 font-mono text-[0.6rem]">
                    <p className="text-[#4A4845]">✓ Strategy compiled (2.3s)</p>
                    <p className="text-[#4A4845]">✓ Gas estimated: 0.0042 ETH</p>
                    <p className="text-[#4A4845]">✓ Transaction submitted</p>
                    <p className="text-[#4A4845]">
                      ✓ Confirmed in block #18,234,567
                    </p>
                    <p className="text-[#00FFAA]">
                      ✓ Contract deployed successfully
                    </p>
                  </div>
                </div>

                {/* Chain Selection */}
                <div className="bg-[#111118] border border-[#1A1A24] p-3">
                  <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845] mb-2">
                    Supported Chains
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Ethereum",
                      "Arbitrum",
                      "Optimism",
                      "Base",
                      "Polygon",
                      "BSC",
                    ].map((chain) => (
                      <span
                        key={chain}
                        className="px-2 py-1 text-[0.55rem] font-mono text-[#4A4845] border border-[#1A1A24]"
                      >
                        {chain}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <p className="text-xs text-[#4A4845]">
                  Deploy your strategy as a smart contract on-chain.
                </p>

                {/* Network Selection */}
                <div>
                  <p className="text-[0.55rem] font-mono uppercase tracking-[0.15em] text-[#4A4845] mb-2">
                    Target Network
                  </p>
                  <div className="space-y-1.5">
                    {[
                      "Ethereum Mainnet",
                      "Arbitrum One",
                      "Optimism",
                      "Base",
                      "Polygon",
                    ].map((network, i) => (
                      <label
                        key={network}
                        className="flex items-center gap-2 px-3 py-2 bg-[#111118] border border-[#1A1A24] cursor-pointer hover:border-[#2A2A35] transition-colors"
                      >
                        <input
                          type="radio"
                          name="network"
                          defaultChecked={i === 1}
                          className="accent-[#00FFAA]"
                        />
                        <span className="text-xs font-mono text-[#E8E6E3]">
                          {network}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gas Estimate */}
                <div className="bg-[#111118] border border-[#1A1A24] p-3">
                  <div className="flex justify-between text-[0.65rem] font-mono">
                    <span className="text-[#4A4845]">Est. Gas</span>
                    <span className="text-[#E8E6E3]">0.0042 ETH</span>
                  </div>
                  <div className="flex justify-between text-[0.65rem] font-mono mt-1">
                    <span className="text-[#4A4845]">Est. Cost</span>
                    <span className="text-[#00FFAA]">~$14.28</span>
                  </div>
                </div>

                <button
                  onClick={handleDeploy}
                  disabled={running}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#0A0A0F] bg-[#00FFAA] hover:bg-[#00CC88] disabled:opacity-50 transition-colors"
                >
                  {running ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#0A0A0F] border-t-transparent rounded-full animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-3.5 h-3.5" />
                      Deploy Now
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── SHARE TOAST ─── */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111118] border border-[#FFD93D]/40 shadow-xl">
            <Check className="w-4 h-4 text-[#FFD93D]" />
            <span className="text-xs font-mono text-[#E8E6E3]">
              Shareable link copied to clipboard!
            </span>
          </div>
        </div>
      )}

      {/* ─── MOBILE TEMPLATE SELECTOR ─── */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowTemplates(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#111118] border-t border-[#1A1A24] p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono uppercase tracking-wider text-[#E8E6E3]">
                Strategy Templates
              </p>
              <button onClick={() => setShowTemplates(false)}>
                <X className="w-4 h-4 text-[#4A4845]" />
              </button>
            </div>
            {STRATEGY_TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => handleLoadTemplate(t)}
                className={`w-full text-left px-3 py-3 hover:bg-[#1A1A24] transition-colors border-b border-[#1A1A24]/50 last:border-b-0 ${
                  activeTemplate === t.name ? "bg-[#1A1A24]/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{t.icon}</span>
                  <div>
                    <p className="text-sm font-mono text-[#E8E6E3]">{t.name}</p>
                    <p className="text-[0.6rem] font-mono text-[#4A4845]">
                      {t.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
