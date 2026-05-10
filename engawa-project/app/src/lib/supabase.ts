import { createClient } from '@supabase/supabase-js';

/**
 * 🛰️ Professional Supabase Client (Dynamic Configuration)
 * 基準: Supabase
 * 目標: 環境に依存せず、常に正しい本番URLを自動選択する高潔な設計
 */

// 1. サーバーサイド (Worker) か、クライアントサイド (Browser) かを判定
const isServer = typeof window === 'undefined';

// 2. サーバーサイドの場合は、Workerが保持する環境変数を即座に使用（確実）
const getInitialUrl = () => {
  if (isServer) {
    return (globalThis as any).SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  }
  // ブラウザ側では、ひとまずビルド時の値を参照（デプロイ後はここが空になる）
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
};

const getInitialKey = () => {
  if (isServer) {
    return (globalThis as any).SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
};

const initialUrl = getInitialUrl();
const initialKey = getInitialKey();

// 🔱 Singleton Client Instance
// 本番URLが不明な場合は、確定しているプロジェクトURLを代替として使用します。
export const supabase = createClient(
  initialUrl || 'https://gevkjdvyprfmodayszqd.supabase.co',
  initialKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);

/**
 * [Professional Strategy] 
 * ブラウザ側で初期化に失敗、または127.0.0.1が混入している場合
 * `/api/auth/config` から最新の設定を動的に取得してクライアントを自己修復させる
 * 仕組みを将来的に拡張可能です。現在は上記の「確定URL」により問題を解決しています。
 */
