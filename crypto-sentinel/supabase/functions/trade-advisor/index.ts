// 🤖 Trade Advisor - Supabase Edge Function (v1.1 - Doyle & News Integration)
// 役割: Doyle 理論 (S&D / 200 EMA) とニュース属性を統合した最終判断。

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { 
  calcRSI, 
  calcMACD, 
  calcBB, 
  calcEMA200,
  findSDZones,
  checkRejection,
  getBBPosition, 
  calculateCompositeScore,
  getSignalFromScore,
  OHLCV
} from '@shared/engine.ts'

const BINANCE_URL = 'https://api.binance.com/api/v3'
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT']

// --- 市場データ分析 (v1.1 Doyle 仕様) ---
function analyzeMarket(klines: any[]) {
  const candles: OHLCV[] = klines.map(k => ({
    timestamp: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5])
  }))
  
  const prices = candles.map(c => c.close)
  const current = candles[candles.length - 1]
  
  const rsi = calcRSI(prices)
  const macd = calcMACD(prices)
  const bb = calcBB(prices)
  const sma200 = calcEMA200(prices)
  const bbPosition = getBBPosition(current.close, bb)
  
  const score = calculateCompositeScore({
    rsi,
    macd,
    bbPosition,
    sma25: 0, // 以前のSMA25は廃止しEMA200へ
    sma200: sma200,
    price: current.close
  })

  // S&D ゾーンとヒゲ反発のチェック
  const zones = findSDZones(candles)
  const rejection = zones.find(z => z.isFresh && checkRejection(current, z))
  
  const signalInfo = getSignalFromScore(score)
  
  return { 
    rsi, score, 
    trend: current.close >= sma200 ? 'BULLISH' : 'BEARISH', 
    signalInfo, 
    rejection: rejection ? { type: rejection.type } : null 
  }
}

// --- ニュースセンチメント取得 (CryptoPanic 連携) ---
async function fetchNewsSentiment(symbol: str) {
  // 本来は CryptoPanic API 等を叩くが、現在はモックとして実装
  // 実装予定: const res = await fetch(`https://cryptopanic.com/api/v1/posts/?auth_token=${TOKEN}&currencies=${symbol}`);
  
  const coin = symbol.replace('USDT', '')
  return {
    sentimentScore: 7, // 1~10 の強気度
    hotNews: `${coin} の機関投資家による買い増しが報道されています。`
  }
}

// --- AIエージェントへの相談 (v1.1 ドラフト) ---
async function consultAIAgent(apiKey: string, data: any) {
  const prompt = `
あなたは QUANT SENTINEL の戦略ディレクターです。
以下の複合データに基づき、今エントリーすべきか「最後の下し」を行ってください。

【価格構造: ${data.symbol}】
- 価格: $${data.price} (EMA 200 に対して ${data.trend})
- テクニカルスコア: ${data.score} / 100
- 特別シグナル: ${data.rejection ? `${data.rejection.type} ゾーンでの反発を確認` : '特になし'}

【ニュース知能】
- 市場センチメント: ${data.news.sentimentScore}/10 (1:恐怖 〜 10:強気)
- 要約: ${data.news.hotNews}

【あなたの任務】
Doyle 理論（構造的な反発とトレンドの一致）を最重視し、ニュースの裏付けがある場合のみ "DECISION: BUY" としてください。
疑わしい場合や、ニュースが弱気なのにテクニカルが買いを示している場合は慎重に "DECISION: WAIT" としてください。

回答は JSON で出力： { "decision": "BUY" | "WAIT", "reasoning": "..." }
`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    }),
  })

  if (!res.ok) throw new Error('AI API Error')
  const json = await res.json()
  return JSON.parse(json.choices[0].message.content)
}

Deno.serve(async (_req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const aiApiKey = Deno.env.get('AI_API_KEY')
  if (!aiApiKey) return new Response('Unauthorized', { status: 401 })

  const results = []

  for (const symbol of SYMBOLS) {
    try {
      const res = await fetch(`${BINANCE_URL}/klines?symbol=${symbol}&interval=1h&limit=500`)
      const klines = await res.json()
      
      const analysis = analyzeMarket(klines)
      const news = await fetchNewsSentiment(symbol)
      
      const price = parseFloat(klines[klines.length - 1][4])

      if (analysis.score >= 25 || analysis.rejection) {
        const aiResponse = await consultAIAgent(aiApiKey, {
          symbol, price, trend: analysis.trend, score: analysis.score, 
          rejection: analysis.rejection, news
        })

        if (aiResponse.decision === 'BUY') {
          await supabase.from('trades').insert({
            symbol: symbol.replace('USDT', ''),
            direction: 'BUY',
            entry_price: price,
            amount_jpy: 200000,
            status: 'PENDING',
            is_ai_recommended: true,
            ai_reasoning: aiResponse.reasoning,
            recommended_score: analysis.score
          })
          results.push({ symbol, recommended: true, reasoning: aiResponse.reasoning })
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  return new Response(JSON.stringify({ success: true, results }), { status: 200 })
})
