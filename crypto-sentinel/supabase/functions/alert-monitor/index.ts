// 🔔 Alert Monitor - Supabase Edge Function
// トリガー: Supabase Cron（毎時間自動実行）
// 役割: 分析実行 → 条件チェック → Resend でメール送信

import { createClient } from 'jsr:@supabase/supabase-js@2'

const BINANCE_URL = 'https://api.binance.com/api/v3'
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT']
const ALERT_COOLDOWN_HOURS = 4 // 同じコインへのアラート間隔

// --- 計算ユーティリティ ---
function calcEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const emas: number[] = [prices[0]]
  for (let i = 1; i < prices.length; i++) {
    emas.push(prices[i] * k + emas[i - 1] * (1 - k))
  }
  return emas
}

function calcRSI(prices: number[], period = 14): number {
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

function detectMACDCross(prices: number[]): { isBullishCross: boolean; macdLine: number; signal: number } {
  const ema12 = calcEMA(prices, 12)
  const ema26 = calcEMA(prices, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i])
  const signalLine = calcEMA(macdLine.slice(-30), 9)
  const macd = macdLine[macdLine.length - 1]
  const sig = signalLine[signalLine.length - 1]
  const prevMacd = macdLine[macdLine.length - 2]
  const prevSig = signalLine[signalLine.length - 2]
  return {
    isBullishCross: macd > sig && prevMacd <= prevSig,
    macdLine: macd,
    signal: sig,
  }
}

// --- メール送信 ---
async function sendAlertEmail(
  resendKey: string,
  toEmail: string,
  alerts: { symbol: string; type: string; rsi: number; price: number; score: number }[]
) {
  const alertRows = alerts.map(a => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #1e293b;font-weight:bold;color:#e2e8f0">${a.symbol}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#00d4aa">${a.type}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#94a3b8">RSI: ${a.rsi.toFixed(1)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#fbbf24">$${a.price.toLocaleString()}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#4ade80">スコア: ${a.score > 0 ? '+' : ''}${a.score}</td>
    </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#070d1a;color:#e2e8f0;font-family:monospace;padding:24px;margin:0">
  <div style="max-width:600px;margin:0 auto">
    <h1 style="color:#00d4aa;font-size:20px;margin-bottom:4px">🛡️ Crypto Sentinel アラート</h1>
    <p style="color:#475569;font-size:12px;margin-bottom:24px">${new Date().toLocaleString('ja-JP')}</p>
    
    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden;margin-bottom:20px">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#1e293b">
            <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:11px">コイン</th>
            <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:11px">アラート種別</th>
            <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:11px">RSI</th>
            <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:11px">現在価格</th>
            <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:11px">シグナルスコア</th>
          </tr>
        </thead>
        <tbody>${alertRows}</tbody>
      </table>
    </div>

    <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px">📋 スイングトレード戦略（確認用）</p>
      <ul style="margin:0;padding:0 0 0 16px;color:#64748b;font-size:12px;line-height:2">
        <li>元手: ¥400,000 | 1回投資額: ¥200,000</li>
        <li>利益目標: +2.5%（+5,000円） | 損切り: -1.5%</li>
        <li>スコア +25以上 = エントリー検討</li>
      </ul>
    </div>

    <a href="https://crypto-sentinel.do-the-carpe-diem.workers.dev" 
       style="display:block;text-align:center;background:#00d4aa;color:#000;padding:12px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
      📊 ダッシュボードを開く
    </a>
    
    <p style="color:#1e293b;font-size:10px;text-align:center;margin-top:16px">
      ※ 情報提供のみを目的としています。投資判断はご自身の責任で行ってください。
    </p>
  </div>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Crypto Sentinel <alerts@engawacycle.com>',
      to: [toEmail],
      subject: `🔔 Crypto Sentinel: ${alerts.map(a => a.symbol).join(', ')} にアラート発生`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
  return res.json()
}

// --- メインハンドラー ---
Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const alertEmail = Deno.env.get('ALERT_EMAIL')

  if (!resendKey || !alertEmail) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY or ALERT_EMAIL not configured' }), { status: 500 })
  }

  const triggeredAlerts: { symbol: string; type: string; rsi: number; price: number; score: number }[] = []

  for (const symbol of SYMBOLS) {
    try {
      // Binanceからデータ取得
      const [klinesRes, tickerRes] = await Promise.all([
        fetch(`${BINANCE_URL}/klines?symbol=${symbol}&interval=1d&limit=100`),
        fetch(`${BINANCE_URL}/ticker/24hr?symbol=${symbol}`),
      ])
      const klines = await klinesRes.json() as number[][]
      const ticker = await tickerRes.json() as { lastPrice: string }
      const closes = klines.map(k => parseFloat(k[4] as unknown as string))
      const price = parseFloat(ticker.lastPrice)

      const rsi = calcRSI(closes)
      const { isBullishCross } = detectMACDCross(closes)
      const displaySymbol = symbol.replace('USDT', '')

      // アラート条件チェック
      const isRSIOversold = rsi < 35
      const isMACDCross = isBullishCross

      if (!isRSIOversold && !isMACDCross) continue

      // 冷却期間チェック（4時間以内に同じコインのアラートを送信済みか）
      const cooldownTime = new Date(Date.now() - ALERT_COOLDOWN_HOURS * 60 * 60 * 1000).toISOString()
      const { data: recentAlerts } = await supabase
        .from('alert_logs')
        .select('id')
        .eq('symbol', displaySymbol)
        .gte('sent_at', cooldownTime)
        .limit(1)

      if (recentAlerts && recentAlerts.length > 0) continue // 冷却期間中はスキップ

      const alertType = isRSIOversold && isMACDCross
        ? '🔔 RSI売られすぎ + MACDクロス（強い買いシグナル）'
        : isRSIOversold ? '📉 RSI売られすぎ (< 35)'
        : '📈 MACDゴールデンクロス'

      // アラートログを記録
      await supabase.from('alert_logs').insert({
        symbol: displaySymbol,
        alert_type: alertType,
        rsi,
        signal: isMACDCross ? 'MACD_CROSS' : 'RSI_OVERSOLD',
        price,
      })

      triggeredAlerts.push({ symbol: displaySymbol, type: alertType, rsi, price, score: isRSIOversold ? 40 : 25 })
    } catch (e) {
      console.error(`Error checking ${symbol}:`, e)
    }
  }

  // アラートがあればメール送信
  if (triggeredAlerts.length > 0) {
    await sendAlertEmail(resendKey, alertEmail, triggeredAlerts)
    return new Response(JSON.stringify({ sent: true, alerts: triggeredAlerts }), { status: 200 })
  }

  return new Response(JSON.stringify({ sent: false, message: 'No alerts triggered' }), { status: 200 })
})
