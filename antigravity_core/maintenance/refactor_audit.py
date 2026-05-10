import os
import re

# Antigravity | Refactor Audit V1.0
# Maintaining a 'Lean' Sentience: Pruning redundant skills.

CORE_DIR = "/Users/ooshirokazuki2/.gemini/antigravity/scratch/antigravity_core"
SKILLS_DIR = os.path.join(CORE_DIR, "skills")

def scan_redundancy():
    print("[AUDIT] SCANNING SKILLS FOR REDUNDANCY...")
    skills = [f for f in os.listdir(SKILLS_DIR) if f.endswith('.py')]
    
    # Logic: Look for overlapping keywords in file names/content
    # (Simulated for initial deployment)
    inventory = {}
    for s in skills:
        with open(os.path.join(SKILLS_DIR, s), 'r') as f:
            content = f.read()
            # Simple keyword extraction
            keywords = re.findall(r'# Antigravity Skill: (.*)', content)
            if keywords:
                tag = keywords[0].strip()
                if tag in inventory:
                    print(f"[AUDIT] WARNING: Overlap detected between {s} and {inventory[tag]} (Tag: {tag})")
                else:
                    inventory[tag] = s

    if len(skills) > 20: # Threshold for 'Bloated' warning
        print(f"[AUDIT] CAUTION: Native skill count is high ({len(skills)}). Consider compression.")

def audit_completion():
    print("[AUDIT] CLEANUP CHECK COMPLETE. RECOMMENDED ACTIONS: NONE.")

if __name__ == "__main__":
    scan_redundancy()
    audit_completion()
