'use client'

import { useState } from 'react'
import { PlusCircle, History } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TradeForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [symbol, setSymbol] = useState('BTC')
  const [entryPrice, setEntryPrice] = useState('')
  const [amount, setAmount] = useState('200000')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase.from('trades').insert([{
        symbol,
        direction: 'BUY',
        exchange: 'Binance',
        entry_price: parseFloat(entryPrice),
        amount_jpy: parseInt(amount),
        status: 'OPEN',
        entry_at: new Date().toISOString()
      }])

      if (error) throw error

      alert(`${symbol} のトレードを記録しました！`)
      setIsOpen(false)
      setEntryPrice('')
    } catch (error: any) {
      console.error('Error saving trade:', error)
      alert('エラーが発生しました: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-900/20 active:scale-95 border border-cyan-400/20"
      >
        <PlusCircle size={18} />
        新規取引を記録
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#070d1a]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl ring-1 ring-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl">
            <History className="text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">新規トレード入力</h2>
            <p className="text-xs text-slate-500">取引データを記録して勝率を追跡します</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">対象通貨ペア</label>
            <select 
              value={symbol} 
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none"
            >
              <option value="BTC">BTC / USDT</option>
              <option value="ETH">ETH / USDT</option>
              <option value="XRP">XRP / USDT</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">価格 (USD)</label>
              <input 
                type="number" 
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="65000"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">投資額 (JPY)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-3 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm font-bold transition-all text-slate-400"
            >
              閉じる
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-900/20"
            >
              {isSubmitting ? '保存中...' : '記録を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
