import time

class BoardMeeting:
    def __init__(self, company_name, agents):
        self.company_name = company_name
        self.ceo = next((a for a in agents if a.role == "CEO"), None)
        self.board = [a for a in agents if a.role != "CEO"]
        self.agents = agents

    def announce(self, message):
        print(f"\n[Boardroom] {message}")

    def run(self, agenda, style="Universal Clean", stream=False):
        self.announce(f"役員会議を開始しました：{agenda}")
        
        # 役員を優先度順にソート (CKOなどのコンテキスト提供者が上位に来るよう設計)
        sorted_board = sorted(self.board, key=lambda x: x.priority, reverse=True)
        
        reports = {}
        for officer in sorted_board:
            # 優先度が高いエージェント（CKO等）には「ナレッジ提供」を求めるプロンプトを自動生成
            if officer.priority >= 90:
                prompt = f"議題『{agenda}』に関する過去の経緯や関連資料をナレッジベースから提示してください。"
            else:
                nomination_msg = f"次に、{officer.role}の{officer.name}、あなたの見解を聞かせてください。"
                self.announce(nomination_msg)
                prompt = (
                    f"議題『{agenda}』に対し、あなたの担当領域（{officer.role}）から発言してください。\n"
                    f"これまでの議論状況: {list(reports.keys()) if reports else '開始直後'}"
                )
            
            response = officer.think(prompt, style=style, stream=stream)
            yield officer, response
            reports[officer.role] = "processed"

        # 3. CEOによる最終総括
        if self.ceo:
            yield self.ceo, "CEO_TURN"
