export default {
  async fetch(request, env, ctx) {
    // ターゲットURL: 取得したい市場データ
    const targetUrl = 'https://cryptobubbles.net/backend/data/bubbles1000.usd.json';
    
    // CORSヘッダーの設定（すべてのアクセスを許可）
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      // Cloudflareのキャッシュを利用してターゲットサーバーへの負荷を軽減
      'Cache-Control': 'public, max-age=60' 
    };

    // プレフライトリクエスト（OPTIONS）への対応
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ターゲットAPIからのデータ取得
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Antigravity-Nexus-Core/1.0',
          'Accept': 'application/json'
        }
      });
      
      // データの取り出し
      const data = await response.json();
      
      // CORSヘッダーを付与してアプリ（App 07など）に返却
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
      
    } catch (error) {
      // エラー時の処理
      return new Response(JSON.stringify({ error: 'Failed to fetch market data', details: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  },
};
