'use client'

import { useEffect, useState, useCallback } from 'react'
import type { CryptoAnalysis } from '@/lib/analysis'
import { supabase } from '@/lib/supabase'

export default function BtcDashboard() {
  const [coin, setCoin] = useState<CryptoAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/analyze?t=${Date.now()}`)
      const json = await res.json()
      if (json.success) {
        // BTCのみ抽出
        const btcData = json.data.find((c: CryptoAnalysis) => c.symbol === 'BTC')
        setCoin(btcData || null)
        setLastUpdated(new Date().toLocaleTimeString('ja-JP'))
      } else {
        setError(json.error)
      }
    } catch {
      setError('通信エラー')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalysis()
    const interval = setInterval(fetchAnalysis, 30000) // 30秒更新
    return () => clearInterval(interval)
  }, [fetchAnalysis])

  if (error) {
    return <div className="min-h-screen bg-[#070d1a] text-white p-10 flex items-center justify-center">Error: {error}</div>
  }

  if (!coin || loading) {
    return (
      <div className="min-h-screen bg-[#070d1a] text-white flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin text-4xl">₿</div>
        <div className="text-cyan-400 font-mono text-sm tracking-widest">LOADING BTC SYSTEM...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#070d1a] text-slate-100 font-sans p-6 overflow-x-hidden">
      {/* 画面上部ヘッダー部 */}
      <header className="max-w-7xl mx-auto flex items-end justify-between mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
            BTC SENTINEL
          </h1>
          <p className="text-slate-500 font-mono text-xs mt-2 uppercase tracking-widest">
            Bitcoin Algorithmic Analysis Dashboard
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">System Time</div>
          <div className="text-cyan-400 font-mono text-sm bg-cyan-900/20 px-3 py-1 rounded-md border border-cyan-500/20">
            {lastUpdated}
          </div>
        </div>
      </header>

      {/* ダッシュボードグリッド（プロフェッショナルな計器群） */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Price Tracker Widget (画面左上・重要度高) */}
        <PriceWidget coin={coin} />

        {/* 2. AI Command Center (画面中央上段・アクション可能) */}
        <AICommandWidget coin={coin} />

        {/* 3. RSI Momentum Widget */}
        <RsiWidget rsi={coin.rsi} />

        {/* 4. SMA Trend Widget */}
        <SmaWidget price={coin.price} sma25={coin.sma25} sma75={coin.sma75} />

        {/* 5. MACD Flow Widget */}
        <MacdWidget macd={coin.macd} />

        {/* 6. Bollinger Bands Volatility Widget */}
        <BollingerWidget bb={coin.bb} price={coin.price} position={coin.bbPosition} />

      </div>
    </main>
  )
}

// ==========================================
// Widgets (各分析モジュールの部品化)
// ==========================================

function WidgetContainer({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
        {title}
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
      </h3>
      {children}
    </div>
  )
}

function PriceWidget({ coin }: { coin: CryptoAnalysis }) {
  const isUp = coin.change24h >= 0
  return (
    <WidgetContainer title="Market Price / 24H" className="lg:col-span-1">
      <div className="flex items-end gap-2">
        <span className="text-4xl font-black font-mono">
          ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className={`mt-2 flex items-center gap-2 font-mono text-sm font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
        <span className={`px-2 py-0.5 rounded-md ${isUp ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
        </span>
        <span className="text-slate-600 text-xs">(24H)</span>
      </div>
    </WidgetContainer>
  )
}

function AICommandWidget({ coin }: { coin: CryptoAnalysis }) {
  const scorePercent = Math.min(100, Math.max(0, (coin.signalScore + 100) / 2))
  return (
    <WidgetContainer title="Sentinel AI Signal" className="lg:col-span-1">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-black tracking-tight" style={{ color: coin.signalColor }}>
          {coin.signalLabel}
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 mb-1 tracking-widest">NET SCORE</div>
          <div className="font-mono font-bold text-lg">{coin.signalScore > 0 ? '+' : ''}{coin.signalScore}</div>
        </div>
      </div>
      
      {/* ゲージバー */}
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-3 border border-black/50">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${scorePercent}%`,
            background: `linear-gradient(90deg, #ef4444 0%, #cbd5e1 50%, #4ade80 100%)`, 
            opacity: 0.9
          }}
        />
        {/* 現在地マーカー */}
        <div className="absolute top-0 h-full w-1 bg-white shadow-[0_0_8px_white]" style={{ left: `calc(${scorePercent}% - 2px)` }} />
      </div>
      
      <div className="text-xs font-bold text-slate-400 bg-black/20 p-2 rounded-lg border border-white/5 text-center">
        {coin.entryRecommendation}
      </div>
    </WidgetContainer>
  )
}

function SmaWidget({ price, sma25, sma75 }: { price: number, sma25: number, sma75: number }) {
  const isGoldenCross = sma25 > sma75
  return (
    <WidgetContainer title="Moving Averages">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] text-slate-500 mb-1">SMA 25 (Short)</div>
          <div className="font-mono text-sm text-cyan-100">${sma25.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">SMA 75 (Medium)</div>
          <div className="font-mono text-sm text-blue-200">${sma75.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
        </div>
      </div>
      <div className={`text-xs text-center py-2 rounded-lg border font-bold ${isGoldenCross ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
        {isGoldenCross ? 'Bullish Trend (SMA25 > SMA75)' : 'Bearish Trend (SMA25 < SMA75)'}
      </div>
    </WidgetContainer>
  )
}

function RsiWidget({ rsi }: { rsi: number }) {
  const isOverbought = rsi > 70
  const isOversold = rsi < 30
  const percent = Math.min(100, Math.max(0, rsi))
  
  return (
    <WidgetContainer title="RSI Momentum (14D)">
      <div className="flex justify-between items-end mb-2">
        <div className="text-3xl font-mono font-bold text-white">{rsi.toFixed(1)}</div>
        <div className="text-xs font-bold mb-1">
          {isOverbought ? <span className="text-red-400">OVERBOUGHT</span> : 
           isOversold ? <span className="text-green-400">OVERSOLD</span> : 
           <span className="text-slate-400">NEUTRAL</span>}
        </div>
      </div>
      
      {/* RSI Gauge */}
      <div className="h-6 w-full bg-slate-800 rounded-md relative flex items-center border border-black/40">
        <div className="absolute left-[30%] w-px h-full bg-white/20 z-10" />
        <div className="absolute left-[70%] w-px h-full bg-white/20 z-10" />
        
        <div className="absolute h-full rounded-md transition-all duration-1000 bg-gradient-to-r from-purple-600 to-indigo-500" 
             style={{ width: `${percent}%` }} />
             
        <span className="absolute left-[26%] text-[9px] text-slate-400 -bottom-4">30</span>
        <span className="absolute left-[66%] text-[9px] text-slate-400 -bottom-4">70</span>
      </div>
    </WidgetContainer>
  )
}

function MacdWidget({ macd }: { macd: any }) {
  return (
    <WidgetContainer title="MACD Oscillator">
      <div className="flex items-center justify-between h-full">
        <div className="space-y-3 w-1/2">
          <div>
            <div className="text-[10px] text-slate-500">MACD Line</div>
            <div className={`font-mono font-bold text-sm ${macd.macdLine > 0 ? 'text-green-400' : 'text-red-400'}`}>{macd.macdLine.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Signal Line</div>
            <div className={`font-mono font-bold text-sm ${macd.signalLine > 0 ? 'text-green-400' : 'text-red-400'}`}>{macd.signalLine.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="w-1/2 flex flex-col items-end border-l border-white/10 pl-4 py-2">
           <div className="text-[10px] text-slate-500 mb-2">Histogram</div>
           <div className="text-2xl">
             {macd.histogram > 0 ? '🟩' : '🟥'}
           </div>
           <div className="text-[10px] font-mono mt-1 text-slate-400 font-bold">{macd.histogram.toFixed(2)}</div>
           <div className={`text-xs mt-3 px-2 py-1 bg-black/30 rounded border ${macd.isBullish ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}`}>
             {macd.isBullish ? 'Buy Signal' : 'Sell Signal'}
           </div>
        </div>
      </div>
    </WidgetContainer>
  )
}

function BollingerWidget({ bb, price, position }: { bb: any, price: number, position: string }) {
  return (
    <WidgetContainer title="Bollinger Bands (20, 2σ)">
      <div className="relative pt-2 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[10px] text-slate-500">Upper Band</div>
          <div className="font-mono text-sm text-red-300">${bb.upper.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
        </div>
        
        {/* 中長期バンド */}
        <div className="flex justify-between items-center mb-4 border-y border-white/5 py-2">
          <div className="text-[10px] text-slate-500">Middle (SMA)</div>
          <div className="font-mono text-sm text-slate-300">${bb.middle.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-[10px] text-slate-500">Lower Band</div>
          <div className="font-mono text-sm text-green-300">${bb.lower.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
          <div className="text-xs text-slate-400">Position</div>
          <div className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded font-bold tracking-widest text-[#a8b1c4]">
            {position}
          </div>
        </div>
      </div>
    </WidgetContainer>
  )
}
