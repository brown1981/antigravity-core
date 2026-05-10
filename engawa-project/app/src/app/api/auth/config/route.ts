import { NextResponse } from 'next/server';

/**
 * 🛰️ Auth Dynamic Config API
 * クライアントサイド（ブラウザ）に対して、正しい Supabase 接続情報を動的に提供します。
 * これにより、ビルド時の環境変数（localhost等）の混入を完全に回避します。
 */
export async function GET() {
  const config = {
    // サーバーサイド（Cloudflare Worker）で解決された本番URLとAnonKeyを返却
    supabaseUrl: (globalThis as any).SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: (globalThis as any).SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    runtime: 'production-dynamic'
  };

  return NextResponse.json(config);
}
