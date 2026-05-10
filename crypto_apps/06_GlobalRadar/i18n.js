const DICT = {
    ja: {
        back: "[ NEXUSポータルへ戻る ]",
        radarActive: "レーダー稼働中",
        labels: {
            dom: "BTCドミナンス",
            cap: "仮想通貨時価総額",
            trend: "トレンド銘柄 (TOP 3)",
            vol: "24時間取引高",
            ex: "主要取引所数",
            status: "システム状態"
        },
        statusVal: "最適 (OPTIMAL)"
    },
    en: {
        back: "[ RETURN_TO_NEXUS ]",
        radarActive: "RADAR_ACTIVE",
        labels: {
            dom: "BTC DOMINANCE",
            cap: "TOTAL MARKET CAP",
            trend: "TRENDING (TOP 3)",
            vol: "24H VOLUME",
            ex: "EXCHANGES",
            status: "STATUS"
        },
        statusVal: "OPTIMAL"
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    const d = DICT[lang];
    document.querySelector('.back-btn').innerText = d.back;
    document.querySelector('.radar-label').innerText = d.radarActive;
    
    const cards = document.querySelectorAll('.card strong');
    cards[0].innerText = d.labels.dom;
    cards[1].innerText = d.labels.cap;
    cards[2].innerText = d.labels.trend;
    cards[3].innerText = d.labels.vol;
    cards[4].innerText = d.labels.ex;
    cards[5].innerText = d.labels.status;
    
    document.getElementById('status-val').innerText = d.statusVal;
}
