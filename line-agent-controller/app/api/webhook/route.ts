import { NextResponse } from 'next/server';
import crypto from 'crypto';

// LINE Developer Consoleから取得した情報を環境変数に設定します
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

/**
 * LINEからのWebhook（メッセージ受信）を処理するエンドポイント
 */
export async function POST(req: Request) {
  try {
    const textBase = await req.text();
    const signature = req.headers.get('x-line-signature') || '';

    // セキュリティ：本当にLINEからのリクエストか署名を検証
    const hash = crypto
      .createHmac('SHA256', LINE_CHANNEL_SECRET)
      .update(textBase)
      .digest('base64');

    if (hash !== signature) {
      console.error('無効な署名です');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = JSON.parse(textBase);

    // イベントの配列を処理
    if (body.events && body.events.length > 0) {
      for (const event of body.events) {
        // テキストメッセージが来た場合
        if (event.type === 'message' && event.message.type === 'text') {
          const userMessage = event.message.text;
          const replyToken = event.replyToken;
          const userId = event.source.userId;

          console.log(`[LINE受信] ユーザー(${userId}): ${userMessage}`);

          let replyText = '';

          // 簡単なキーワードルーティング（将来AIルーターに繋ぎます）
          if (userMessage === '承認' || userMessage === '👍') {
            replyText = '【システム】承認を受け付けました。保留していたAIの作業を再開します...🚀';
            // TODO: ここで待機中のタスク再開ロジックを呼ぶ
          } else if (userMessage === '却下' || userMessage === '✖️') {
            replyText = '【システム】却下を受け付けました。該当タスクを破棄します。';
            // TODO: ここでタスクキャンセルロジックを呼ぶ
          } else if (userMessage.includes('進捗')) {
            replyText = '【状況報告】現在、サブAI部隊が競合調査を実行中です（進捗75%）。完了次第報告します！';
          } else {
            // その他の自由入力テキストは、新たな「追加指示」としてキューに積む
            replyText = `【指示受付】「${userMessage}」\n了解いたしました。次回の役員会議のアジェンダ（追加タスク）として登録しました！`;
            // TODO: AIエージェントへのプロンプト投入ロジックを呼ぶ
          }

          // 無料の「リプライ機能」を使ってユーザーに返答
          await sendLineReply(replyToken, replyText);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * 返信を送信する関数（回数無制限・無料）
 */
async function sendLineReply(replyToken: string, text: string) {
  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [{ type: 'text', text: text }]
    })
  });
  
  if (!res.ok) {
    console.error('リプライ送信エラー:', await res.text());
  }
}
