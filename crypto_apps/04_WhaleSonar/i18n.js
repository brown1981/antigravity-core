const LANG_DICT = {
    ja: {
        title: "🐋 WHALE SONAR RADAR", 
        subtitle: "ON-CHAIN DIVERGENCE DETECTION v25.0",
        hype: "熱狂度 (HYPE)", 
        status: "システム状況", 
        scanning: "スキャン中...",
        divergence: "乖離スコア", 
        log: "ミッションログ (LAST 24H)",
        detect: "大口送金を検知", 
        alert: "⚠️ 警戒レベル上昇",
        exchange: "取引所へ流入 (SELL PRESSURE)", 
        wallet: "ウォレットへ移動 (HOLDING)"
    },
    en: {
        title: "🐋 WHALE SONAR RADAR", 
        subtitle: "ON-CHAIN DIVERGENCE DETECTION v25.0",
        hype: "HYPE LEVEL", 
        status: "SYSTEM STATUS", 
        scanning: "SCANNING...",
        divergence: "DIVERGENCE SCORE", 
        log: "MISSION LOG (LAST 24H)",
        detect: "Whale Transaction Detected", 
        alert: "⚠️ Alert Level Elevated",
        exchange: "Inflow to Exchange", 
        wallet: "Outflow to Wallet"
    },
    fr: {
        title: "🐋 RADAR SONAR BALEINE", 
        subtitle: "DÉTECTION DE DIVERGENCE ON-CHAIN v25.0",
        hype: "HYPE", 
        status: "ÉTAT DU SYSTÈME", 
        scanning: "ANALYSE...",
        divergence: "SCORE DE DIVERGENCE", 
        log: "JOURNAL DE MISSION (24H)",
        detect: "Transaction Baleine Détectée", 
        alert: "⚠️ Niveau d'Alerte Élevé",
        exchange: "Flux vers l'Échange", 
        wallet: "Flux vers Portefeuille"
    }
};

const TRAINING_DICT = {
    ja: {
        btn: "🎓 TACTICAL GUIDE", 
        modalTitle: "戦術訓練センター",
        scNoiseT: "NOISE (無視)", 
        scNoiseD: "小さな波紋。市場を動かす力はありません。",
        scOmenT: "OMEN (予兆)", 
        scOmenD: "熱狂の裏で、クジラが静かに仕込みを終えた合図。",
        scTrapT: "TRAP (罠)", 
        scTrapD: "熱狂を隠れ蓑にしたクジラの売り抜け。最も危険。",
        btnStop: "訓練終了", 
        modeLabel: "訓練モード：実行中"
    },
    en: {
        btn: "🎓 TACTICAL GUIDE", 
        modalTitle: "TACTICAL TRAINING CENTER",
        scNoiseT: "NOISE (IGNORE)", 
        scNoiseD: "Minor ripples. No power to move the market.",
        scOmenT: "OMEN (PREPARE)", 
        scOmenD: "Whales quietly accumulating while market is greedy.",
        scTrapT: "TRAP (ACTION)", 
        scTrapD: "High hype masking whale exits. Extreme risk.",
        btnStop: "EXIT TRAINING", 
        modeLabel: "TRAINING MODE: ACTIVE"
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    ['ja', 'en', 'fr'].forEach(l => {
        const btn = document.getElementById(`btn-${l}`);
        if (btn) btn.className = (l === lang) ? 'lang-btn active' : 'lang-btn';
    });
    
    document.getElementById('lbl-title').innerText = LANG_DICT[lang].title;
    document.getElementById('lbl-subtitle').innerText = LANG_DICT[lang].subtitle;
    document.getElementById('lbl-hype').innerText = LANG_DICT[lang].hype;
    document.getElementById('lbl-status').innerText = LANG_DICT[lang].status;
    document.getElementById('lbl-divergence').innerText = LANG_DICT[lang].divergence;
    document.getElementById('lbl-log').innerText = LANG_DICT[lang].log;
    
    // Training UI
    document.getElementById('btn-training').innerText = TRAINING_DICT[lang].btn;
    document.getElementById('lbl-modal-title').innerText = TRAINING_DICT[lang].modalTitle;
}
