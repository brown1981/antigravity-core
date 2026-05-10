-- ==========================================
-- 🏢 Engawa Cycle - AI Company Core v3
-- 20260408_engawacycle_core_v3.sql
-- ==========================================

-- 1. 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 組織管理（将来の販売・テナント分離用）
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. エージェント情報の更新用（既存のagentsテーブルがあれば拡張、なければ作成）
-- 既にschema_v2.sqlである程度定義されているが、organization_idを追加
ALTER TABLE IF EXISTS public.agents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE IF EXISTS public.agents ADD COLUMN IF NOT EXISTS role_description TEXT;
ALTER TABLE IF EXISTS public.agents ADD COLUMN IF NOT EXISTS agent_prompt TEXT;

-- 4. 意思決定・承認キュー（Human-in-the-Loop）
CREATE TABLE IF NOT EXISTS public.agent_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    agent_id TEXT NOT NULL, -- 提案したエージェント
    agent_role TEXT NOT NULL, -- e.g., 'ceo'
    title TEXT NOT NULL,
    proposal_content TEXT NOT NULL,
    proposed_action JSONB, -- 実行予定の具体的なパラメータ (e.g., { "action": "buy", "amount": 0.1 })
    status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'executed'
    user_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    executed_at TIMESTAMPTZ
);

-- 5. 市場洞察・ナレッジベース（pgvector活用）
CREATE TABLE IF NOT EXISTS public.market_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    content TEXT NOT NULL,
    source TEXT, -- 'sbi_vc' | 'binance' | 'news_api'
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536), -- OpenAI Embeddings (ada-002 / text-embedding-3-small) 用
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 監査ログ
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. セキュリティ (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 全てのアカウントで閲覧可能（サンプル・基本設定など）
-- ※ 本番では organization_id に基づく厳格な制限が必要ですが、まずは開発を優先
CREATE POLICY "Allow full access for authenticated users" ON public.organizations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON public.agent_proposals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON public.market_insights FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');

-- 8. リアルタイム配信設定
-- 既存の publication があれば一度削除して追加
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
    agents, agent_proposals, market_insights, organizations;

-- 9. デフォルト組織の作成（開発用）
-- 一つだけデフォルトの組織を追加しておく
INSERT INTO public.organizations (name) VALUES ('engawacycle_hq') ON CONFLICT DO NOTHING;
