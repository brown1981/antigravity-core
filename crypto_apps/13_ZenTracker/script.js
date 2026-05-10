/**
 * ZEN_TRACKER: ORCHESTRATOR
 * Responsibilities: UI Synchronization, Breathing Animation Timing
 */

function updateGasUI() {
    const data = GasOracle.getGasData();
    document.getElementById('eth-med').innerText = `${data.eth.med} Gwei`;
    document.getElementById('base-fee').innerText = `${data.base.toFixed(2)} Gwei`;
}

function updateZenUI() {
    const phase = ZenEngine.getNextPhase();
    // Use localized phase name if possible, or keep logic simple
    document.getElementById('zen-phase').innerText = phase === 'Exhale' ? 'Exhale' : DICT[currentLang].phase;
    
    // Update quote every full cycle
    if (phase === "Inhale") {
        const quotes = DICT[currentLang].quotes;
        document.getElementById('zen-quote').innerText = quotes[Math.floor(Math.random() * quotes.length)];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setLang('ja');
    updateGasUI();
    setInterval(updateGasUI, 5000);
    
    // Initial quote
    const quotes = DICT[currentLang].quotes;
    document.getElementById('zen-quote').innerText = quotes[Math.floor(Math.random() * quotes.length)];
    
    // Sync with 8s CSS animation (2s per phase approx)
    setInterval(updateZenUI, 2000);
});
