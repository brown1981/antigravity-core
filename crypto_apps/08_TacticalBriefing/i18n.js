const LANG_DICT = {
    ja: {
        title: "TACTICAL BRIEFING",
        subtitle: "STRATEGIC INTELLIGENCE REPORT v1.0",
        status: "LIVE_FEED: ACTIVE",
        intelTitle: "INTELLIGENCE_SUMMARY (24H)",
        scenarioTitle: "SCENARIO_ANALYSIS",
        actionTitle: "ACTION_PLAN",
        back: "[ RETURN_TO_NEXUS ]",
        caseA: "CASE_A: ACCUMULATION",
        caseB: "CASE_B: NEUTRAL",
        caseC: "CASE_C: EVACUATION",
        loading: "アナライザー起動中...",
        report: "市場データ、クジラの動向、およびSNSセンチメントのクロス分析を実行。現在の市場は**重要な分岐点**にあります。特にSolanaエコシステムにおける流動性の集中が顕著であり、ビットコインの支配率（Dominance）が安定する一方で、特定のアルトコインにおいて爆発的な予兆（Ignition）を検知しました。"
    },
    en: {
        title: "TACTICAL BRIEFING",
        subtitle: "STRATEGIC INTELLIGENCE REPORT v1.0",
        status: "LIVE_FEED: ACTIVE",
        intelTitle: "INTELLIGENCE_SUMMARY (24H)",
        scenarioTitle: "SCENARIO_ANALYSIS",
        actionTitle: "ACTION_PLAN",
        back: "[ RETURN_TO_NEXUS ]",
        caseA: "CASE_A: ACCUMULATION",
        caseB: "CASE_B: NEUTRAL",
        caseC: "CASE_C: EVACUATION",
        loading: "INITIALIZING ANALYZER...",
        report: "Executing cross-analysis of market data, whale movements, and social sentiment. The market is currently at a **critical pivot point**. High liquidity concentration is observed in the Solana ecosystem. While BTC dominance remains stable, we detect explosive ignition signals in specific altcoins."
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    const d = LANG_DICT[lang];
    
    document.getElementById('lbl-title').innerText = d.title;
    document.getElementById('lbl-subtitle').innerText = d.subtitle;
    document.getElementById('lbl-status').innerText = d.status;
    document.getElementById('lbl-intel-title').innerText = d.intelTitle;
    document.getElementById('lbl-scenario-title').innerText = d.scenarioTitle;
    document.getElementById('lbl-action-title').innerText = d.actionTitle;
    document.getElementById('lbl-back').innerText = d.back;
    document.getElementById('lbl-report').innerHTML = d.report;
    
    document.getElementById('case-a-tag').innerText = d.caseA;
    document.getElementById('case-b-tag').innerText = d.caseB;
    document.getElementById('case-c-tag').innerText = d.caseC;
}
