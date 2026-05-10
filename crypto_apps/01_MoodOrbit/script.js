const KEY = window.ANTIGRAVITY_CONFIG.COINGECKO_API_KEY;
let moodChartInstance = null;

async function fetchCoinGeckoData(coinId) {
    try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily&x_cg_demo_api_key=${KEY}`);
        const data = await res.json();
        const prices = data.prices.slice(-30).map(p => p[1]);
        const basePrice = prices[0];
        const pctChange = prices.map(p => ((p - basePrice) / basePrice) * 100);
        return { raw: prices, pct: pctChange };
    } catch (e) {
        console.error(`Failed to fetch ${coinId}:`, e);
        return { raw: Array(30).fill(0), pct: Array(30).fill(0) };
    }
}

async function initMoodOrbit() {
    try {
        // 1. Fear & Greed Index Fetch
        const fngRes = await fetch('https://api.alternative.me/fng/?limit=30');
        const fngData = await fngRes.json();
        const fngArray = fngData.data.reverse(); 
        
        const latestFng = fngArray[fngArray.length - 1];
        const currentFngValue = parseInt(latestFng.value);
        currentFngLabelRaw = latestFng.value_classification;
        
        // UI & Sphere Logic
        const sphere = document.getElementById('mood-sphere');
        const body = document.getElementById('app-body');
        const alertBanner = document.getElementById('red-alert');
        
        if (currentFngValue >= 75) {
            body.classList.add('alert-mode');
            alertBanner.style.display = 'block';
            sphere.style.background = 'linear-gradient(45deg, #ff4b2b, #8a0000)';
            sphere.style.boxShadow = '0 0 60px var(--accent-glow)';
        } else if (currentFngValue < 30) {
            sphere.style.background = 'linear-gradient(45deg, #00d2ff, #0055ff)';
            sphere.style.boxShadow = '0 0 40px var(--accent-glow)';
        } else {
            sphere.style.background = 'linear-gradient(45deg, #f8ff00, #3ad59f)';
        }
        
        // Apply initial translation
        setLang(currentLang);

        // 2. Market Data Fetch
        const [btc, eth, sol, xrp] = await Promise.all([
            fetchCoinGeckoData('bitcoin'),
            fetchCoinGeckoData('ethereum'),
            fetchCoinGeckoData('solana'),
            fetchCoinGeckoData('ripple')
        ]);

        // Update Price Boxes
        document.getElementById('p-btc').innerText = '$' + btc.raw[btc.raw.length-1].toLocaleString(undefined, {maximumFractionDigits: 0});
        document.getElementById('p-eth').innerText = '$' + eth.raw[eth.raw.length-1].toLocaleString(undefined, {maximumFractionDigits: 0});
        document.getElementById('p-sol').innerText = '$' + sol.raw[sol.raw.length-1].toLocaleString(undefined, {maximumFractionDigits: 2});
        document.getElementById('p-xrp').innerText = '$' + xrp.raw[xrp.raw.length-1].toLocaleString(undefined, {maximumFractionDigits: 4});

        // 3. Chart Rendering
        const dates = fngArray.map(item => {
            const d = new Date(item.timestamp * 1000);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });

        const ctx = document.getElementById('moodChart').getContext('2d');
        if (moodChartInstance) moodChartInstance.destroy();

        moodChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'F&G Index (0-100)',
                        data: fngArray.map(item => item.value),
                        borderColor: 'rgba(255,255,255,0.2)',
                        backgroundColor: currentFngValue >= 75 ? 'rgba(255, 75, 43, 0.15)' : 'rgba(0, 210, 255, 0.15)',
                        yAxisID: 'y',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    { label: 'BTC (%)', data: btc.pct, borderColor: '#f7931a', yAxisID: 'y1', tension: 0.3, borderWidth: 2, pointRadius: 1 },
                    { label: 'ETH (%)', data: eth.pct, borderColor: '#627eea', yAxisID: 'y1', tension: 0.3, borderWidth: 2, pointRadius: 1 },
                    { label: 'SOL (%)', data: sol.pct, borderColor: '#14f195', yAxisID: 'y1', tension: 0.3, borderWidth: 2, pointRadius: 1 },
                    { label: 'XRP (%)', data: xrp.pct, borderColor: '#23292f', yAxisID: 'y1', tension: 0.3, borderWidth: 2, pointRadius: 1, hidden: true }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { labels: { color: '#fff', font: { family: 'Outfit' }, usePointStyle: true, boxWidth: 8 } }
                },
                scales: {
                    x: { ticks: { color: 'rgba(255,255,255,0.3)' }, grid: { display: false } },
                    y: { 
                        type: 'linear', display: true, position: 'left',
                        ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.05)' },
                        min: 0, max: 100
                    },
                    y1: { 
                        type: 'linear', display: true, position: 'right',
                        ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { display: false }
                    }
                }
            }
        });

    } catch(e) { 
        console.error("Initialization Error:", e);
        document.getElementById('mood-sphere').innerText = "OFFLINE";
    }
}

// Start App
document.addEventListener('DOMContentLoaded', initMoodOrbit);
