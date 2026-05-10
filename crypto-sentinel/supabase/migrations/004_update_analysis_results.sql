-- 🛰️ Crypto Sentinel: Phase 3 Database Update
-- analysis_results テーブルにスコア保存用のカラムを追加します
-- Supabase SQL Editorで実行してください

ALTER TABLE analysis_results 
ADD COLUMN IF NOT EXISTS signal_score NUMERIC(5, 2),  -- -100 to 100
ADD COLUMN IF NOT EXISTS macd_histogram NUMERIC(20, 8),
ADD COLUMN IF NOT EXISTS bb_position TEXT;

-- コメントの追加
COMMENT ON COLUMN analysis_results.signal_score IS '総合判定スコア (-100 〜 100)';
COMMENT ON COLUMN analysis_results.macd_histogram IS 'MACDヒストグラムの値';
COMMENT ON COLUMN analysis_results.bb_position IS 'ボリンジャーバンド位置 (UPPER, LOWER, MIDDLE, NORMAL)';
