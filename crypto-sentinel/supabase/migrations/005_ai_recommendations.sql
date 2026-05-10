-- 📒 Phase 4: AI推奨データの保存用拡張
-- AIエージェントが提案したトレードを記録し、ユーザーの承認を待つためのカラムを追加します。

ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS is_ai_recommended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS recommended_score NUMERIC(5, 2);

-- ヒント: 
-- status = 'PENDING' は AI推奨後、人間が承認する前の状態。
-- status = 'REJECTED' は 人間が却下した状態。
-- status = 'OPEN' は 承認されてエントリーした状態。
