const KEY = window.ANTIGRAVITY_CONFIG.COINGECKO_API_KEY;
const STORAGE_KEY = 'JOY_PROFIT_V3_DATA';

const COIN_DICT = {
    'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL', 'ripple': 'XRP',
    'cardano': 'ADA', 'dogecoin': 'DOGE', 'polkadot': 'DOT', 'chainlink': 'LINK'
};

let appData = {
    goalName: 'Rolex Submariner', goalPrice: 15000, taxShield: false,
    assets: [ { coin: 'bitcoin', buyPrice: 40000, amount: 0.1 } ]
};

let currentMarketPrices = {};
let epicFired = false;

function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved) {
        try { appData = JSON.parse(saved); } catch(e) { console.error("Data parse error"); }
    }
    
    document.getElementById('goal-name').value = appData.goalName;
    document.getElementById('goal-price').value = appData.goalPrice;
    document.getElementById('tax-toggle').checked = appData.taxShield;

    // Listeners
    document.getElementById('goal-name').addEventListener('input', updateData);
    document.getElementById('goal-price').addEventListener('input', updateData);
    document.getElementById('tax-toggle').addEventListener('change', updateData);
    document.getElementById('btn-add').addEventListener('click', addAsset);
    document.getElementById('btn-calc').addEventListener('click', () => calculateProfits(true));

    setLang(currentLang);
    calculateProfits(true); 
}

function updateData() {
    appData.goalName = document.getElementById('goal-name').value;
    appData.goalPrice = parseFloat(document.getElementById('goal-price').value) || 0;
    appData.taxShield = document.getElementById('tax-toggle').checked;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    calculateProfits(false);
}

function renderPortfolio() {
    const container = document.getElementById('portfolio-container');
    container.innerHTML = '';
    document.getElementById('btn-add').disabled = (appData.assets.length >= 10);

    appData.assets.forEach((asset, index) => {
        const row = document.createElement('div');
        row.className = 'asset-row';
        
        let selectHtml = `<select onchange="updateAsset(${index}, 'coin', this.value)">`;
        for(let key in COIN_DICT) selectHtml += `<option value="${key}" ${asset.coin === key ? 'selected' : ''}>${COIN_DICT[key]}</option>`;
        selectHtml += `</select>`;

        row.innerHTML = `
            <div class="asset-input"><label>${LANG_DICT[currentLang].assetCol}</label><br>${selectHtml}</div>
            <div class="asset-input"><label>${LANG_DICT[currentLang].priceCol}</label><br><input type="number" value="${asset.buyPrice}" onchange="updateAsset(${index}, 'buyPrice', this.value)"></div>
            <div class="asset-input"><label>${LANG_DICT[currentLang].amountCol}</label><br><input type="number" step="0.01" value="${asset.amount}" onchange="updateAsset(${index}, 'amount', this.value)"></div>
            <div class="profit-col" id="profit-display-${index}">$0.00</div>
            <div><button class="del-btn" onclick="removeAsset(${index})">×</button></div>
        `;
        container.appendChild(row);
    });
}

window.addAsset = function() {
    if(appData.assets.length >= 10) return;
    appData.assets.push({ coin: 'ethereum', buyPrice: 2000, amount: 1 });
    renderPortfolio();
    updateData();
}

window.removeAsset = function(index) {
    appData.assets.splice(index, 1);
    renderPortfolio();
    updateData();
}

window.updateAsset = function(index, field, value) {
    if(field === 'coin') appData.assets[index][field] = value;
    else appData.assets[index][field] = parseFloat(value) || 0;
    updateData();
}

async function calculateProfits(fetchNewData = true) {
    const btn = document.getElementById('btn-calc');
    if (fetchNewData) {
        btn.innerText = "FETCHING MARKET DATA...";
        try {
            const uniqueCoins = [...new Set(appData.assets.map(a => a.coin))];
            if (uniqueCoins.length > 0) {
                const url = `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueCoins.join(',')}&vs_currencies=usd&x_cg_demo_api_key=${KEY}`;
                const res = await fetch(url);
                currentMarketPrices = await res.json();
            }
            btn.innerText = LANG_DICT[currentLang].btnCalc;
        } catch(e) {
            console.error(e);
            btn.innerText = "API LIMIT REACHED";
            return;
        }
    }

    let totalProfit = 0;
    appData.assets.forEach((asset, index) => {
        const currentPrice = currentMarketPrices[asset.coin] ? currentMarketPrices[asset.coin].usd : 0;
        const rowProfit = ProfitEngine.calculateAssetProfit(asset.buyPrice, currentPrice, asset.amount);
        
        const display = document.getElementById(`profit-display-${index}`);
        if(display) {
            display.innerText = `${rowProfit >= 0 ? '+' : ''}$${rowProfit.toLocaleString(undefined, {minimumFractionDigits:2})}`;
            display.className = `profit-col ${rowProfit >= 0 ? 'profit-positive' : 'profit-negative'}`;
        }
        totalProfit += rowProfit;
    });

    const finalProfit = ProfitEngine.calculateFinalProfit(totalProfit, appData.taxShield);
    const progress = ProfitEngine.calculateProgress(finalProfit, appData.goalPrice);

    document.getElementById('total-profit-display').innerText = `${finalProfit >= 0 ? '+' : ''}$${finalProfit.toLocaleString(undefined, {minimumFractionDigits:2})}`;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('progress-text').innerText = `${progress.toFixed(1)}%`;

    if (progress >= 100) {
        document.getElementById('progress-text').innerText = LANG_DICT[currentLang].goalReached;
        triggerEpicUnlock();
    }
}

function triggerEpicUnlock() {
    if(epicFired) return;
    epicFired = true;
    document.getElementById('epic-goal-name').innerText = appData.goalName.toUpperCase() || 'OBJECTIVE';
    document.getElementById('epic-overlay').classList.add('active');
}

window.closeEpic = function() {
    document.getElementById('epic-overlay').classList.remove('active');
    setTimeout(() => { epicFired = false; }, 2000);
}

document.addEventListener('DOMContentLoaded', init);
