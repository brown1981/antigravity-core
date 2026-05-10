from skills.knowledge_manager import KnowledgeManager

def seed():
    manager = KnowledgeManager()
    
    # 最初の知識をインプット
    knowledge_list = [
        {
            "content": "Antigravity Inc. のミッションは、AIエージェントによる自律的な組織運営（Company OS）を通じて、人類の意思決定コストをゼロにすることです。私たちは『縁側サイクル』の精神を継承し、技術と人間性の調和を目指します。",
            "source": "Corporate Mission 2024"
        },
        {
            "content": "司書AI『Lexi (CKO)』の役割は、組織のすべての記憶を Supabase 上で管理し、議論のたびに最適な過去事例やデータを役員に提示することです。彼女がいれば、すべての議論は『事実』に基づいて行われます。",
            "source": "Executive Roles Guide"
        }
    ]
    
    for k in knowledge_list:
        manager.store_knowledge(k["content"], k["source"], role="CKO")
    
    print("✨ 最初の記憶が Supabase に保存されました！")

if __name__ == "__main__":
    seed()
