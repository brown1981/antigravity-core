import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { AGENT_CONFIGS, AgentRole } from "./agents.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    const { role, message, organization_id, session_id } = await req.json()
    const config = AGENT_CONFIGS[role as AgentRole]

    if (!config) {
      throw new Error(`Unknown agent role: ${role}`)
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    let aiMessage = ""

    // 🔍 Simulation Mode: APIキーが未設定の場合は高品質なダミー回答を使用
    if (!openaiKey || openaiKey.startsWith('sk-xxxx')) {
      console.log("⚠️ [Simulation Mode] No valid API key found. Providing simulated response...");
      aiMessage = `
【市場分析報告：BTC】
現在の市場価格は 9,200,000 JPY 付近で安定しています。24時間騰落率は +1.2% と堅調です。
テクニカル指標では、RSIが55と中立であり、短期的な上昇トレンドの継続が示唆されています。

提案：
現在のボラティリティの低さを考慮し、ロングポジションの一部（15%）を利確し、
次の押し目（8,800,000 JPY付近）での買い増し指値を設定することを推奨します。
`;
    } else {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${openaiKey}` 
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: config.systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
        }),
      })
      const data = await response.json()
      aiMessage = data.choices[0].message.content
    }

    // 1. 提案（Proposals）の自動生成ロジック
    let proposal_id = null
    const target_org_id = organization_id || '00000000-0000-0000-0000-000000000000'

    const { data: proposal, error: pError } = await supabaseClient
      .from('agent_proposals')
      .insert({
        organization_id: target_org_id,
        agent_id: role,
        agent_role: role,
        title: `${config.name} からの提案`,
        proposal_content: aiMessage,
        status: 'pending'
      })
      .select()
      .single()
    
    if (!pError) proposal_id = proposal.id
    else console.error("❌ Proposal Insert Error:", pError.message)

    // 2. ログの記録
    await supabaseClient.from('audit_logs').insert({
      organization_id: target_org_id,
      actor_id: role,
      action: 'agent_response',
      details: { message, response: aiMessage, proposal_id, session_id }
    })

    // 3. メッセージテーブルへの保存（これでダッシュボードに反映される）
    await supabaseClient.from('messages').insert({
      agent_id: role,
      agent_name: config.name,
      message: aiMessage,
      metadata: { session_id, role, avatar: '🤖' }
    })

    return new Response(
      JSON.stringify({ 
        agentName: config.name,
        message: aiMessage,
        proposal_id: proposal_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("❌ Edge Function Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
