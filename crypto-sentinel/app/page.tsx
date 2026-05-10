'use client'

import { useEffect, useState, useCallback } from 'react'
import type { CryptoAnalysis } from '@/lib/analysis'
import { supabase } from '@/lib/supabase'
import HistoryChart from './components/HistoryChart'
import TradeForm from './components/TradeForm'

const REFRESH_INTERVAL = 60000

export default function Dashboard() {
  const [data, setData] = useState<CryptoAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])

  const fetchRecommendations = useCallback(async () => {
    const { data: trades, error } = await supabase
      .from('trades')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
    if (!error) setRecommendations(trades || [])
  }, [])

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // キャッシュを回避するためにタイムスタンプを追加
      const res = await fetch(`/api/analyze?t=${Date.now()}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setLastUpdated(new Date().toLocaleTimeString('ja-JP'))
        fetchRecommendations() // 分析更新時に推薦も更新
      } else {
        setError(json.error || 'データの取得に失敗しました')
      }
    } catch {
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [fetchRecommendations])

  useEffect(() => {
    fetchAnalysis()
    const interval = setInterval(fetchAnalysis, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchAnalysis])

  const handleTradeDecision = async (id: number, decision: 'OPEN' | 'REJECTED') => {
    const { error } = await supabase
      .from('trades')
      .update({ status: decision })
      .eq('id', id)
    
    if (!error) {
      fetchRecommendations()
      if (decision === 'OPEN') alert('トレードを承認しました！エントリーを記録しました。')
    }
  }

  return (
    <main className="min-h-screen bg-[#070d1a] text-white font-sans">
      {/* ヘッダー */}
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              🛡️ Crypto Sentinel
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">スイングトレード分析 | 元手40万円 | 月利2.5%目標</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-600">最終更新</div>
              <div className="text-sm text-cyan-400 font-mono">{lastUpdated || '--:--:--'}</div>
            </div>
            <div className="flex items-center gap-3">
              <TradeForm />
              <button
                onClick={fetchAnalysis}
                disabled={loading}
                className="text-xs px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl transition-all border border-slate-700 hover:border-cyan-500/50 flex items-center gap-2 min-w-[100px] justify-center"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block">🔄</span>
                    更新中...
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    更新
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* エラー */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* AI 推薦リスト (Phase 4) */}
        {recommendations.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2 px-1">
              <span className="animate-pulse">🧠</span> AI エージェントからの投資提案
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-slate-900/80 border-l-4 border-cyan-500 rounded-r-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-cyan-500/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-cyan-500/10 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded border border-cyan-500/20">{rec.symbol} / BUY 推奨</span>
                      <span className="text-slate-500 text-xs font-mono">{new Date(rec.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">「{rec.ai_reasoning}」</p>
                    <div className="mt-2 text-[10px] text-slate-500 flex gap-4">
                      <span>想定価格: ${rec.entry_price.toLocaleString()}</span>
                      <span>分析スコア: +{rec.recommended_score}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleTradeDecision(rec.id, 'REJECTED')}
                      className="flex-1 md:flex-none px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded-xl border border-slate-700 transition-all"
                    >
                      却下
                    </button>
                    <button
                      onClick={() => handleTradeDecision(rec.id, 'OPEN')}
                      className="flex-1 md:flex-none px-8 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all"
                    >
                      承認してエントリー
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: '元手', value: '¥400,000', color: 'text-cyan-400' },
            { label: '月間目標', value: '¥10,000', color: 'text-green-400' },
            { label: '1回投資額', value: '¥200,000', color: 'text-blue-400' },
            { label: '目標月利', value: '2.5%', color: 'text-purple-400' },
          ].map((item) => (
            <div key={item.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500">{item.label}</div>
              <div className={`text-lg font-bold font-mono mt-1 ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* コインカード */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-slate-800/50 rounded-2xl h-96 border border-slate-700/50" />
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-5 transition-opacity duration-300 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            {data.map((coin) => (
              <CoinCard key={coin.symbol} coin={coin} />
            ))}
          </div>
        )}

        {/* 免責事項 */}
        <p className="text-center text-slate-700 text-xs mt-8">
          ※ 情報提供のみを目的としています。投資判断はご自身の責任で行ってください。
        </p>
      </div>
    </main>
  )
}

function CoinCard({ coin }: { coin: CryptoAnalysis }) {
  const isPositive = coin.change24h >= 0
  const scorePercent = Math.min(100, Math.max(0, (coin.signalScore + 100) / 2))

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-300">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{coin.symbol}</span>
            <span className="text-slate-500 text-xs">{coin.name}</span>
          </div>
          <div className="text-2xl font-mono font-bold mt-1">
            ${coin.price.toLocaleString('en-US', { minimumFractionDigits: coin.price < 10 ? 4 : 2, maximumFractionDigits: coin.price < 10 ? 4 : 2 })}
          </div>
          <div className={`text-xs font-medium mt-0.5 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%（24h）
          </div>
        </div>
        <div
          className="px-2.5 py-1 rounded-lg text-xs font-bold border text-center min-w-[90px]"
          style={{ color: coin.signalColor, borderColor: coin.signalColor + '40', backgroundColor: coin.signalColor + '15' }}
        >
          {coin.signalLabel}
        </div>
      </div>

      {/* エントリー推奨 */}
      <div className="bg-slate-800/50 rounded-xl p-3 mb-4 text-sm font-medium text-center">
        {coin.entryRecommendation}
      </div>

      {/* スコアゲージ */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>売り (-100)</span>
          <span className="text-slate-400 font-mono">スコア: {coin.signalScore > 0 ? '+' : ''}{coin.signalScore}</span>
          <span>買い (+100)</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${scorePercent}%`,
              backgroundColor: coin.signalScore >= 25 ? '#4ade80' : coin.signalScore <= -25 ? '#ef4444' : '#94a3b8',
            }}
          />
        </div>
      </div>

      {/* 指標グリッド */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <MetricBox label="RSI (14)" value={coin.rsi.toFixed(1)}
          highlight={coin.rsi < 35 || coin.rsi > 65}
          subtext={coin.rsi < 30 ? '売られすぎ' : coin.rsi > 70 ? '買われすぎ' : ''} />
        <MetricBox label="SMA 25" value={`$${formatPrice(coin.sma25)}`} />
        <MetricBox label="SMA 75" value={`$${formatPrice(coin.sma75)}`} />
      </div>

      {/* MACD */}
      <div className="bg-slate-800/30 rounded-xl p-3 mb-3">
        <div className="text-xs text-slate-500 mb-2 font-medium">MACD (12, 26, 9)</div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-xs text-slate-600">MACDライン</div>
            <div className={`text-xs font-mono font-bold ${coin.macd.macdLine >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {coin.macd.macdLine.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600">シグナル</div>
            <div className={`text-xs font-mono font-bold ${coin.macd.signalLine >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {coin.macd.signalLine.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600">クロス</div>
            <div className={`text-xs font-bold ${coin.macd.isBullish ? 'text-cyan-400' : coin.macd.histogram > 0 ? 'text-green-400' : 'text-slate-500'}`}>
              {coin.macd.isBullish ? '🔔 GC' : coin.macd.histogram > 0 ? '↑上昇' : '↓下降'}
            </div>
          </div>
        </div>
      </div>

      {/* ボリンジャーバンド */}
      <div className="bg-slate-800/30 rounded-xl p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-slate-500 font-medium">ボリンジャーバンド (20, 2σ)</div>
          <BBPositionBadge position={coin.bbPosition} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-slate-600">上限</div>
            <div className="text-xs font-mono text-red-400">${formatPrice(coin.bb.upper)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600">中央</div>
            <div className="text-xs font-mono text-slate-300">${formatPrice(coin.bb.middle)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600">下限</div>
            <div className="text-xs font-mono text-green-400">${formatPrice(coin.bb.lower)}</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-600 text-center">
          バンド幅: {coin.bb.bandwidth.toFixed(1)}%
          {coin.bb.bandwidth < 5 ? ' ⚡ スクイーズ中（急騰注意）' : ''}
        </div>
      </div>

      {/* SMAトレンド */}
      <div className="mt-3 text-xs text-slate-600 border-t border-slate-800 pt-3">
        {coin.sma25 > coin.sma75 ? '📈 上昇トレンド（25 > 75）' : '📉 下降トレンド（25 < 75）'}
      </div>

      {/* 履歴グラフ (Phase 3) */}
      <HistoryChart symbol={coin.symbol} currentScore={coin.signalScore} />
    </div>
  )
}

function MetricBox({ label, value, highlight = false, subtext = '' }: {
  label: string; value: string; highlight?: boolean; subtext?: string
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-2.5 text-center">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <div className={`font-mono font-bold text-xs ${highlight ? 'text-cyan-400' : 'text-white'}`}>{value}</div>
      {subtext && <div className="text-xs text-yellow-400 mt-0.5">{subtext}</div>}
    </div>
  )
}

function BBPositionBadge({ position }: { position: string }) {
  const map: Record<string, { label: string; color: string }> = {
    UPPER: { label: '上限付近', color: 'text-red-400' },
    LOWER: { label: '下限付近', color: 'text-green-400' },
    MIDDLE: { label: '中央付近', color: 'text-slate-400' },
    NORMAL: { label: '通常範囲', color: 'text-slate-500' },
  }
  const info = map[position] || map.NORMAL
  return <span className={`text-xs font-bold ${info.color}`}>{info.label}</span>
}

function formatPrice(price: number): string {
  if (price >= 1000) return Math.round(price).toLocaleString()
  if (price >= 1) return price.toFixed(2)
  return price.toFixed(4)
}
