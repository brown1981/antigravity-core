// 🛰️ Crypto Sentinel - Phase 2 Analysis Engine (Refactored)
// 共有エンジンのコアロジックを使用するように再構成されました。

import { 
  calcSMA, 
  calcRSI, 
  calcMACD, 
  calcBB, 
  getBBPosition, 
  calculateCompositeScore,
  getSignalFromScore,
  type MACDResult,
  type BollingerBands,
  type SignalStatus
} from './shared/engine'

export type Signal = SignalStatus

export interface CryptoAnalysis {
  symbol: string
  name: string
  price: number
  change24h: number
  sma25: number
  sma75: number
  rsi: number
  macd: MACDResult
  bb: BollingerBands
  bbPosition: 'UPPER' | 'MIDDLE' | 'LOWER' | 'NORMAL'
  signal: Signal
  signalLabel: string
  signalColor: string
  signalScore: number
  entryRecommendation: string
  timestamp: string
}

const COIN_NAMES: Record<string, string> = {
  BTCUSDT: 'Bitcoin',
  ETHUSDT: 'Ethereum',
  XRPUSDT: 'XRP',
}

// Binance APIからデータ取得
async function fetchBinanceData(symbol: string): Promise<{
  closes: number[]
  lastPrice: number
  change24h: number
}> {
  const [klinesRes, tickerRes] = await Promise.all([
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=100`),
    fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`),
  ])
  if (!klinesRes.ok) throw new Error(`Binance klines error for ${symbol}: ${klinesRes.status}`)
  if (!tickerRes.ok) throw new Error(`Binance ticker error for ${symbol}: ${tickerRes.status}`)

  const klines = (await klinesRes.json()) as number[][]
  const ticker = (await tickerRes.json()) as { lastPrice: string; priceChangePercent: string }

  return {
    closes: klines.map((k) => parseFloat(k[4] as unknown as string)),
    lastPrice: parseFloat(ticker.lastPrice),
    change24h: parseFloat(ticker.priceChangePercent),
  }
}

// メイン分析関数
export async function analyzeCoins(symbols: string[]): Promise<CryptoAnalysis[]> {
  const results: CryptoAnalysis[] = []

  for (const symbol of symbols) {
    const { closes, lastPrice, change24h } = await fetchBinanceData(symbol)
    if (closes.length < 30) throw new Error(`Insufficient data for ${symbol}`)

    const sma25 = calcSMA(closes, 25)
    const sma75 = calcSMA(closes, 75)
    const rsi = calcRSI(closes)
    const macd = calcMACD(closes)
    const bb = calcBB(closes, 20, 2)
    const bbPosition = getBBPosition(lastPrice, bb)
    const score = calculateCompositeScore({ rsi, macd, bbPosition, sma25, sma75 })
    const { signal, label, color, entry } = getSignalFromScore(score)
    const displaySymbol = symbol.replace('USDT', '')

    results.push({
      symbol: displaySymbol,
      name: COIN_NAMES[symbol] || displaySymbol,
      price: lastPrice,
      change24h,
      sma25,
      sma75,
      rsi,
      macd,
      bb,
      bbPosition,
      signal,
      signalLabel: label,
      signalColor: color,
      signalScore: score,
      entryRecommendation: entry,
      timestamp: new Date().toISOString(),
    })
  }

  return results
}
