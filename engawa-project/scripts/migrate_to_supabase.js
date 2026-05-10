const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// プロジェクト設定 (AI_Agent 専用)
const supabaseUrl = 'https://axjcnlrhtrwwfsfacqcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_jRs_ThZGxgpSCzXzlZQxhw_8nG6WB92';
const PROJECT_ROOT = '/Users/ooshirokazuki/.gemini/antigravity/scratch/engawa-project';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateData() {
    console.log('--- Migration Started ---');

    try {
        // 1. Agents の移行
        const statusData = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'agents/status.json'), 'utf8'));
        
        for (const agent of statusData.agents) {
            console.log(`Processing Agent: ${agent.name}...`);
            
            // プロンプトファイルを読み込み
            let promptContent = '';
            const promptPath = path.join(PROJECT_ROOT, `agents/${agent.id}_prompt.md`);
            if (fs.existsSync(promptPath)) {
                promptContent = fs.readFileSync(promptPath, 'utf8');
            }

            const { error: agentError } = await supabase
                .from('agents')
                .upsert({
                    id: agent.id,
                    name: agent.name,
                    role: agent.role,
                    status: agent.status,
                    last_active: agent.lastActive,
                    model: agent.model,
                    current_task: agent.currentTask,
                    prompt: promptContent
                });

            if (agentError) {
                console.error(`Error migrating agent ${agent.id}:`, agentError);
            }
        }

        // 2. KPIs の移行
        console.log('Migrating KPIs...');
        const kpis = statusData.kpis;
        const kpiEntries = [
            { id: 'dscr', label: 'DSCR', value: kpis.dscr.value, target: kpis.dscr.target, trend: kpis.dscr.trend, unit: 'x' },
            { id: 'cash_flow', label: 'Cash Flow', value: kpis.cashFlow.value, target: kpis.cashFlow.target, trend: kpis.cashFlow.trend, unit: 'JPY' },
            { id: 'efficiency', label: 'Efficiency', value: kpis.efficiency.value, target: kpis.efficiency.target, trend: kpis.efficiency.trend, unit: '%' }
        ];

        for (const kpi of kpiEntries) {
            const { error: kpiError } = await supabase.from('kpis').upsert(kpi);
            if (kpiError) console.error(`Error migrating KPI ${kpi.id}:`, kpiError);
        }

        // 3. Discussion Log の移行
        console.log('Migrating Discussion Log...');
        const discussionData = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'agents/discussion.json'), 'utf8'));
        
        // メッセージ量が多い可能性があるため、最新の50件などに絞るか、一括で
        const messages = discussionData.messages.map(m => ({
            agent_id: m.agentId,
            agent_name: m.agentName,
            message: m.message,
            timestamp: m.timestamp
        }));

        const { error: msgError } = await supabase.from('messages').insert(messages);
        if (msgError) console.error('Error migrating messages:', msgError);

        console.log('--- Migration Completed Successfully! ---');

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateData();
