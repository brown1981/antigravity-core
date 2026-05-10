-- 📒 Phase 3: 取引記録テーブル（勝率・損益トラッキング）

CREATE TABLE IF NOT EXISTS trades (
  id          BIGSERIAL PRIMARY KEY,
  symbol      TEXT NOT NULL,                    -- 'BTC', 'ETH', 'XRP'
  exchange    TEXT NOT NULL DEFAULT 'Binance',  -- 'Binance' | 'SBI VC'
  direction   TEXT NOT NULL,                    -- 'BUY' | 'SELL'
  entry_price NUMERIC(20, 8) NOT NULL,          -- エントリー価格
  exit_price  NUMERIC(20, 8),                   -- 決済価格（決済前はNULL）
  amount_jpy  INTEGER NOT NULL DEFAULT 200000,  -- 投資額（円）
  entry_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exit_at     TIMESTAMPTZ,
  pnl_pct     NUMERIC(10, 4),                   -- 損益率（%）
  pnl_jpy     INTEGER,                          -- 損益額（円）
  status      TEXT NOT NULL DEFAULT 'OPEN',     -- 'OPEN' | 'WIN' | 'LOSS'
  memo        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS trades_symbol_idx ON trades(symbol);
CREATE INDEX IF NOT EXISTS trades_status_idx ON trades(status);
CREATE INDEX IF NOT EXISTS trades_entry_at_idx ON trades(entry_at DESC);

-- RLS設定
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access on trades"
  ON trades FOR ALL
  USING (true)
  WITH CHECK (true);
