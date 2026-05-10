"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AgentStatus } from '../components/AgentStatusCard';
import { MiningService } from '../services/mining_service';

// ------------------------------------------------------------------
// 🛠️ 型定義の基本（Types Hardening）
// ------------------------------------------------------------------

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  lastActive: string;
  model: string;
  currentTask: string;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: string;
}

export interface KPI {
  value: number;
  target: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface MiningStats {
  hashrate: number;
  payout_24h: number;
  total_payout: number;
  efficiency: number;
}

export interface AgentProposal {
  id: string;
  agent_id: string;
  agent_role: string;
  title: string;
  proposal_content: string;
  proposed_action: any;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  created_at: string;
}

export interface DashboardData {
  agents: Agent[];
  discussion: ChatMessage[];
  proposals: AgentProposal[];
  kpis: {
    dscr: KPI;
    cashFlow: KPI;
    efficiency: KPI;
    hashrate: KPI; // 追加
  };
  miningStats: MiningStats; // 追加
  serverTime: string;
}

// ------------------------------------------------------------------
// 📡 カスタムフック：useDashboard
// ------------------------------------------------------------------

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 全件取得（初期化・リリロード用）
  const fetchAll = useCallback(async () => {
    try {
      // 並列実行で効率化（基本の最適化）
      const [agentsRes, kpisRes, messagesRes, proposalsRes, miningStats] = await Promise.all([
        supabase.from('agents').select('*').order('id', { ascending: true }),
        supabase.from('kpis').select('*'),
        supabase.from('messages').select('*').order('timestamp', { ascending: false }).limit(50),
        supabase.from('agent_proposals').select('*').order('created_at', { ascending: false }).limit(10),
        MiningService.getLatestStats()
      ]);

      if (agentsRes.error) throw agentsRes.error;
      if (kpisRes.error) throw kpisRes.error;
      if (messagesRes.error) throw messagesRes.error;
      if (proposalsRes.error) throw proposalsRes.error;

      const kpiMap = (kpisRes.data || []).reduce((acc: any, kpi: any) => {
        acc[kpi.id] = {
          value: Number(kpi.value),
          target: Number(kpi.target),
          trend: kpi.trend as 'up' | 'down' | 'neutral'
        };
        return acc;
      }, {});

      setData({
        agents: agentsRes.data as Agent[],
        discussion: (messagesRes.data || []).reverse() as ChatMessage[],
        proposals: proposalsRes.data as AgentProposal[],
        kpis: {
          dscr: kpiMap.dscr || { value: 0, target: 1, trend: 'neutral' },
          cashFlow: kpiMap.cash_flow || { value: 0, target: 1, trend: 'neutral' },
          efficiency: kpiMap.efficiency || { value: 0, target: 1, trend: 'neutral' },
          hashrate: { value: miningStats.hashrate, target: 150, trend: 'neutral' }
        },
        miningStats: miningStats,
        serverTime: new Date().toISOString()
      });
      setError(null);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(err.message || 'Connection lost...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    // ------------------------------------------------------------------
    // ✨ スマート・リアルタイム同期（Incremental Updates）
    // ------------------------------------------------------------------
    const channel = supabase
      .channel('dashboard-realtime')
      // エージェントのステータス更新
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'agents' }, (payload) => {
        setData(prev => {
          if (!prev) return prev;
          const updatedAgents = prev.agents.map(a => 
            a.id === payload.new.id ? { ...a, ...payload.new } : a
          );
          return { ...prev, agents: updatedAgents };
        });
      })
      // KPI の数値更新
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kpis' }, (payload) => {
        setData(prev => {
          if (!prev) return prev;
          const id = payload.new.id;
          const key = id === 'cash_flow' ? 'cashFlow' : id as keyof typeof prev.kpis;
          if (prev.kpis[key]) {
            return {
              ...prev,
              kpis: {
                ...prev.kpis,
                [key]: {
                  ...prev.kpis[key],
                  value: Number(payload.new.value),
                  target: Number(payload.new.target),
                  trend: payload.new.trend
                }
              }
            };
          }
          return prev;
        });
      })
      // 新着メッセージ
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setData(prev => {
          if (!prev) return prev;
          const newMsg = payload.new as ChatMessage;
          if (prev.discussion.some(m => m.id === newMsg.id)) return prev;
          return {
            ...prev,
            discussion: [...prev.discussion, newMsg].slice(-50)
          };
        });
      })
      // 提案の更新（新規追加・ステータス変更）
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_proposals' }, (payload) => {
        setData(prev => {
          if (!prev) return prev;
          if (payload.eventType === 'INSERT') {
            const newProp = payload.new as AgentProposal;
            if (prev.proposals.some(p => p.id === newProp.id)) return prev;
            return { ...prev, proposals: [newProp, ...prev.proposals].slice(0, 10) };
          }
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as AgentProposal;
            return {
              ...prev,
              proposals: prev.proposals.map(p => p.id === updated.id ? updated : p)
            };
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  return { data, loading, error, refresh: fetchAll };
}
