from agents import CEO, CMO, CTO, CFO, CDO, CLO, CSO
from company import BoardMeeting

def main():
    print("AI株式会社 役員会プロトタイプ（ターミナル版）起動中...")
    
    # 全役員のインスタンス化
    agents = [CEO(), CMO(), CTO(), CFO(), CDO(), CLO(), CSO()]
    
    # 会社の設立
    my_corp = BoardMeeting("Antigravity Innovation Inc.", agents)
    
    # 議題の入力受付
    print("\n会議の議題（アジェンダ）を入力してください：")
    agenda = input("> ")
    
    if not agenda:
        print("議題がありません。終了します。")
        return
        
    # 会議の実行
    my_corp.run(agenda)

if __name__ == "__main__":
    main()
