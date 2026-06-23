/**
 * Price Feed Module
 * Fetches live crypto prices from CoinGecko free API (no API key required)
 * Supports ETH, BTC, SOL with 24h change and historical chart data
 * In-memory cache with 30s TTL
 */

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  lastUpdated: number;
}

export interface HistoricalPricePoint {
  timestamp: number;
  price: number;
}

export interface HistoricalData {
  symbol: string;
  data: HistoricalPricePoint[];
}

const CACHE_TTL = 30_000; // 30 seconds in milliseconds
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// CoinGecko ID mapping
const COIN_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
};

const SUPPORTED_SYMBOLS = ['BTC', 'ETH', 'SOL'] as const;
export type SupportedSymbol = (typeof SUPPORTED_SYMBOLS)[number];

// In-memory caches
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function isCacheValid(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  return entry.data as T;
}

async function fetchWithRetry<T>(
  url: string,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limited by CoinGecko');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Fetch current prices for all supported symbols (BTC, ETH, SOL)
 * Includes 24h change percentage
 */
export async function fetchCurrentPrices(): Promise<PriceData[]> {
  const cacheKey = 'all:prices';

  if (isCacheValid(cacheKey)) {
    return getCache<PriceData[]>(cacheKey)!;
  }

  const ids = SUPPORTED_SYMBOLS.map((s) => COIN_IDS[s]).join(',');
  const url = `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const response = await fetchWithRetry<Record<string, { usd: number; usd_24h_change: number }>>(url);

    const prices: PriceData[] = SUPPORTED_SYMBOLS.map((symbol) => {
      const coinId = COIN_IDS[symbol];
      const data = response[coinId];
      return {
        symbol,
        price: data?.usd ?? 0,
        change24h: data?.usd_24h_change ?? 0,
        change24hPercent: data?.usd_24h_change ?? 0,
        lastUpdated: Date.now(),
      };
    });

    setCache(cacheKey, prices);
    return prices;
  } catch (error) {
    console.error('Failed to fetch current prices:', error);
    // Return stale cache if available
    const stale = getCache<PriceData[]>(cacheKey);
    if (stale) return stale;
    throw error;
  }
}

/**
 * Fetch current price for a single symbol
 */
export async function fetchPrice(symbol: SupportedSymbol): Promise<PriceData> {
  const cacheKey = `price:${symbol}`;

  if (isCacheValid(cacheKey)) {
    return getCache<PriceData>(cacheKey)!;
  }

  const prices = await fetchCurrentPrices();
  const price = prices.find((p) => p.symbol === symbol);

  if (!price) {
    throw new Error(`Price not found for ${symbol}`);
  }

  setCache(cacheKey, price);
  return price;
}

/**
 * Fetch historical price data for charting
 * @param symbol - Crypto symbol (BTC, ETH, SOL)
 * @param days - Number of days of history (1, 7, 30, 90, 365, max)
 */
export async function fetchHistoricalData(
  symbol: SupportedSymbol,
  days: 1 | 7 | 30 | 90 | 365 | 'max' = 7
): Promise<HistoricalData> {
  const cacheKey = `historical:${symbol}:${days}`;

  if (isCacheValid(cacheKey)) {
    return getCache<HistoricalData>(cacheKey)!;
  }

  const coinId = COIN_IDS[symbol];
  const url = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;

  try {
    const response = await fetchWithRetry<{ prices: [number, number][] }>(url);

    const data: HistoricalPricePoint[] = response.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
    }));

    const historicalData: HistoricalData = {
      symbol,
      data,
    };

    setCache(cacheKey, historicalData);
    return historicalData;
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);
    // Return stale cache if available
    const stale = getCache<HistoricalData>(cacheKey);
    if (stale) return stale;
    throw error;
  }
}

/**
 * Fetch historical data for all supported symbols
 */
export async function fetchAllHistoricalData(
  days: 1 | 7 | 30 | 90 | 365 | 'max' = 7
): Promise<HistoricalData[]> {
  const results = await Promise.all(
    SUPPORTED_SYMBOLS.map((symbol) => fetchHistoricalData(symbol, days))
  );
  return results;
}

/**
 * Get cached price data without fetching (synchronous)
 */
export function getCachedPrice(symbol: SupportedSymbol): PriceData | null {
  const cacheKey = `price:${symbol}`;
  if (isCacheValid(cacheKey)) {
    return getCache<PriceData>(cacheKey);
  }
  return null;
}

/**
 * Get all cached prices (synchronous)
 */
export function getAllCachedPrices(): PriceData[] {
  return SUPPORTED_SYMBOLS.map((symbol) => getCachedPrice(symbol)).filter(
    (p): p is PriceData => p !== null
  );
}

/**
 * Clear all caches (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): {
  cacheSize: number;
  cacheKeys: string[];
} {
  return {
    cacheSize: cache.size,
    cacheKeys: Array.from(cache.keys()),
  };
}

/**
 * Pre-warm cache by fetching all data
 */
export async function warmCache(
  days: 1 | 7 | 30 | 90 | 365 | 'max' = 7
): Promise<void> {
  await Promise.all([fetchCurrentPrices(), fetchAllHistoricalData(days)]);
}

export default {
  fetchCurrentPrices,
  fetchPrice,
  fetchHistoricalData,
  fetchAllHistoricalData,
  getCachedPrice,
  getAllCachedPrices,
  clearCache,
  getCacheStats,
  warmCache,
};
