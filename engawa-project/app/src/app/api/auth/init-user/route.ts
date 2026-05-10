import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * 🛰️ Absolute Authentication Synchronizer
 * 基盤: Supabase Auth (Service Role)
 * 目標: いかなる環境下でも oshirokazuki@aim.com / test を確立する
 */
export async function GET() {
  const supabaseUrl = (globalThis as any).SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = (globalThis as any).SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const email = 'oshirokazuki@aim.com';
  const password = 'engawacycle';

  try {
    // 1. 全ユーザーリストを取得 (Deterministic Approach)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      // 2a. すでに存在する場合: パスワードと確認ステータスを強制上書き
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, { 
        password, 
        email_confirm: true 
      });
      if (updateError) throw updateError;
      return NextResponse.json({ success: true, message: `ACCOUNT_SYNCHRONIZED: User ${email} updated with password '${password}'.` });
    } else {
      // 2b. 存在しない場合: 新規作成
      const { error: createError } = await supabase.auth.admin.createUser({
        email, 
        password, 
        email_confirm: true
      });
      if (createError) throw createError;
      return NextResponse.json({ success: true, message: `ACCOUNT_CREATED: User ${email} created with password '${password}'.` });
    }

  } catch (err: any) {
    console.error('Absolute Auth Sync Failure:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
