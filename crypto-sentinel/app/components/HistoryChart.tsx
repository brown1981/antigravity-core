'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface HistoryData {
  created_at: string
  signal_score: number
  price: number
}

export default function HistoryChart({ symbol, currentScore }: { symbol: string, currentScore?: number }) {
  const [data, setData] = useState<HistoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/history?symbol=${symbol}&days=7`)
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [symbol])

  // データの正規化（null の場合に 0 に変換）
  const processedData = data.map(d => ({
    ...d,
    signal_score: typeof d.signal_score === 'number' ? d.signal_score : 0
  }))

  if (loading) return <div className="h-48 flex items-center justify-center text-slate-500 text-xs text-center border border-slate-800 rounded-xl bg-slate-900/30">シグナル履歴を読み込み中...</div>
  if (data.length === 0) return <div className="h-48 flex items-center justify-center text-slate-500 text-xs text-center border border-slate-800 rounded-xl bg-slate-900/30">履歴データがありません</div>

  return (
    <div className="h-48 w-full mt-4 bg-slate-900/20 border border-slate-800/50 rounded-xl p-2 min-h-[192px]">
      <div className="text-[10px] text-slate-500 mb-1 flex justify-between px-2 uppercase tracking-wider font-bold">
        <span>Signal History (7d)</span>
        <span className="font-mono text-cyan-400">
          Score: {typeof currentScore === 'number' 
            ? (currentScore > 0 ? `+${currentScore}` : currentScore) 
            : (processedData[processedData.length - 1]?.signal_score ?? '--')}
        </span>
      </div>
      <div className="h-[150px] w-full"> {/* コンテナの高さを確保 */}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={0.2} />
                <stop offset="50%" stopColor="#94a3b8" stopOpacity={0} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="created_at" 
              hide 
            />
            <YAxis 
              domain={[-100, 100]} 
              hide 
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
              itemStyle={{ color: '#94a3b8' }}
              labelFormatter={(label) => new Date(label).toLocaleString('ja-JP')}
            />
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
            <ReferenceLine y={60} stroke="#00d4aa" strokeDasharray="2 2" strokeOpacity={0.5} />
            <ReferenceLine y={-40} stroke="#fbbf24" strokeDasharray="2 2" strokeOpacity={0.5} />
            <Area
              type="monotone"
              dataKey="signal_score"
              stroke="#4ade80"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorScore)"
              isAnimationActive={false}
              connectNulls={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
