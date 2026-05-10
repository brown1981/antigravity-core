const DICT = {
    ja: {
        back: "[ NEXUSポータルへ戻る ]",
        phase: "静寂",
        quotes: [
            "市場の喧騒を離れ、呼吸を整えよ。",
            "規律は、感情よりも力強い。",
            "待つことは、行動することと同じくらい重要である。",
            "嵐の中でも、内なる静寂を保て。"
        ],
        labels: {
            gas: "ETHガス代",
            base: "ベース手数料"
        },
        status: "サンクチュアリ稼働中 | ニューラル静寂プロトコル V1"
    },
    en: {
        back: "[ RETURN_TO_NEXUS ]",
        phase: "PEACE",
        quotes: [
            "Detach from market noise; steady your breath.",
            "Discipline is more powerful than emotion.",
            "Waiting is as important as acting.",
            "Maintain inner silence even amidst the storm."
        ],
        labels: {
            gas: "ETH_GAS",
            base: "BASE_FEE"
        },
        status: "SANCTUARY_ACTIVE | NEURAL_CALM_PROTOCOL_V1"
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    const d = DICT[lang];
    document.querySelector('.back-btn').innerText = d.back;
    document.getElementById('zen-phase').innerText = d.phase;
    document.querySelector('.status-indicator').innerText = d.status;
    
    const labels = document.querySelectorAll('.gas-label');
    labels[0].innerText = d.labels.gas;
    labels[1].innerText = d.labels.base;
    
    // Pick a random quote for current language
    const quotes = d.quotes;
    document.getElementById('zen-quote').innerText = quotes[Math.floor(Math.random() * quotes.length)];
}
