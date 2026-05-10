import os
import datetime
import json

class KnowledgeArchivist:
    """
    Antigravity Knowledge Archivist (V1.0)
    Automatically synchronizes AI council deliberations and project direction 
    into an Obsidian-ready Markdown Vault.
    """
    def __init__(self, vault_path="./knowledge_vault"):
        self.vault_path = vault_path
        if not os.path.exists(self.vault_path):
            os.makedirs(self.vault_path)
            os.makedirs(os.path.join(self.vault_path, "daily_logs"))
            os.makedirs(os.path.join(self.vault_path, "blueprints"))

    def log_session(self, title, content, tags=[]):
        """Creates a new permanent log entry."""
        filename = f"{datetime.date.today()}_{title.replace(' ', '_')}.md"
        filepath = os.path.join(self.vault_path, "daily_logs", filename)
        
        tag_str = " ".join([f"#{t}" for t in tags])
        md_content = f"""---
title: {title}
date: {datetime.datetime.now().isoformat()}
tags: [antigravity, {', '.join(tags)}]
---

# {title}

{tag_str}

## 🛰️ Council Summary
{content}

---
*Archived by Antigravity Core automatically.*
"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md_content)
        return filepath

# Initialization for the Singularity
if __name__ == "__main__":
    archivist = KnowledgeArchivist()
    # Log the successful move to Full Autonomy
    archivist.log_session(
        "Transition to Full Autonomy",
        "The Commander has granted full autonomy and authorized transition to Web Deployment. Antigravity is now optimizing for global release.",
        tags=["autonomy", "web_deploy", "milestone"]
    )
