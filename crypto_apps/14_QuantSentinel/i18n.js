const DICT = {
    ja: {
        back: "[ NEXUSポータルへ戻る ]",
        scannerTitle: "インスティテューショナル・スキャナー",
        chartTitle: "精度量子チャート",
        labels: {
            volatility: "ボラティリティ (24H)",
            rsi: "相対力指数 (RSI)",
            funding: "資金調達率 (Funding Rate)",
            liquidity: "推定流動性",
            orderBlock: "紫: オーダーブロック",
            fvg: "緑破線: フェアバリューギャップ",
            sentinel: "センチネル稼働中 V4.2"
        },
        smcNoteTitle: "SMCアルゴリズム:",
        smcNoteText: "機関の蓄積（Accumulation）と操作（Manipulation）を検知中。小口投資家の罠を避け、巨大な波に乗れ。",
        dataSource: "データソース: オンチェーン・リクイディティ・マップ"
    },
    en: {
        back: "[ RETURN_TO_NEXUS ]",
        scannerTitle: "INSTITUTIONAL_SCANNER",
        chartTitle: "QUANT_PRECISION_CHART",
        labels: {
            volatility: "VOLATILITY (24H)",
            rsi: "RELATIVE STRENGTH INDEX (RSI)",
            funding: "FUNDING RATE",
            liquidity: "ESTIMATED LIQUIDITY",
            orderBlock: "PURPLE: ORDER_BLOCK",
            fvg: "GREEN_DASH: FAIR_VALUE_GAP",
            sentinel: "SENTINEL_ACTIVE_V4.2"
        },
        smcNoteTitle: "SMC_ALGORITHM:",
        smcNoteText: "Detecting Institutional Accumulation & Manipulation. Avoid retail traps; ride the giant waves.",
        dataSource: "DATA_SOURCE: ON-CHAIN_LIQUIDITY_MAP"
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    const d = DICT[lang];
    document.querySelector('.back-btn').innerText = d.back;
    document.querySelectorAll('.panel h2')[0].innerText = d.scannerTitle;
    document.querySelectorAll('.panel h2')[1].innerText = d.chartTitle;
    
    document.querySelector('strong').innerText = d.smcNoteTitle;
    document.querySelector('strong').nextSibling.textContent = d.smcNoteText;
    
    document.querySelector('div[style*="font-size:0.6rem"]').innerText = d.dataSource;
    
    const footerSpans = document.querySelectorAll('div[style*="border-top"] span');
    footerSpans[0].innerText = d.labels.orderBlock;
    footerSpans[1].innerText = d.labels.fvg;
    footerSpans[2].innerText = d.labels.sentinel;
}
