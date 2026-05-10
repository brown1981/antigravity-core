/**
 * GLOBAL_RADAR: ORCHESTRATOR
 * Responsibilities: Market Stats, Trending Coins, Global Pulse
 */

const KEY = window.ANTIGRAVITY_CONFIG.COINGECKO_API_KEY;

async function updateRadar() {
    try {
        const data = await MacroEngine.fetchGlobalStats();
        
        document.getElementById('dom-val').innerText = data.market_cap_percentage.btc.toFixed(1) + '%';
        document.getElementById('cap-val').innerText = '$' + (data.total_market_cap.usd / 1e12).toFixed(2) + 'T';
        document.getElementById('vol-val').innerText = '$' + (data.total_volume.usd / 1e9).toFixed(0) + 'B';

        const top3 = await MacroEngine.fetchTrending(KEY);
        document.getElementById('trend-val').innerText = top3.join(', ');

    } catch (e) {
        console.error("Global Radar Fetch Failed:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setLang('ja');
    updateRadar();
    setInterval(updateRadar, 120000);
});
