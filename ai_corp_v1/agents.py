import os
import time
from litellm import completion
from prompts.common import COMMON_NORMS
from prompts.ceo import CEO_ROLE, CEO_CONFIG
from prompts.cmo import CMO_ROLE, CMO_CONFIG
from prompts.cto import CTO_ROLE, CTO_CONFIG
from prompts.cfo import CFO_ROLE, CFO_CONFIG
from prompts.cdo import CDO_ROLE, CDO_CONFIG
from prompts.clo import CLO_ROLE, CLO_CONFIG
from prompts.cso import CSO_ROLE, CSO_CONFIG
from prompts.cko import CKO_ROLE, CKO_CONFIG
from prompts.specialist import SPECIALIST_ROLE, SPECIALIST_CONFIG
from prompts.styles import STYLES
from prompts.visuals import VISUAL_NORMS

class Agent:
    """役員エージェントの基底クラス (SOLID: LSP/SRP 遵守)"""
    def __init__(self, name, role, emoji, role_prompt, default_model, priority=50, model_override=None):
        self.name = name
        self.role = role
        self.emoji = emoji
        self.priority = priority
        
        # モデル決定の優先順位: UI上書き > 環境変数 > デフォルト
        if model_override:
            self.model_name = model_override
        else:
            env_key = f"ROLE_{role}_MODEL"
            self.model_name = os.getenv(env_key, default_model).strip()
            
        self.system_prompt = f"{role_prompt}\n\n{COMMON_NORMS}"

    def apply_skills(self, user_input, context):
        """特定の役職が持つ技術（スキル）を適用するフック (OCP遵守)"""
        return context

    def think(self, user_input, context="", style="Universal Clean", stream=False):
        """思考プロセス (SRP遵守)"""
        enhanced_context = self.apply_skills(user_input, context)
        style_prompt = STYLES.get(style, STYLES["Universal Clean"])
        dynamic_system_prompt = f"{self.system_prompt}\n\n{VISUAL_NORMS}\n\n{style_prompt}"
        full_prompt = f"{enhanced_context}\n\n---\n{user_input}" if enhanced_context else user_input

        if os.getenv("ANY_MODEL_MOCK") == "true":
            return self._mock_thinking(style, stream)

        return self._execute_completion(dynamic_system_prompt, full_prompt, stream)

    def _mock_thinking(self, style, stream):
        mock_text = f"【模擬 - {style}】{self.name}（{self.role}）として検討しました。"
        if stream:
            def _mock():
                for ch in mock_text:
                    yield ch
                    time.sleep(0.005)
            return _mock()
        return mock_text

    def _execute_completion(self, system_prompt, user_prompt, stream):
        try:
            api_key = self._get_api_key()
            extra_headers = {}
            if "openrouter/" in self.model_name:
                os.environ["OPENROUTER_API_KEY"] = api_key
                extra_headers = {"HTTP-Referer": "http://localhost:9000", "X-Title": "AI Corp"}

            response = completion(
                model=self.model_name,
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                api_key=api_key,
                extra_headers=extra_headers,
                max_tokens=2000,
                temperature=0.7,
                stream=stream
            )

            if stream:
                def _stream():
                    for chunk in response:
                        try:
                            text = chunk.choices[0].delta.content
                            if text: yield text
                        except: pass
                return _stream()
            
            return response.choices[0].message.content

        except Exception as e:
            return f"[Error: {self.model_name}] {str(e)}"

    def _get_api_key(self):
        if "openrouter/" in self.model_name: return os.getenv("OPENROUTER_API_KEY", "").strip("'\" ")
        if "groq/" in self.model_name: return os.getenv("GROQ_API_KEY", "").strip("'\" ")
        return os.getenv("GEMINI_API_KEY", "").strip("'\" ")

# --- Subclasses (憲法に基づき、正統な継承のみで構成) ---

class CEO(Agent):
    def __init__(self, model_override=None):
        super().__init__(CEO_CONFIG["name"], CEO_CONFIG["role"], CEO_CONFIG["emoji"], CEO_ROLE, CEO_CONFIG["default_model"], priority=100, model_override=model_override)

class CMO(Agent):
    def __init__(self, model_override=None):
        super().__init__(CMO_CONFIG["name"], CMO_CONFIG["role"], CMO_CONFIG["emoji"], CMO_ROLE, CMO_CONFIG["default_model"], model_override=model_override)

    def apply_skills(self, user_input, context):
        try:
            from skills.market_researcher import run_market_research
            research = run_market_research(user_input)
            return f"{context}\n\n{research}" if context else research
        except: return context

class CTO(Agent):
    def __init__(self, model_override=None):
        super().__init__(CTO_CONFIG["name"], CTO_CONFIG["role"], CTO_CONFIG["emoji"], CTO_ROLE, CTO_CONFIG["default_model"], model_override=model_override)

    def apply_skills(self, user_input, context):
        try:
            from skills.coding_agent import coding_skill_wrapper
            tech = coding_skill_wrapper(user_input)
            return f"{context}\n\n{tech}" if context else tech
        except: return context

class CFO(Agent):
    def __init__(self, model_override=None):
        super().__init__(CFO_CONFIG["name"], CFO_CONFIG["role"], CFO_CONFIG["emoji"], CFO_ROLE, CFO_CONFIG["default_model"], model_override=model_override)

class CDO(Agent):
    def __init__(self, model_override=None):
        super().__init__(CDO_CONFIG["name"], CDO_CONFIG["role"], CDO_CONFIG["emoji"], CDO_ROLE, CDO_CONFIG["default_model"], model_override=model_override)

class CLO(Agent):
    def __init__(self, model_override=None):
        super().__init__(CLO_CONFIG["name"], CLO_CONFIG["role"], CLO_CONFIG["emoji"], CLO_ROLE, CLO_CONFIG["default_model"], priority=60, model_override=model_override)

    def apply_skills(self, user_input, context):
        try:
            from skills.clo_researcher import run_legal_research
            res = run_legal_research(user_input)
            return f"{context}\n\n{res}" if context else res
        except: return context

class CSO(Agent):
    def __init__(self, model_override=None):
        super().__init__(CSO_CONFIG["name"], CSO_CONFIG["role"], CSO_CONFIG["emoji"], CSO_ROLE, CSO_CONFIG["default_model"], model_override=model_override)

class CKO(Agent):
    def __init__(self, model_override=None):
        super().__init__(CKO_CONFIG["name"], CKO_CONFIG["role"], CKO_CONFIG["emoji"], CKO_ROLE, CKO_CONFIG["default_model"], priority=95, model_override=model_override)

    def apply_skills(self, user_input, context):
        try:
            from skills.knowledge_manager import KnowledgeManager
            manager = KnowledgeManager()
            hits = manager.search_relevant_knowledge(user_input, limit=3)
            if hits:
                k_text = "\n\n■ [CKOの記録資料]\n" + "\n".join([f"👉 {h['content'][:300]}..." for h in hits])
                return f"{context}\n\n{k_text}" if context else k_text
            return context
        except: return context

class Specialist(Agent):
    def __init__(self, model_override=None):
        super().__init__(SPECIALIST_CONFIG["name"], SPECIALIST_CONFIG["role"], SPECIALIST_CONFIG["emoji"], SPECIALIST_ROLE, SPECIALIST_CONFIG["default_model"], priority=80, model_override=model_override)
