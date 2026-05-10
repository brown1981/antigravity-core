/**
 * 🛰️ Engawa Cycle: Broadcast Engine V2
 *
 * 「フィルター・ゼロ」の精神を守る3モード自律ブロードキャストエンジン。
 * 言葉の解釈・加工はゼロ。モードの決定のみをここで行う。
 *
 * Mode 1「新聞報告」： タイマー起動 → 前日データを全員に配布
 * Mode 2「競争入札」： 司令官指示 → 全員ブロードキャスト（指名なし）
 * Mode 3「緊急召集」： KPIアラート → CEOが議長として緊急召集
 */

export type BroadcastMode = 'report' | 'bid' | 'emergency';

export interface BroadcastRequest {
  mode: BroadcastMode;
  message: string;
  agentId?: string; // @指名がある場合のみ
  sessionId: string;
}

export interface BroadcastResult {
  success: boolean;
  count: number;
  mode: BroadcastMode;
  responses: Array<{
    agentId: string;
    agentName: string;
    avatar: string;
    message: string;
  }>;
  error?: string;
}

export class BroadcastEngine {
  /**
   * モードを自動判定する（言語処理ゼロ・イベント種別のみで決定する）
   *
   * - @agentId で始まる指示 → bid モードで1人に指名
   * - kpi_alert フラグあり  → emergency モード
   * - スケジュール起動      → report モード
   * - その他              → bid モード（全員ブロードキャスト）
   */
  static detectMode(input: {
    message: string;
    isScheduled?: boolean;
    isKpiAlert?: boolean;
  }): { mode: BroadcastMode; agentId?: string } {
    if (input.isKpiAlert) {
      return { mode: 'emergency' };
    }

    if (input.isScheduled) {
      return { mode: 'report' };
    }

    // @メンション指名の検出（言葉の意味解釈ではなく記号検出のみ）
    const mentionMatch = input.message.match(/^@(ceo|cfo|cto|cmo|coo)\s/i);
    if (mentionMatch) {
      const agentId = mentionMatch[1].toLowerCase();
      // @メンション部分を除いた本文のみをエージェントに届ける
      const cleanMessage = input.message.replace(/^@\w+\s/, '');
      return { mode: 'bid', agentId };
    }

    // デフォルト：全員ブロードキャスト
    return { mode: 'bid' };
  }

  /**
   * ブロードキャストを実行する（/api/chat Edge Functionへのクライアント呼び出し）
   */
  static async broadcast(request: BroadcastRequest): Promise<BroadcastResult> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      // Edge Function のベースURL
      const functionUrl = `${supabaseUrl}/functions/v1/agent-hub`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          role: request.agentId || 'ceo', // デフォルトはCEO
          message: request.message,
          organization_id: '00000000-0000-0000-0000-000000000000',
          session_id: request.sessionId
        }),
      });

      if (!response.ok) {
        // フォールバック: ローカル開発中などで /api/chat が未起動の場合のメッセージ
        if (response.status === 404) {
          return {
            success: false,
            count: 0,
            mode: request.mode,
            responses: [],
            error: 'API endpoint not found. Deployment might be in progress.'
          };
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Edge Function のレスポンス形式をフロントエンドの期待する形式に変換
      const agentsResponse = {
        agentId: data.agentName?.toLowerCase() || 'agent',
        agentName: data.agentName || 'Agent',
        avatar: '🤖',
        message: data.message || 'No response from agent'
      };

      return {
        success: true,
        count: 1,
        mode: request.mode,
        responses: [agentsResponse],
      };
    } catch (err: any) {
      console.error('❌ BroadcastEngine error:', err);
      return {
        success: false,
        count: 0,
        mode: request.mode,
        responses: [],
        error: err.message,
      };
    }
  }
}
