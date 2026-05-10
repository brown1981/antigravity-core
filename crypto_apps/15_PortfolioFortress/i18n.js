const DICT = {
    ja: {
        back: "[ NEXUSポータルへ戻る ]",
        title: "PORTFOLIO_FORTRESS",
        status: "最終防衛拠点 稼働中 | V3.1 完了",
        riskTitle: "要塞ストレス・テスト",
        labels: {
            crash: "市場暴落シミュレーション (BTC -35%)",
            survival: "要塞生存ドローダウン",
            strategyTitle: "防御戦略:",
            strategyText: "分散（Diversification）は、無知に対する保険ではない。それは、予測不可能な事態に対する唯一の「数学的な防壁」である。"
        },
        assets: {
            btc: "BITCOIN",
            eth: "ETHEREUM",
            stables: "STABLES",
            alts: "ALTS",
            gold: "DIGITAL_GOLD"
        }
    },
    en: {
        back: "[ RETURN_TO_NEXUS ]",
        title: "PORTFOLIO_FORTRESS",
        status: "THE_FINAL_BASTION_OPERATIONAL | V3.1_COMPLETE",
        riskTitle: "FORTRESS_STRESS_TEST",
        labels: {
            crash: "MARKET_CRASH_SIMULATION (BTC -35%)",
            survival: "FORTRESS_SURVIVAL_DRAWDOWN",
            strategyTitle: "DEFENSE_STRATEGY:",
            strategyText: "Diversification is not an insurance against ignorance. It is the only 'mathematical bulwark' against the unpredictable."
        },
        assets: {
            btc: "BITCOIN",
            eth: "ETHEREUM",
            stables: "STABLES",
            alts: "ALTS",
            gold: "DIGITAL_GOLD"
        }
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    const d = DICT[lang];
    document.querySelector('.back-btn').innerText = d.back;
    document.querySelector('h1').innerText = d.title;
    document.querySelector('.fortress-status').innerText = d.status;
    document.querySelector('.risk-panel h2').innerText = d.riskTitle;
    
    const divs = document.querySelectorAll('.risk-panel > div > div:first-child');
    divs[0].innerText = d.labels.crash;
    divs[1].innerText = d.labels.survival;
    
    document.querySelector('strong').innerText = d.labels.strategyTitle;
    document.querySelector('strong').nextSibling.textContent = d.labels.strategyText;
    
    // Re-render hexagons if possible (labels)
    if (typeof renderShield === 'function') renderShield();
}
