/**
 * ZEN_TRACKER: GAS ORACLE
 * Responsibilities: Real-time Gas Price Monitoring (Simulation)
 */

const GasOracle = {
    getGasData() {
        return {
            eth: {
                low: Math.floor(Math.random() * 5) + 12,
                med: Math.floor(Math.random() * 10) + 20,
                high: Math.floor(Math.random() * 20) + 40
            },
            base: Math.floor(Math.random() * 2) + 0.1
        };
    }
};

window.GasOracle = GasOracle;
