const FNG_DICT = {
    'extreme fear': { ja: '極端な恐怖', en: 'EXTREME FEAR', fr: 'PEUR EXTRÊME' },
    'fear': { ja: '恐怖', en: 'FEAR', fr: 'PEUR' },
    'neutral': { ja: '中立', en: 'NEUTRAL', fr: 'NEUTRE' },
    'greed': { ja: '強欲', en: 'GREED', fr: 'AVIDITÉ' },
    'extreme greed': { ja: '極端な強欲', en: 'EXTREME GREED', fr: 'AVIDITÉ EXTRÊME' }
};

const DICT = {
    ja: {
        back: "← Nexus Portal",
        alert: "⚠️ 過熱警告：極端な強欲を検知。新規エントリーは非推奨です ⚠️",
        chartTitle: "30日間相関：感情指数 vs 主要4銘柄",
        chartDesc: "※騰落率（%）で表示。銘柄名クリックで表示切替可能。",
        currentPrices: "現在の市場価格"
    },
    en: {
        back: "← Nexus Portal",
        alert: "⚠️ EXTREME GREED DETECTED: New entries are not recommended ⚠️",
        chartTitle: "30-Day Correlation: Emotion vs Top 4 Crypto",
        chartDesc: "*Prices shown as % change. Click legends to toggle.",
        currentPrices: "Current Market Prices"
    },
    fr: {
        back: "← Nexus Portal",
        alert: "⚠️ CUPIDITÉ EXTRÊME DÉTECTÉE : Les entrées ne sont pas recommandées ⚠️",
        chartTitle: "Corrélation 30 jours : Émotion vs Top 4 Crypto",
        chartDesc: "*Prix en % d'évolution. Cliquez pour basculer.",
        currentPrices: "Prix Actuels du Marché"
    }
};

let currentLang = 'ja';
let currentFngLabelRaw = '';

function setLang(lang, btnElement) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) {
        btnElement.classList.add('active');
    } else {
        const targetBtn = document.querySelector(`.lang-btn[onclick*="'${lang}'"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }
    
    // UIテキストの更新
    document.getElementById('lbl-back').innerText = DICT[lang].back;
    document.getElementById('red-alert').innerText = DICT[lang].alert;
    document.getElementById('lbl-chart-title').innerText = DICT[lang].chartTitle;
    document.getElementById('lbl-chart-desc').innerText = DICT[lang].chartDesc;
    document.getElementById('lbl-current').innerText = DICT[lang].currentPrices;
    
    // 感情スフィアの翻訳更新
    if (currentFngLabelRaw) {
        const lowerLabel = currentFngLabelRaw.toLowerCase();
        if(FNG_DICT[lowerLabel]) {
            document.getElementById('mood-sphere').innerText = FNG_DICT[lowerLabel][lang];
        }
    }
}
