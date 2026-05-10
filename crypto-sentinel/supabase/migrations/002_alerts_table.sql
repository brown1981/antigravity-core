-- 🔔 Crypto Sentinel: アラート管理テーブル

-- アラート履歴テーブル（重複送信防止）
CREATE TABLE IF NOT EXISTS alert_logs (
  id          BIGSERIAL PRIMARY KEY,
  symbol      TEXT NOT NULL,           -- 'BTC', 'ETH', 'XRP'
  alert_type  TEXT NOT NULL,           -- 'RSI_OVERSOLD' | 'MACD_CROSS' | 'STRONG_BUY'
  rsi         NUMERIC(6, 4),
  signal      TEXT,
  score       INTEGER,
  price       NUMERIC(20, 8),
  sent_at     TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス（重複チェック用）
CREATE INDEX IF NOT EXISTS alert_logs_symbol_sent_idx ON alert_logs(symbol, sent_at DESC);

-- RLS設定
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on alert_logs"
  ON alert_logs FOR ALL
  USING (true)
  WITH CHECK (true);
