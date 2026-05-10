/**
 * LOGIC_SHIELD: MATHEMATICAL ENGINE
 * Responsibilities: Technical Indicator Algorithms
 */

const LogicEngine = {
    // 1. RSI (Relative Strength Index)
    calcRSI(prices, periods = 14) {
        if (prices.length <= periods) return 50;
        let gains = 0, losses = 0;
        for (let i = prices.length - periods; i < prices.length; i++) {
            const diff = prices[i] - prices[i - 1];
            if (diff >= 0) gains += diff; else losses -= diff;
        }
        if (losses === 0) return 100;
        const rs = (gains / periods) / (losses / periods);
        return 100 - (100 / (1 + rs));
    },

    // 2. EMA (Exponential Moving Average)
    calcEMA(prices, days) {
        const k = 2 / (days + 1);
        let ema = [prices[0]];
        for (let i = 1; i < prices.length; i++) {
            ema.push(prices[i] * k + ema[i - 1] * (1 - k));
        }
        return ema;
    },

    // 3. SMA (Simple Moving Average)
    calcSMA(prices, days) {
        const slice = prices.slice(-days);
        if (slice.length < days) return prices[prices.length - 1];
        return slice.reduce((a, b) => a + b, 0) / days;
    },

    // 4. Bollinger Bands (20 days, 2 StdDev)
    calcBollinger(prices) {
        const slice = prices.slice(-20);
        if (slice.length < 20) return { pos: 0.5, width: 0 };
        const sma = slice.reduce((a, b) => a + b, 0) / 20;
        const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / 20;
        const stdDev = Math.sqrt(variance);
        const lower = sma - (stdDev * 2);
        const upper = sma + (stdDev * 2);
        const current = prices[prices.length - 1];
        return { 
            pos: (current - lower) / (upper - lower), 
            width: (upper - lower) / sma 
        };
    },

    // 5. OBV (On-Balance Volume) Trend
    calcOBV(prices, volumes, periods = 7) {
        let obv = 0;
        const start = Math.max(1, prices.length - periods);
        for (let i = start; i < prices.length; i++) {
            if (prices[i] > prices[i - 1]) obv += volumes[i];
            else if (prices[i] < prices[i - 1]) obv -= volumes[i];
        }
        return obv;
    }
};

window.LogicEngine = LogicEngine;
