/**
 * DCA_FORTRESS: CALCULATION ENGINE
 * Responsibilities: Average Price, Total Investment, Simulated Profit
 */

const DCAEngine = {
    calculate(monthlyAmount, durationMonths, startPrice, endPrice) {
        const totalInvested = monthlyAmount * durationMonths;
        
        // Simple linear simulation for demonstration
        // In a real app, this would use historical price data arrays
        const avgPrice = (startPrice + endPrice) / 2;
        const totalAssets = totalInvested / avgPrice;
        const currentValue = totalAssets * endPrice;
        const profitPct = ((currentValue - totalInvested) / totalInvested) * 100;

        return {
            totalInvested,
            totalAssets,
            currentValue,
            profitPct: profitPct.toFixed(2),
            avgPrice: avgPrice.toFixed(2)
        };
    }
};

window.DCAEngine = DCAEngine;
