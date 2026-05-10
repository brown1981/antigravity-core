-- ==========================================
-- 🏗️ Engawa Cycle - Seed Data (Phase 4 Final - Fixed)
-- ==========================================

-- 1. 組織マスターデータの登録
-- Fix: Remove non-existent 'type' column
INSERT INTO public.organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'Engawa Cycle Corp')
ON CONFLICT (id) DO NOTHING;

-- 2. エージェントのマスターデータ登録
INSERT INTO public.agents (id, name, role, status, model, current_task)
VALUES 
    ('commander', '👑 Commander', 'Human', 'active', 'Human-in-the-Loop', 'Overseeing operations'),
    ('ceo', 'Hiroshi', 'CEO', 'active', 'gpt-4o', 'Strategic decision making'),
    ('coo', 'Elena', 'COO', 'active', 'gpt-4o', 'Operational oversight'),
    ('analyst', 'Sato', 'Analyst', 'active', 'gpt-4o', 'Market data analysis'),
    ('cfo', 'Tanaka', 'CFO', 'active', 'gpt-4o', 'Financial risk management')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- 2. KPIの初期値
INSERT INTO public.kpis (id, label, value, target, unit, trend, color)
VALUES 
    ('dscr', 'DSCR', 1.2, 1.5, 'x', 'neutral', 'accent'),
    ('cash_flow', 'Revenue', 500000, 1000000, 'JPY', 'up', 'success'),
    ('efficiency', 'Efficiency', 85, 95, '%', 'neutral', 'warning')
ON CONFLICT (id) DO NOTHING;

-- 3. システム設定の初期化
INSERT INTO public.system_config (id, config_data)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
