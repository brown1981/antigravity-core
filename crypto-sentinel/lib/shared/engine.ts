/**
 * 🛰️ Crypto Sentinel - Core Trading Engine
 * 環境（Node.js, Deno）に依存しない純粋な数学的ロジックを定義します。
 */

export interface BollingerBands {
  upper: number
  middle: number
  lower: number
  bandwidth: number
}

export interface MACDResult {
  macdLine: number
  signalLine: number
  histogram: number
  isBullish: boolean
}

export interface OHLCV {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SDZone {
  type: 'SUPPLY' | 'DEMAND'
  top: number
  bottom: number
  timestamp: number
  isFresh: boolean
}

// EMA（指数移動平均）
export function calcEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const emas: number[] = [prices[0]]
  for (let i = 1; i < prices.length; i++) {
    emas.push(prices[i] * k + emas[i - 1] * (1 - k))
  }
  return emas
}

// SMA（単純移動平均）
export function calcSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0
  const slice = prices.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / period
}

// EMA 200 (Single Value)
export function calcEMA200(prices: number[]): number {
  const emas = calcEMA(prices, 200)
  return emas[emas.length - 1] || 0
}

// ATR（アベレージ・トゥルー・レンジ）算出
export function calcATR(candles: OHLCV[], period = 14): number {
  if (candles.length < period + 1) return 0
  let trSum = 0
  for (let i = candles.length - period; i < candles.length; i++) {
    const high = candles[i].high
    const low = candles[i].low
    const prevClose = candles[i - 1].close
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose))
    trSum += tr
  }
  return trSum / period
}

// RSI（相対力指数）
export function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50
  let gains = 0, losses = 0
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) gains += diff
    else losses += Math.abs(diff)
  }
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  return 100 - 100 / (1 + (gains / period) / avgLoss)
}

// MACD
export function calcMACD(prices: number[]): MACDResult {
  const ema12 = calcEMA(prices, 12)
  const ema26 = calcEMA(prices, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i])
  const signalEMAs = calcEMA(macdLine.slice(-30), 9)
  const macdVal = macdLine[macdLine.length - 1]
  const signalVal = signalEMAs[signalEMAs.length - 1]
  const prevMacd = macdLine[macdLine.length - 2]
  const prevSignal = signalEMAs[signalEMAs.length - 2]
  return {
    macdLine: macdVal,
    signalLine: signalVal,
    histogram: macdVal - signalVal,
    isBullish: macdVal > signalVal && prevMacd <= prevSignal,
  }
}

// ボリンジャーバンド
export function calcBB(prices: number[], period = 20, multiplier = 2): BollingerBands {
  const slice = prices.slice(-period)
  const middle = slice.reduce((a, b) => a + b, 0) / period
  const variance = slice.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / period
  const std = Math.sqrt(variance)
  const upper = middle + multiplier * std
  const lower = middle - multiplier * std
  return {
    upper,
    middle,
    lower,
    bandwidth: ((upper - lower) / middle) * 100,
  }
}

// BB位置判定
export function getBBPosition(price: number, bb: BollingerBands): 'UPPER' | 'MIDDLE' | 'LOWER' | 'NORMAL' {
  if (price >= bb.upper * 0.98) return 'UPPER'
  if (price <= bb.lower * 1.02) return 'LOWER'
  if (price >= bb.middle * 0.98 && price <= bb.middle * 1.02) return 'MIDDLE'
  return 'NORMAL'
}

/**
 * Doyle 流 Supply & Demand ゾーンの検知
 */
export function findSDZones(candles: OHLCV[], limit = 100): SDZone[] {
  const zones: SDZone[] = []
  const atr = calcATR(candles)
  if (atr === 0) return []
  
  for (let i = candles.length - Math.min(candles.length, limit); i < candles.length - 3; i++) {
    const c1 = candles[i]
    const c2 = candles[i + 1]
    const move = c2.close - c1.close
    
    if (move > atr * 1.5 && c1.close < c1.open) {
      zones.push({
        type: 'DEMAND',
        top: Math.max(c1.open, c1.close, c1.high),
        bottom: Math.min(c1.open, c1.close, c1.low),
        timestamp: c1.timestamp,
        isFresh: true
      })
    } else if (move < -atr * 1.5 && c1.close > c1.open) {
      zones.push({
        type: 'SUPPLY',
        top: Math.max(c1.open, c1.close, c1.high),
        bottom: Math.min(c1.open, c1.close, c1.low),
        timestamp: c1.timestamp,
        isFresh: true
      })
    }
  }

  return zones.map(zone => {
    const testSlice = candles.filter(c => c.timestamp > zone.timestamp)
    const isTapped = testSlice.some(c => c.close < zone.top && c.close > zone.bottom)
    return { ...zone, isFresh: !isTapped }
  })
}

/**
 * ゾーンへのヒゲ反発（Rejection）を検知
 */
export function checkRejection(current: OHLCV, zone: SDZone): boolean {
  if (zone.type === 'DEMAND') {
    return current.low <= zone.top && current.close > zone.top
  } else {
    return current.high >= zone.bottom && current.close < zone.bottom
  }
}

export type SignalStatus = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL'

export interface SignalInfo {
  signal: SignalStatus
  label: string
  color: string
  score: number
  entry: string
}

// ... (既存の関数は維持) ...

/**
 * 複合シグナルスコア計算 (-100 〜 +100)
 */
export function calculateCompositeScore(params: {
  rsi: number,
  macd: MACDResult,
  bbPosition: string,
  sma25: number,
  sma200: number, 
  price: number
}) {
  let score = 0
  const trendBias = params.price >= params.sma200 ? 1 : -1

  // RSIスコア (-40 〜 +40)
  if (params.rsi < 30) score += 40
  else if (params.rsi < 40) score += 25
  else if (params.rsi > 70) score -= 40
  else if (params.rsi > 60) score -= 25

  // MACDスコア (-30 〜 +30)
  if (params.macd.isBullish) score += 30
  else if (params.macd.histogram < 0) score -= 15

  // BBスコア (-20 〜 +20)
  if (params.bbPosition === 'LOWER') score += 20
  else if (params.bbPosition === 'UPPER') score -= 20

  // トレンドと逆のシグナルはペナルティ (200 EMA フィルター)
  if (score > 0 && trendBias === -1) score *= 0.5
  if (score < 0 && trendBias === 1) score *= 0.5

  return Math.min(100, Math.max(-100, score))
}

/**
 * スコアに基づいたシグナル情報の取得 (SSOT - Single Source of Truth)
 */
export function getSignalFromScore(score: number): SignalInfo {
  if (score >= 60) {
    return { signal: 'STRONG_BUY', label: '✅ 強い買い', color: '#00d4aa', score, entry: '🟢 強力推奨' }
  } else if (score >= 25) {
    return { signal: 'BUY', label: '🟢 買い推奨', color: '#4ade80', score, entry: '🟡 検討' }
  } else if (score >= -15) {
    return { signal: 'NEUTRAL', label: '⚪ 様子見', color: '#94a3b8', score, entry: '⏳ 見送り' }
  } else if (score >= -40) {
    return { signal: 'SELL', label: '🟡 売り推奨', color: '#fbbf24', score, entry: '🔴 利確検討' }
  } else {
    return { signal: 'STRONG_SELL', label: '🔴 強い売り', color: '#ef4444', score, entry: '🚨 即座に利確' }
  }
}
