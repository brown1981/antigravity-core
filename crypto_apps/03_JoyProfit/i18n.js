const LANG_DICT = {
    ja: {
        title: "🎯 JOY PROFIT TRACKER", 
        targetItem: "目標アイテム", 
        targetPrice: "目標金額 ($)",
        taxShield: "🛡️ TAX SHIELD (税引後 -30% 概算モード)", 
        portfolioTitle: "DYNAMIC PORTFOLIO (最大10銘柄)",
        btnAdd: "+ 資産を追加", 
        btnCalc: "🔄 最新価格で再計算", 
        totalProfit: "総含み益:",
        assetCol: "資産", 
        priceCol: "取得単価 ($)", 
        amountCol: "保有数量",
        epicSub: "OBJECTIVE SECURED", 
        epicDesc: "対象の獲得を許可します。", 
        epicBtn: "承認 (AUTHORIZE)",
        goalReached: "100% - GOAL REACHED! 🎉"
    },
    en: {
        title: "🎯 JOY PROFIT TRACKER", 
        targetItem: "Target Item", 
        targetPrice: "Target Price ($)",
        taxShield: "🛡️ TAX SHIELD (-30% Est. After Tax)", 
        portfolioTitle: "DYNAMIC PORTFOLIO (Max 10)",
        btnAdd: "+ ADD ASSET", 
        btnCalc: "🔄 RECALCULATE MARKET PRICES", 
        totalProfit: "TOTAL UNREALIZED PROFIT:",
        assetCol: "Asset", 
        priceCol: "Avg Buy Price ($)", 
        amountCol: "Amount",
        epicSub: "OBJECTIVE SECURED", 
        epicDesc: "The asset is now within your grasp.", 
        epicBtn: "AUTHORIZE",
        goalReached: "100% - GOAL REACHED! 🎉"
    },
    fr: {
        title: "🎯 JOY PROFIT TRACKER", 
        targetItem: "Article Cible", 
        targetPrice: "Prix Cible ($)",
        taxShield: "🛡️ BOUCLIER FISCAL (-30% Est.)", 
        portfolioTitle: "PORTEFEUILLE DYNAMIQUE (Max 10)",
        btnAdd: "+ AJOUTER UN ACTIF", 
        btnCalc: "🔄 RECALCULER LES PRIX DU MARCHÉ", 
        totalProfit: "PROFIT LATENT TOTAL:",
        assetCol: "Actif", 
        priceCol: "Prix d'achat moyen ($)", 
        amountCol: "Montant",
        epicSub: "OBJECTIVE ATTEINT", 
        epicDesc: "L'actif est désormais à votre portée.", 
        epicBtn: "AUTORISER",
        goalReached: "100% - OBJECTIF ATTEINT! 🎉"
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    ['ja', 'en', 'fr'].forEach(l => {
        const btn = document.getElementById(`btn-${l}`);
        if (btn) btn.className = (l === lang) ? 'lang-btn active' : 'lang-btn';
    });
    
    // UI Elements
    document.getElementById('lbl-title').innerText = LANG_DICT[lang].title;
    document.getElementById('lbl-target').innerText = LANG_DICT[lang].targetItem;
    document.getElementById('lbl-price').innerText = LANG_DICT[lang].targetPrice;
    document.getElementById('lbl-tax').innerText = LANG_DICT[lang].taxShield;
    document.getElementById('lbl-port').innerText = LANG_DICT[lang].portfolioTitle;
    document.getElementById('btn-add').innerText = LANG_DICT[lang].btnAdd;
    document.getElementById('btn-calc').innerText = LANG_DICT[lang].btnCalc;
    document.getElementById('lbl-total').innerText = LANG_DICT[lang].totalProfit;
    
    // Epic Elements
    document.getElementById('epic-sub').innerText = LANG_DICT[lang].epicSub;
    document.getElementById('epic-desc').innerText = LANG_DICT[lang].epicDesc;
    document.getElementById('epic-btn').innerText = LANG_DICT[lang].epicBtn;
    
    // Refresh Portfolio View
    if (typeof renderPortfolio === 'function') renderPortfolio();
    if (typeof calculateProfits === 'function') calculateProfits(false);
}
