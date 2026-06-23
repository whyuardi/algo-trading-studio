// ── Strategy Engine ── Mock price feed, backtest, deploy simulation

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StrategyConfig {
  name: string;
  chain: string;
  symbol: string;
  indicators: string[];
  params: {
    rsiPeriod: number;
    rsiOversold: number;
    rsiOverbought: number;
    macdFast: number;
    macdSlow: number;
    macdSignal: number;
    stopLoss: number;   // percentage e.g. 0.02 = 2%
    takeProfit: number; // percentage e.g. 0.05 = 5%
    positionSize: number; // in USD
    maxPositions: number;
  };
}

export interface Trade {
  id: string;
  side: 'buy' | 'sell';
  price: number;
  size: number;
  time: number;
  pnl?: number;
  reason: string;
}

export interface BacktestResult {
  trades: Trade[];
  totalPnL: number;
  totalReturn: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  equityCurve: { time: number; value: number }[];
  priceData: OHLCV[];
  summary: {
    totalTrades: number;
    winners: number;
    losers: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
  };
}

// ── Mock price data generator ──
export function generatePriceData(
  symbol: string,
  days: number = 30,
  interval: '1h' | '4h' | '1d' = '4h'
): OHLCV[] {
  const basePrice: Record<string, number> = {
    ETH: 3500 + Math.random() * 500,
    BTC: 95000 + Math.random() * 5000,
    SOL: 150 + Math.random() * 30,
  };

  const price = basePrice[symbol] || 3500;
  const data: OHLCV[] = [];
  const intervalMs = interval === '1h' ? 3600000 : interval === '4h' ? 14400000 : 86400000;
  const totalCandles = Math.floor((days * 86400000) / intervalMs);
  let currentPrice = price * (0.85 + Math.random() * 0.3);
  const now = Date.now();
  const startTime = now - totalCandles * intervalMs;

  for (let i = 0; i < totalCandles; i++) {
    const volatility = 0.015 + Math.random() * 0.02;
    const trend = Math.sin(i / 30) * 0.003;
    const change = (Math.random() - 0.48 + trend) * volatility;

    const open = currentPrice;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    const volume = 100000 + Math.random() * 500000;

    data.push({
      time: startTime + i * intervalMs,
      open: roundPrice(open),
      high: roundPrice(high),
      low: roundPrice(low),
      close: roundPrice(close),
      volume,
    });

    currentPrice = close;
  }

  return data;
}

function roundPrice(price: number): number {
  return Math.round(price * 100) / 100;
}

// ── Technical Indicators ──
function calcSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      result.push(slice.reduce((a, b) => a + b, 0) / period);
    }
  }
  return result;
}

function calcEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let ema: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
      result.push(ema);
    } else {
      ema = data[i] * k + (ema! * (1 - k));
      result.push(ema);
    }
  }
  return result;
}

function calcRSI(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);

    if (i < period) {
      result.push(null);
    } else {
      const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }
  return result;
}

function calcMACD(
  data: number[],
  fast: number,
  slow: number,
  signal: number
): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const emaFast = calcEMA(data, fast);
  const emaSlow = calcEMA(data, slow);
  const macdLine: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (emaFast[i] === null || emaSlow[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(emaFast[i]! - emaSlow[i]!);
    }
  }

  const validMacd = macdLine.filter((v): v is number => v !== null);
  const signalLine = calcEMA(validMacd, signal);
  const fullSignal: (number | null)[] = [];
  let si = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null) {
      fullSignal.push(null);
    } else {
      fullSignal.push(signalLine[si] ?? null);
      si++;
    }
  }

  const histogram: (number | null)[] = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null || fullSignal[i] === null) {
      histogram.push(null);
    } else {
      histogram.push(macdLine[i]! - fullSignal[i]!);
    }
  }

  return { macd: macdLine, signal: fullSignal, histogram };
}

// ── Backtest Engine ──
export function runBacktest(config: StrategyConfig, data?: OHLCV[]): BacktestResult {
  const priceData = data || generatePriceData(config.symbol, 30, '4h');
  const closes = priceData.map((d) => d.close);
  const params = config.params;

  const rsi = calcRSI(closes, params.rsiPeriod);
  const macd = calcMACD(closes, params.macdFast, params.macdSlow, params.macdSignal);

  const trades: Trade[] = [];
  let position: { price: number; size: number; time: number } | null = null;
  let balance = 10000;
  const equityCurve: { time: number; value: number }[] = [];

  for (let i = 1; i < priceData.length; i++) {
    const price = priceData[i].close;
    const prevRsi = rsi[i - 1];
    const currRsi = rsi[i];
    const prevHist = macd.histogram[i - 1];
    const currHist = macd.histogram[i];

    // ── Entry signals ──
    if (!position && currRsi !== null && prevRsi !== null && currHist !== null && prevHist !== null) {
      const buySignal =
        currRsi < params.rsiOversold && currHist > prevHist;
      const sellSignal =
        currRsi > params.rsiOverbought && currHist < prevHist;

      if (buySignal) {
        const size = params.positionSize / price;
        position = { price, size, time: priceData[i].time };
        balance -= params.positionSize;
        trades.push({
          id: `t${trades.length}`,
          side: 'buy',
          price,
          size,
          time: priceData[i].time,
          reason: `RSI ${currRsi.toFixed(1)} < ${params.rsiOversold} | MACD histogram rising`,
        });
      } else if (sellSignal) {
        // Short sell simulation
        const size = params.positionSize / price;
        position = { price: -price, size, time: priceData[i].time };
        balance -= params.positionSize * 0.5; // margin
        trades.push({
          id: `t${trades.length}`,
          side: 'sell',
          price,
          size,
          time: priceData[i].time,
          reason: `RSI ${currRsi.toFixed(1)} > ${params.rsiOverbought} | MACD histogram falling`,
        });
      }
    }

    // ── Exit signals (stop loss / take profit) ──
    if (position) {
      const isLong = position.price > 0;
      const entryPrice = Math.abs(position.price);
      const pnlPercent = isLong
        ? (price - entryPrice) / entryPrice
        : (entryPrice - price) / entryPrice;

      let exitReason = '';
      if (pnlPercent <= -params.stopLoss) exitReason = `Stop loss hit (${(pnlPercent * 100).toFixed(2)}%)`;
      else if (pnlPercent >= params.takeProfit) exitReason = `Take profit hit (${(pnlPercent * 100).toFixed(2)}%)`;
      else if (currRsi !== null && prevRsi !== null) {
        if (isLong && currRsi > params.rsiOverbought) exitReason = `RSI overbought exit`;
        else if (!isLong && currRsi < params.rsiOversold) exitReason = `RSI oversold exit`;
      }

      if (exitReason) {
        const pnl = position.size * Math.abs(position.price) * pnlPercent;
        balance += params.positionSize + pnl;
        trades.push({
          id: `t${trades.length}`,
          side: isLong ? 'sell' : 'buy',
          price,
          size: position.size,
          time: priceData[i].time,
          pnl,
          reason: exitReason,
        });
        position = null;
      }
    }

    // Track equity
    const unrealizedPnl = position
      ? position.size * Math.abs(position.price) *
        ((position.price > 0 ? (price - Math.abs(position.price)) : (Math.abs(position.price) - price)) /
          Math.abs(position.price))
      : 0;
    equityCurve.push({
      time: priceData[i].time,
      value: balance + (position ? params.positionSize + unrealizedPnl : 0),
    });
  }

  // Calculate stats
  const closedTrades = trades.filter((t) => t.pnl !== undefined);
  const winners = closedTrades.filter((t) => t.pnl! > 0);
  const losers = closedTrades.filter((t) => t.pnl! <= 0);
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winRate = closedTrades.length > 0 ? winners.length / closedTrades.length : 0;

  const avgWin = winners.length > 0 ? winners.reduce((s, t) => s + t.pnl!, 0) / winners.length : 0;
  const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((s, t) => s + t.pnl!, 0) / losers.length) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

  // Sharpe ratio (simplified)
  const returns = equityCurve.map((e, i) =>
    i === 0 ? 0 : (e.value - equityCurve[i - 1].value) / equityCurve[i - 1].value
  );
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / returns.length
  );
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252 * 6) : 0; // annualized, 4h candles

  // Max drawdown
  let peak = 0;
  let maxDrawdown = 0;
  for (const point of equityCurve) {
    if (point.value > peak) peak = point.value;
    const dd = (peak - point.value) / peak;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  return {
    trades,
    totalPnL,
    totalReturn: (totalPnL / 10000) * 100,
    winRate,
    sharpeRatio,
    maxDrawdown,
    equityCurve,
    priceData,
    summary: {
      totalTrades: closedTrades.length,
      winners: winners.length,
      losers: losers.length,
      avgWin,
      avgLoss,
      profitFactor,
    },
  };
}

// ── Deploy Simulation ──
export function simulateDeploy(config: StrategyConfig): {
  txHash: string;
  chain: string;
  contractAddress: string;
  status: 'pending' | 'confirmed';
} {
  const chars = '0123456789abcdef';
  const randomHex = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * 16)]).join('');

  return {
    txHash: `0x${randomHex(64)}`,
    chain: config.chain,
    contractAddress: `0x${randomHex(40)}`,
    status: 'confirmed',
  };
}

// ── AI Strategy Generator ──
export function generateStrategyFromPrompt(prompt: string): StrategyConfig {
  const lower = prompt.toLowerCase();

  // Detect asset
  let symbol = 'ETH';
  if (lower.includes('btc') || lower.includes('bitcoin')) symbol = 'BTC';
  else if (lower.includes('sol') || lower.includes('solana')) symbol = 'SOL';

  // Detect style
  let params = {
    rsiPeriod: 14,
    rsiOversold: 30,
    rsiOverbought: 70,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    stopLoss: 0.02,
    takeProfit: 0.05,
    positionSize: 1000,
    maxPositions: 3,
  };

  if (lower.includes('scalp') || lower.includes('quick')) {
    params.rsiPeriod = 7;
    params.rsiOversold = 25;
    params.rsiOverbought = 75;
    params.stopLoss = 0.01;
    params.takeProfit = 0.02;
    params.positionSize = 2000;
  } else if (lower.includes('conserv') || lower.includes('safe')) {
    params.rsiPeriod = 21;
    params.rsiOversold = 25;
    params.rsiOverbought = 75;
    params.stopLoss = 0.03;
    params.takeProfit = 0.08;
    params.positionSize = 500;
  } else if (lower.includes('aggressive') || lower.includes('yolo')) {
    params.rsiPeriod = 10;
    params.rsiOversold = 20;
    params.rsiOverbought = 80;
    params.stopLoss = 0.05;
    params.takeProfit = 0.15;
    params.positionSize = 5000;
  } else if (lower.includes('grid')) {
    params.rsiPeriod = 14;
    params.stopLoss = 0.015;
    params.takeProfit = 0.015;
    params.positionSize = 500;
    params.maxPositions = 10;
  }

  // Detect stop loss mentions
  const slMatch = lower.match(/stop.?loss\s*(?:at|of|:)?\s*(\d+)%?/);
  if (slMatch) params.stopLoss = parseInt(slMatch[1]) / 100;

  const tpMatch = lower.match(/take.?profit\s*(?:at|of|:)?\s*(\d+)%?/);
  if (tpMatch) params.takeProfit = parseInt(tpMatch[1]) / 100;

  const name = prompt.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Custom Strategy';

  return {
    name,
    chain: 'ethereum',
    symbol,
    indicators: ['RSI', 'MACD'],
    params,
  };
}

// ── Pre-built strategy templates ──
export const STRATEGY_TEMPLATES: { id: string; name: string; description: string; config: StrategyConfig }[] = [
  {
    id: 'momentum-scalper',
    name: 'Momentum Scalper',
    description: 'Fast RSI + MACD entries on 7-period. Quick in, quick out. 1% SL / 2% TP.',
    config: {
      name: 'Momentum Scalper',
      chain: 'ethereum',
      symbol: 'ETH',
      indicators: ['RSI', 'MACD'],
      params: { rsiPeriod: 7, rsiOversold: 25, rsiOverbought: 75, macdFast: 8, macdSlow: 21, macdSignal: 5, stopLoss: 0.01, takeProfit: 0.02, positionSize: 2000, maxPositions: 3 },
    },
  },
  {
    id: 'mean-reversion',
    name: 'Mean Reversion',
    description: 'Buys oversold, sells overbought. Wide SL, tight TP. Works in ranging markets.',
    config: {
      name: 'Mean Reversion',
      chain: 'ethereum',
      symbol: 'ETH',
      indicators: ['RSI', 'MACD'],
      params: { rsiPeriod: 21, rsiOversold: 25, rsiOverbought: 75, macdFast: 12, macdSlow: 26, macdSignal: 9, stopLoss: 0.03, takeProfit: 0.05, positionSize: 1000, maxPositions: 2 },
    },
  },
  {
    id: 'grid-bot',
    name: 'Grid Bot',
    description: 'Small frequent trades at tight levels. Profits from volatility. High win rate.',
    config: {
      name: 'Grid Bot',
      chain: 'ethereum',
      symbol: 'ETH',
      indicators: ['RSI', 'MACD'],
      params: { rsiPeriod: 14, rsiOversold: 35, rsiOverbought: 65, macdFast: 12, macdSlow: 26, macdSignal: 9, stopLoss: 0.015, takeProfit: 0.015, positionSize: 500, maxPositions: 10 },
    },
  },
  {
    id: 'trend-following',
    name: 'Trend Following',
    description: 'Rides trends with wider stops. Fewer trades, bigger wins. Best in trending markets.',
    config: {
      name: 'Trend Following',
      chain: 'ethereum',
      symbol: 'ETH',
      indicators: ['RSI', 'MACD'],
      params: { rsiPeriod: 14, rsiOversold: 40, rsiOverbought: 60, macdFast: 12, macdSlow: 26, macdSignal: 9, stopLoss: 0.05, takeProfit: 0.15, positionSize: 1000, maxPositions: 1 },
    },
  },
  {
    id: 'btc-momentum',
    name: 'BTC Momentum',
    description: 'Momentum strategy optimized for Bitcoin. 10% SL / 20% TP for BTC volatility.',
    config: {
      name: 'BTC Momentum',
      chain: 'ethereum',
      symbol: 'BTC',
      indicators: ['RSI', 'MACD'],
      params: { rsiPeriod: 14, rsiOversold: 30, rsiOverbought: 70, macdFast: 12, macdSlow: 26, macdSignal: 9, stopLoss: 0.10, takeProfit: 0.20, positionSize: 500, maxPositions: 1 },
    },
  },
];
