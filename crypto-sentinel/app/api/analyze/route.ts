import { analyzeCoins } from '@/lib/analysis'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const revalidate = 0

export async function GET() {
  try {
    // Phase 2: BTC + ETH + XRP
    const coins = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT']
    const analysis = await analyzeCoins(coins)

    if (analysis.length === 0) {
      return NextResponse.json(
        { success: false, error: 'データを取得できませんでした。' },
        { status: 503 }
      )
    }

    // Supabaseに保存
    let saveSuccess = false
    let saveError = null
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const rows = analysis.map((a) => ({
          symbol: a.symbol,
          name: a.name,
          price: a.price,
          change_24h: a.change24h,
          sma_25: a.sma25,
          sma_75: a.sma75,
          rsi: a.rsi,
          signal: a.signal,
          signal_score: typeof a.signalScore === 'number' ? a.signalScore : 0,
          macd_histogram: typeof a.macd?.histogram === 'number' ? a.macd.histogram : 0,
          bb_position: a.bbPosition || 'NORMAL',
        }))
        const { error } = await supabase.from('analysis_results').insert(rows)
        if (error) {
          console.error('Supabase insert error:', error.message)
          saveError = error.message
        } else {
          saveSuccess = true
        }
      } catch (err: any) {
        saveError = err.message
      }
    }

    return NextResponse.json({
      success: true,
      data: analysis,
      saveSuccess,
      saveError,
      updatedAt: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Analysis failed'
    console.error('Analysis API Error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
