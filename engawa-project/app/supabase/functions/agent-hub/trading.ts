export interface MarketPrice {
  symbol: string;
  price: number;
  change_24h: number;
  timestamp: string;
}

/**
 * SBI VCトレードの取引データを取得するモジュール（モック版）
 */
export async function getSbiVcMarketData(symbol: string): Promise<MarketPrice> {
  // 本来は fetch('https://api.sbivc.co.jp/v1/ticker?symbol=' + symbol) などを実行
  // 現時点ではモックデータを返す
  const mockPrices: Record<string, number> = {
    'BTC': 11200000,
    'ETH': 550000,
    'XRP': 95,
    'ZEC': 4500,
    'ALEO': 280,
  };

  const price = mockPrices[symbol] || 0;
  
  return {
    symbol,
    price,
    change_24h: (Math.random() * 10) - 5, // -5% ~ +5% のランダム
    timestamp: new Date().toISOString()
  };
}

/**
 * 過去の売買履歴を取得する（モック版）
 */
export async function getTradeHistory(limit: number = 5) {
  return [
    { id: 1, symbol: 'BTC', side: 'buy', price: 9800000, amount: 0.01, date: '2026-03-25' },
    { id: 2, symbol: 'ETH', side: 'sell', price: 610000, amount: 0.1, date: '2026-03-28' },
    { id: 3, symbol: 'ALEO', side: 'buy', price: 250, amount: 100, date: '2026-04-01' },
  ].slice(0, limit);
}
