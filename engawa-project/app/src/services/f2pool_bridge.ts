/**
 * 📈 Engawa Cycle: F2Pool Data Bridge (Native Implementation)
 * 
 * 外部ライブラリを使わず、Node.js 標準の fetch API のみで
 * マイニングデータをリアルタイムに取得します。
 */

export interface F2PoolStats {
  hashrate: number;
  value_24h: number;
  total_paid: number;
  status: string;
}

export class F2PoolBridge {
  private static API_BASE = 'https://api.f2pool.com';

  /**
   * 指定したユーザーと通貨の統計情報を取得する
   * @param currency 'bitcoin' | 'aleo' 等
   * @param account F2Pool ユーザー名
   * @param secret F2P-API-SECRET リードオンリーAPIキー (任意)
   */
  static async fetchStats(currency: string, account: string, secret?: string): Promise<F2PoolStats> {
    // V2 API Endpoint (Preferred)
    const v2Url = `${this.API_BASE}/v2/hash_rate/info`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    if (secret) {
      headers['F2P-API-SECRET'] = secret;
      console.log(`📡 Bridge: Attempting F2Pool V2 for ${account} (${currency})...`);
      
      try {
        const response = await fetch(v2Url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ user_name: account, currency })
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data.code === 0 || !data.code) {
            console.log(`✅ Bridge: Successfully fetched V2 data for ${account}`);
            return {
              hashrate: data.hash_rate || data.hashrate || 0,
              value_24h: data.value_24h || 0,
              total_paid: data.total_paid || 0,
              status: 'active'
            };
          }
          throw new Error(`F2Pool V2 API Error Code: ${data.code} - ${data.msg}`);
        }
        console.warn(`⚠️ Bridge: V2 returned ${response.status}. Falling back to V1 or failing.`);
      } catch (error) {
        console.error(`❌ Bridge: V2 fetch failed:`, error);
      }
    } else {
      console.warn(`⚠️ Bridge: No API secret provided. F2Pool V2 requires a secret. Attempting legacy V1 public access...`);
    }

    // Legacy V1 Fallback (or Public access if still available for some coins)
    const slugs = currency === 'bitcoin' ? ['bitcoin', 'btc'] : [currency];
    let lastError: any = null;

    for (const slug of slugs) {
      const url = `${this.API_BASE}/${slug}/${account}`;
      console.log(`📡 Bridge: Trying legacy V1 fetch from ${url}...`);

      try {
        const response = await fetch(url);
        
        if (response.ok) {
          const data: any = await response.json();
          if (data.error) throw new Error(`F2Pool V1 JSON Error: ${data.error.message}`);
          
          console.log(`✅ Bridge: Successfully fetched legacy data for ${slug}`);
          return {
            hashrate: data.hashrate || 0,
            value_24h: data.value_24h || 0,
            total_paid: data.total_paid || 0,
            status: data.status || 'unknown'
          };
        }
        
        const errorText = await response.text();
        const is404 = response.status === 404;
        lastError = new Error(`F2Pool V1 Error: ${response.status}${is404 ? ' (Path Deprecated or Account Not Found)' : ''}`);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('All data fetch attempts failed');
  }

  /**
   * 公証用のサマリーデータを生成
   */
  static formatForNotary(stats: F2PoolStats): string {
    return `[FACT] HR:${stats.hashrate} | 24H:${stats.value_24h} | Paid:${stats.total_paid}`;
  }
}
