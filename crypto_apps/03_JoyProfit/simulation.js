/**
 * JOY_PROFIT: SIMULATION ENGINE
 * Responsibilities: Profit Calculation, Tax Shielding, Progress Ratio
 */

const ProfitEngine = {
    calculateAssetProfit(buyPrice, currentPrice, amount) {
        if (!currentPrice || currentPrice <= 0) return 0;
        return (currentPrice - buyPrice) * amount;
    },

    calculateFinalProfit(totalProfit, taxShieldEnabled) {
        if (taxShieldEnabled && totalProfit > 0) {
            return totalProfit * 0.70; // 30% Tax Shield
        }
        return totalProfit;
    },

    calculateProgress(finalProfit, goalPrice) {
        if (goalPrice <= 0 || finalProfit <= 0) return 0;
        let progress = (finalProfit / goalPrice) * 100;
        return Math.min(100, Math.max(0, progress));
    }
};

window.ProfitEngine = ProfitEngine;
