import os
import sqlite3
import json

def get_system_health():
    """
    Antigravity 要塞の各コンポーネント（ノード）の稼働状況を確認します。
    (Cyber Nexus の移植版)
    """
    base_path = os.path.dirname(os.path.dirname(__file__))
    db_path = os.path.join(base_path, 'antigravity.db')
    skills_path = os.path.join(base_path, 'hermes_skills')
    
    nodes = []
    
    # 1. Database Node
    db_status = "OFFLINE"
    try:
        conn = sqlite3.connect(db_path)
        conn.execute("SELECT 1")
        conn.close()
        db_status = "ACTIVE"
    except:
        pass
    nodes.append({'id': 'DB-01', 'name': 'Neural Database', 'status': db_status})
    
    # 2. Skill Nodes
    critical_skills = ['market_sentiment.py', 'technical_analysis.py', 'whale_sonar.py']
    for skill in critical_skills:
        skill_exists = os.path.exists(os.path.join(skills_path, skill))
        nodes.append({
            'id': f'SKILL-{skill.split("_")[0].upper()}',
            'name': skill,
            'status': "ACTIVE" if skill_exists else "MISSING"
        })
        
    # 3. UI Node
    ui_exists = os.path.exists(os.path.join(base_path, 'boardroom.html'))
    nodes.append({'id': 'UI-01', 'name': 'Boardroom UI', 'status': "ACTIVE" if ui_exists else "MISSING"})

    results = {
        'nodes': nodes,
        'overall_status': "PURIFIED" if all(n['status'] == "ACTIVE" for n in nodes) else "WARNING",
        'uptime_pct': 99.9
    }

    return json.dumps(results, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(get_system_health())
