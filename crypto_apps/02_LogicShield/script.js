/**
 * LOGIC_SHIELD: ORCHESTRATOR
 * Responsibilities: API Fetch, UI Rendering, Integration
 */

const CONFIG = {
    KEY: window.ANTIGRAVITY_CONFIG.COINGECKO_API_KEY,
    COINS: ['bitcoin', 'ethereum', 'solana', 'ripple'],
    SYMBOLS: { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', ripple: 'XRP' }
};

async function fetchCoinData(coin) {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=60&interval=daily&x_cg_demo_api_key=${CONFIG.KEY}`);
    if (!res.ok) throw new Error(`API Rate Limit (${res.status})`);
    const data = await res.json();
    return {
        prices: data.prices.map(p => p[1]),
        volumes: data.total_volumes.map(v => v[1])
    };
}

function updateSystemTime() {
    const el = document.getElementById('sys-time');
    if (el) el.innerText = new Date().toLocaleTimeString();
}

async function performAnalysis() {
    try {
        const dataArray = await Promise.all(CONFIG.COINS.map(c => fetchCoinData(c)));
        let gridHtml = '';
        let totalScore = 0;

        dataArray.forEach((data, index) => {
            const coin = CONFIG.COINS[index];
            const prices = data.prices;
            const volumes = data.volumes;
            const currentPrice = prices[prices.length - 1];
            let score = 0;

            // F1: RSI
            const rsi = LogicEngine.calcRSI(prices);
            let rsiState = 'NEUTRAL';
            if (rsi < 30) { score += 1; rsiState = 'OVERSOLD'; }
            else if (rsi > 70) { score -= 1; rsiState = 'OVERBOUGHT'; }

            // F2: MACD
            const ema12 = LogicEngine.calcEMA(prices, 12);
            const ema26 = LogicEngine.calcEMA(prices, 26);
            const macdLine = ema12.map((val, i) => val - ema26[i]);
            const signalLine = LogicEngine.calcEMA(macdLine, 9);
            const hist = macdLine[macdLine.length - 1] - signalLine[signalLine.length - 1];
            if (hist > 0) score += 1; else score -= 1;

            // F3: SMA Trend
            const sma20 = LogicEngine.calcSMA(prices, 20);
            const sma50 = LogicEngine.calcSMA(prices, 50);
            if (sma20 > sma50) score += 1; else score -= 1;

            // F4: Bollinger
            const bb = LogicEngine.calcBollinger(prices);
            if (bb.pos < 0.2) score += 1; else if (bb.pos > 0.8) score -= 1;

            // F5: OBV
            const obv = LogicEngine.calcOBV(prices, volumes);
            if (obv > 0) score += 1; else score -= 1;

            totalScore += score;

            // Signal Mapping
            let sigLabel = DICT[currentLang].signals.hold;
            let sigClass = 'sig-hold';
            if (score >= 3) { sigLabel = DICT[currentLang].signals.sb; sigClass = 'sig-sb'; }
            else if (score >= 1) { sigLabel = DICT[currentLang].signals.buy; sigClass = 'sig-buy'; }
            else if (score <= -3) { sigLabel = DICT[currentLang].signals.ss; sigClass = 'sig-ss'; }
            else if (score <= -1) { sigLabel = DICT[currentLang].signals.sell; sigClass = 'sig-sell'; }

            const d = DICT[currentLang];
            gridHtml += `
                <div class="coin-box">
                    <div class="coin-name">${CONFIG.SYMBOLS[coin]}</div>
                    <div class="price">$${currentPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                    <div class="factor-list">
                        <div class="factor"><span class="f-label">${d.factors.rsi}</span><span class="f-val" style="color:${rsi>70?'#ff0055':(rsi<30?'#00ff88':'#aaa')}">${rsi.toFixed(1)}</span></div>
                        <div class="factor"><span class="f-label">${d.factors.macd}</span><span class="f-val" style="color:${hist>0?'#00ff88':'#ff0055'}">${hist>0?d.states.bull:d.states.bear}</span></div>
                        <div class="factor"><span class="f-label">${d.factors.sma}</span><span class="f-val" style="color:${sma20>sma50?'#00ff88':'#ff0055'}">${sma20>sma50?d.states.up:d.states.down}</span></div>
                        <div class="factor"><span class="f-label">${d.factors.bb}</span><span class="f-val">${bb.pos.toFixed(2)}</span></div>
                        <div class="factor"><span class="f-label">${d.factors.vol}</span><span class="f-val" style="color:${obv>0?'#00ff88':'#ff0055'}">${obv>0?d.states.in:d.states.out}</span></div>
                    </div>
                    <div class="final-signal ${sigClass}">${sigLabel} [${score}]</div>
                </div>
            `;
        });

        document.getElementById('coin-grid').innerHTML = gridHtml;

        // Overall Assessment
        let summary = '';
        const sumDict = DICT[currentLang].summaries;
        if (totalScore >= 10) summary = sumDict.max_bull;
        else if (totalScore >= 4) summary = sumDict.bull;
        else if (totalScore > -4) summary = sumDict.neutral;
        else if (totalScore > -10) summary = sumDict.bear;
        else summary = sumDict.max_bear;

        document.getElementById('overall-eval').innerText = summary;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';

    } catch (e) {
        console.error(e);
        document.getElementById('loading').innerHTML = `<div class="err-msg">ANALYSIS_FAILED: ${e.message}</div>`;
    }
}

// Boot
setInterval(updateSystemTime, 1000);
document.addEventListener('DOMContentLoaded', performAnalysis);
