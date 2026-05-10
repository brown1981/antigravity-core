/**
 * WHALE SONAR: SIMULATION ENGINE
 * Responsibilities: Market Sentiment, Whale Generation, Divergence Calculation
 */

const SonarEngine = {
    sentiment: 50,
    totalWhalePressure: 0,

    simulateSentiment() {
        this.sentiment += (Math.random() - 0.5) * 12;
        if (this.sentiment < 10) this.sentiment = 10;
        if (this.sentiment > 95) this.sentiment = 95;
        return this.sentiment;
    },

    generateWhale() {
        const coins = ['BTC', 'ETH', 'SOL', 'XRP', 'LINK', 'USDT', 'USDC'];
        return {
            coin: coins[Math.floor(Math.random() * coins.length)],
            amount: Math.floor(Math.random() * 8000) + 500,
            isExchange: Math.random() > 0.45 // Slightly higher chance for exchange inflow simulation
        };
    },

    calculateDivergence(isExchange, amount) {
        // Divergence: Gap between Retail Hype (sentiment) and Whale Action (inflow/outflow)
        const pressure = isExchange ? amount : -amount;
        this.totalWhalePressure += (pressure / 1200);
        
        // Return score: (Whale Move) normalized by (Current Sentiment)
        return (this.totalWhalePressure / (this.sentiment / 10)).toFixed(2);
    }
};

window.SonarEngine = SonarEngine;
