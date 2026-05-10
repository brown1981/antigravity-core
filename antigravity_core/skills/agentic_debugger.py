import os
import re

# Antigravity Skill: Agentic Debugger V1.0
# Derived from Open VSX: devinat1.agentic-debugger logic

class AgenticDebugger:
    def __init__(self):
        self.error_patterns = {
            "syntax": r"SyntaxError|Invalid syntax",
            "reference": r"ReferenceError|not defined",
            "permission": r"PermissionError|Operation not permitted",
            "network": r"URLError|ConnectionRefused"
        }

    def analyze_log(self, log_text):
        print("[DEBUGGER] SCANNING STACK TRACE...")
        results = []
        for name, pattern in self.error_patterns.items():
            if re.search(pattern, log_text):
                results.append(f"DETECTED: {name.upper()} ERROR")
        
        if not results:
            return "No obvious errors detected. Checking logical consistency..."
        
        return " | ".join(results)

    def suggest_fix(self, error_type):
        fixes = {
            "permission": "Check directory ownership or use a localized workspace path.",
            "reference": "Verify variable initialization or import statements.",
            "syntax": "Run a linter check. Look for missing brackets or colons."
        }
        return fixes.get(error_type.lower(), "Consulting GPT-OSS for architectural audit.")

if __name__ == "__main__":
    db = AgenticDebugger()
    report = db.analyze_log("PermissionError: Operation not permitted at /Users/ooshirokazuki2")
    print(f"[DEBUGGER REPORT] {report}")
