/**
 * DCA_FORTRESS: ORCHESTRATOR
 * Responsibilities: UI Binding, Simulation Flow
 */

window.runSimulation = function() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const months = parseInt(document.getElementById('months').value) || 0;
    const start = parseFloat(document.getElementById('start-price').value) || 0;
    const end = parseFloat(document.getElementById('end-price').value) || 0;

    const results = DCAEngine.simulate(amount, months, start, end);

    document.getElementById('val-invested').innerText = `$${results.invested.toLocaleString()}`;
    document.getElementById('val-value').innerText = `$${results.value.toLocaleString()}`;
    document.getElementById('val-profit').innerText = `${results.profit.toFixed(1)}%`;
    document.getElementById('val-avg').innerText = `$${results.avgPrice.toLocaleString()}`;
    
    document.getElementById('val-profit').style.color = results.profit >= 0 ? '#00ff88' : '#ff4b2b';
};

document.addEventListener('DOMContentLoaded', () => {
    setLang('ja');
    runSimulation();
});
