// LINE Developer Consoleから取得した情報を環境変数に設定します
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
// セキュリティのため、あなたのユーザーIDにのみ送信を許可する設定
const ADMIN_USER_ID = process.env.LINE_ADMIN_USER_ID || '';

/**
 * 緊急アラートや承認依頼をあなた（社長）にプッシュ送信する関数
 * ※これは月200通の無料枠を消費する通信です。
 */
export async function sendAdminAlert(message: string, requireApproval: boolean = false) {
  if (!ADMIN_USER_ID) {
    console.error('管理者のLINE IDが設定されていません。通知スキップ。');
    return;
  }

  const messagesPayload: any[] = [];

  if (requireApproval) {
    // 承認が必要な場合は、「Quick Reply」を使ってボタンを表示させる
    messagesPayload.push({
      type: 'text',
      text: `⚠️ 【緊急確認】\n${message}`,
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'message',
              label: '👍 承認して続行',
              text: '承認'
            }
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '✖️ 却下して中止',
              text: '却下'
            }
          }
        ]
      }
    });
  } else {
    // 単なるテキスト通知の場合
    messagesPayload.push({
      type: 'text',
      text: `ℹ️ 【システム報告】\n${message}`
    });
  }

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: ADMIN_USER_ID, // 宛先を「あなた」に強制・固定
        messages: messagesPayload
      })
    });

    if (!res.ok) {
      console.error('プッシュ通知エラー:', await res.text());
    } else {
      console.log('✅ LINEへプッシュ通知を送信しました。');
    }
  } catch (error) {
    console.error('送信用APIエラー:', error);
  }
}
