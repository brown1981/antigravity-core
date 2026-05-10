import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const revalidate = 0

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTC'
  const days = parseInt(searchParams.get('days') || '7')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('analysis_results')
    .select('symbol, price, rsi, signal, signal_score, created_at')
    .eq('symbol', symbol)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data || [] })
}
