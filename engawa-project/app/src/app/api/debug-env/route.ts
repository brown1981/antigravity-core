import { NextResponse } from 'next/server';

/**
 * 🔍 診断用エンドポイント
 * 本番環境での環境変数の解決状態を、安全な範囲で可視化します。
 */
export async function GET() {
  const envInfo = {
    // 解決されたURL（重要：127.0.0.1 が混入していないか確認）
    resolved_supabase_url: (globalThis as any).SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    
    // ソースごとの生の値（機密情報は除く）
    source_global: !!(globalThis as any).SUPABASE_URL,
    source_process: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    
    // システムメタデータ
    runtime: 'Cloudflare Worker (OpenNext)',
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(envInfo);
}
