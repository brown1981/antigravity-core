/**
 * GLOBAL_RADAR: MACRO ENGINE
 * Responsibilities: Market Stats, Trending Coins Fetching
 */

const MacroEngine = {
    async fetchGlobalStats() {
        const res = await fetch('https://api.coingecko.com/api/v3/global');
        const data = await res.json();
        return data.data;
    },

    async fetchTrending(apiKey) {
        const res = await fetch(`https://api.coingecko.com/api/v3/search/trending?x_cg_demo_api_key=${apiKey}`);
        const data = await res.json();
        return data.coins.slice(0, 3).map(c => c.item.symbol);
    }
};

window.MacroEngine = MacroEngine;
