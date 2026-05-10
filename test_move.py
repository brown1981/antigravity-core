import shutil
import os

src = "/Users/ooshirokazuki2/.gemini/antigravity/scratch/quant-backend/line_notifier.py"
dst = "/Users/ooshirokazuki2/.gemini/antigravity/scratch/archives/2026-04-19_quant_sentinel_halted/line_notifier.py"

try:
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
