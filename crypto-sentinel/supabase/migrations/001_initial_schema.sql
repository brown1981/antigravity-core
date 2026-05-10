-- 🛰️ Crypto Sentinel: Phase 1 Database Schema
-- Supabase SQL Editorで実行してください

-- 分析結果の保存テーブル
CREATE TABLE IF NOT EXISTS analysis_results (
  id          BIGSERIAL PRIMARY KEY,
  symbol      TEXT NOT NULL,           -- 'BTC', 'ETH'
  name        TEXT NOT NULL,           -- 'Bitcoin', 'Ethereum'
  price       NUMERIC(20, 8) NOT NULL, -- 現在価格
  change_24h  NUMERIC(10, 4),          -- 24時間変動率(%)
  sma_25      NUMERIC(20, 8),          -- SMA 25日
  sma_75      NUMERIC(20, 8),          -- SMA 75日
  rsi         NUMERIC(6, 4),           -- RSI (0-100)
  signal      TEXT NOT NULL,           -- 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス（高速検索用）
CREATE INDEX IF NOT EXISTS analysis_results_symbol_idx ON analysis_results(symbol);
CREATE INDEX IF NOT EXISTS analysis_results_created_at_idx ON analysis_results(created_at DESC);

-- RLS設定（認証なしのMVPではpublic読み取りのみ許可）
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON analysis_results FOR SELECT
  USING (true);

-- 書き込みはサービスロールキーのみ（APIから）
CREATE POLICY "Service role write access"
  ON analysis_results FOR INSERT
  WITH CHECK (true);
