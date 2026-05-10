const DICT = {
    ja: {
        back: "[ NEXUSポータルへ戻る ]",
        title: "TEAM_SPIRIT",
        syncLabel: "システム・ニューラル同期: ",
        purification: "システム浄化ステータス",
        stanceTitle: "ボードルームの姿勢",
        stanceDesc: "現在のボードルームは **「全要塞完成 (Fortress Finalized)」** 状態にあります。全15アプリの構築が完了し、知能は極限まで研ぎ澄まされています。司令官のあらゆる意志を即座に実行可能です。",
        gems: {
            deepseek: { name: "機巧 (DeepSeek)", role: "Core Architect", desc: "物理基盤と論理構造を司る。SOLID原則の絶対的守護者。" },
            phi: { name: "影歩 (Phi)", role: "Visual Strategist", desc: "司令官の美学をコードへ変換する。クリスタル・グラスUIの設計者。" },
            gemma: { name: "深謀 (Gemma)", role: "Intelligence Analyst", desc: "データから真実を抽出する。戦略ブループリントの策定者。" },
            claude: { name: "鋼 (Claude)", role: "Tactical Discipline", desc: "コードの整合性と規律を監査する。最終的な品質の守護者。" }
        }
    },
    en: {
        back: "[ RETURN_TO_NEXUS ]",
        title: "TEAM_SPIRIT",
        syncLabel: "SYSTEM_NEURAL_SYNC: ",
        purification: "SYSTEM_PURIFICATION_STATUS",
        stanceTitle: "BOARDROOM_STANCE",
        stanceDesc: "The boardroom is now in **'Fortress Finalized'** state. All 15 applications are operational. Intelligence is sharpened to the limit, ready to execute any commander's intent.",
        gems: {
            deepseek: { name: "DeepSeek", role: "Core Architect", desc: "Governs physical foundation and logic. Guardian of SOLID principles." },
            phi: { name: "Phi", role: "Visual Strategist", desc: "Translates aesthetics into code. Designer of Crystal-Glass UI." },
            gemma: { name: "Gemma", role: "Intelligence Analyst", desc: "Extracts truth from data. Architect of strategic blueprints." },
            claude: { name: "Claude", role: "Tactical Discipline", desc: "Audits code integrity and discipline. Guardian of final quality." }
        }
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    const d = DICT[lang];
    document.querySelector('.back-btn').innerText = d.back;
    document.querySelector('h1').innerText = d.title;
    document.querySelector('.sync-level').firstChild.textContent = d.syncLabel;
    document.querySelectorAll('.card h3')[0].innerText = d.purification;
    document.querySelectorAll('.card h3')[1].innerText = d.stanceTitle;
    document.querySelectorAll('.card div')[6].innerText = d.stanceDesc;
    
    // Re-render gems with new language
    if (typeof renderGems === 'function') renderGems();
}
