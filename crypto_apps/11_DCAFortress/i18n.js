const DICT = {
    ja: {
        back: "[ NEXUSポータルへ戻る ]",
        title: "DCA_FORTRESS",
        subtitle: "時間分散型 資本防衛システム",
        plannerTitle: "戦略プランナー",
        labels: {
            monthly: "月次投資額 ($)",
            duration: "期間 (月)",
            startPrice: "開始価格 ($)",
            endPrice: "目標価格 ($)",
            totalInvested: "総投資額",
            currentValue: "現在の評価額",
            totalProfit: "合計利益 (%)",
            avgPrice: "平均取得単価"
        },
        btnExecute: "シミュレーション実行",
        visualizerTitle: "成長マトリクス",
        doctrine: "FORTRESS DOCTRINE:",
        doctrineText: "市場の短期的なノイズを無視し、数学的な優位性を確保せよ。積立は「意志」ではなく「規律」によってのみ完成する。"
    },
    en: {
        back: "[ RETURN_TO_NEXUS ]",
        title: "DCA_FORTRESS",
        subtitle: "TIME-AVERAGED CAPITAL PROTECTION SYSTEM",
        plannerTitle: "STRATEGY_PLANNER",
        labels: {
            monthly: "MONTHLY_INVESTMENT ($)",
            duration: "DURATION (MONTHS)",
            startPrice: "START_PRICE ($)",
            endPrice: "END_PRICE ($)",
            totalInvested: "TOTAL_INVESTED",
            currentValue: "CURRENT_VALUE",
            totalProfit: "TOTAL_PROFIT (%)",
            avgPrice: "AVG_PURCHASE_PRICE"
        },
        btnExecute: "EXECUTE SIMULATION",
        visualizerTitle: "GROWTH_MATRIX_ACTIVE",
        doctrine: "FORTRESS DOCTRINE:",
        doctrineText: "Ignore short-term market noise; secure mathematical advantage. Accumulation is perfected by discipline, not will."
    }
};

let currentLang = 'ja';

function setLang(lang) {
    currentLang = lang;
    const d = DICT[lang];
    document.querySelector('.back-btn').innerText = d.back;
    document.querySelector('h1').innerText = d.title;
    document.querySelector('header p').innerText = d.subtitle;
    document.querySelector('.panel h2').innerText = d.plannerTitle;
    
    const labels = document.querySelectorAll('.input-group label');
    labels[0].innerText = d.labels.monthly;
    labels[1].innerText = d.labels.duration;
    labels[2].innerText = d.labels.startPrice;
    labels[3].innerText = d.labels.endPrice;
    
    document.querySelector('.action-btn').innerText = d.btnExecute;
    
    const statLabels = document.querySelectorAll('.stat-label');
    statLabels[0].innerText = d.labels.totalInvested;
    statLabels[1].innerText = d.labels.currentValue;
    statLabels[2].innerText = d.labels.totalProfit;
    statLabels[3].innerText = d.labels.avgPrice;
    
    document.querySelector('.chart-area div').innerText = d.visualizerTitle;
    document.querySelector('strong').innerText = d.doctrine;
    document.querySelector('strong').nextSibling.textContent = d.doctrineText;
}
