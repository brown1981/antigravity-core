import React from 'react';
import { Check, X, AlertCircle, Clock } from 'lucide-react';
import { AgentProposal } from '../hooks/useDashboard';
import { supabase } from '@/lib/supabase';

interface ApprovalQueueProps {
  proposals: AgentProposal[];
  onActionComplete?: () => void;
}

export default function ApprovalQueue({ proposals, onActionComplete }: ApprovalQueueProps) {
  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('agent_proposals')
        .update({ 
          status, 
          executed_at: status === 'approved' ? new Date().toISOString() : null 
        })
        .eq('id', id);

      if (error) throw error;
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Failed to update proposal:', err);
      alert('操作に失敗しました。');
    }
  };

  const pendingProposals = proposals.filter(p => p.status === 'pending');

  if (pendingProposals.length === 0) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 text-center backdrop-blur-xl">
        <Clock className="mx-auto text-zinc-600 mb-3" size={32} />
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
          現在、承認待ちの提案はありません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
        <AlertCircle size={14} className="text-amber-500" />
        承認待ちの意思決定 ({pendingProposals.length})
      </h3>
      
      <div className="grid gap-4">
        {pendingProposals.map((proposal) => (
          <div 
            key={proposal.id} 
            className="group bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 rounded-3xl p-6 transition-all backdrop-blur-xl shadow-xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                    {proposal.agent_role}
                  </span>
                  <span className="text-[8px] text-zinc-600 font-mono">
                    {new Date(proposal.created_at).toLocaleString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">{proposal.title}</h4>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(proposal.id, 'rejected')}
                  className="p-2.5 bg-zinc-800 hover:bg-red-900/20 text-zinc-500 hover:text-red-500 rounded-2xl transition-all border border-zinc-700/50"
                  title="却下"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={() => handleAction(proposal.id, 'approved')}
                  className="p-2.5 bg-zinc-800 hover:bg-green-900/20 text-zinc-500 hover:text-green-500 rounded-2xl transition-all border border-zinc-700/50"
                  title="承認・実行"
                >
                  <Check size={18} />
                </button>
              </div>
            </div>
            
            <div className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap font-medium">
              {proposal.proposal_content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
