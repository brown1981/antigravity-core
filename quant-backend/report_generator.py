import sqlite3
import pandas as pd
from datetime import datetime

from line_notifier import send_line_push

DATABASE_PATH = "specialist_v3_shadow.db"

def generate_report():
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        
        # 1. Overall Stats
        df_trades = pd.read_sql_query("SELECT * FROM shadow_trades WHERE status != 'OPEN'", conn)
        df_metrics = pd.read_sql_query("SELECT * FROM performance_metrics ORDER BY timestamp DESC LIMIT 1", conn)
        
        if df_trades.empty:
            print("No completed trades yet.")
            return

        total_trades = len(df_trades)
        win_rate = (len(df_trades[df_trades['status'] == 'WIN']) / total_trades) * 100
        pf = df_metrics['profit_factor'].iloc[0]
        expectancy = df_metrics['expectancy'].iloc[0]
        ror = df_metrics['risk_of_ruin'].iloc[0]
        
        # 2. Regime Analysis
        regime_stats = df_trades.groupby(['regime_vol', 'regime_trend']).agg({
            'profit': ['mean', 'sum', 'count']
        })

        # 3. Build Markdown
        report = f"""# 修行報告書 (Stealth Analyst Weekly Audit)
報告日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 📊 総合パフォーマンス
*   **総トレード数**: {total_trades}
*   **勝率**: {win_rate:.2f}%
*   **Profit Factor**: {pf:.2f}
*   **期待値 (Expectancy)**: {expectancy:.4f}
*   **最大ドローダウン**: {df_metrics['max_drawdown'].iloc[0]*100:.2f}%
*   **破産確率 (Risk of Ruin)**: {ror*100:.2f}%

## 🔍 相場環境（レジーム）別分析
{regime_stats.to_markdown()}

> [!IMPORTANT]
> **分析官の所見**
"""
        
        # Add automated insight based on PF
        insight = ""
        if pf > 1.5:
            insight = "現状、ロジックは実戦投入レベルの優位性を示しています。レジーム判定が機能しており、損失が抑えられています。"
        elif pf > 1.1:
            insight = "優位性はありますが、まだ「修行」が必要です。特定のレジームでのドローダウン要因を特定中。" 
        else:
            insight = "⚠️ 警告: 現在のロジックでは破産リスクが高いです。修行期間の延長、またはロジックの再調整を推奨します。"

        report += f"> {insight}\n"

        with open("WEEKLY_AUDIT_REPORT.md", "w") as f:
            f.write(report)
        
        # --- LINE通知送信 ---
        line_msg = f"【理系専務：修行報告】\nPF: {pf:.2f} | 期待値: {expectancy:.4f}\n破産確率: {ror*100:.1f}%\n\n{insight}\n\n※詳細レポートはプロジェクト内に生成されました。「監査」とメッセージを送れば役員会議を開始します。"
        send_line_push(line_msg)
        
        print("Report Generated and LINE notified.")
        
    except Exception as e:
        print(f"Report Generation Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    generate_report()
