/**
 * QUANT_SENTINEL: ORCHESTRATOR
 * Responsibilities: UI Synchronization, Chart Rendering, Scanner Flow
 */

function renderChart() {
    const container = document.getElementById('chart-area');
    const patterns = QuantEngine.getPatterns();
    
    container.innerHTML = `<div class="radar-scan"></div>`;
    
    patterns.forEach(p => {
        const div = document.createElement('div');
        div.className = p.type === 'OB' ? 'order-block' : 'fvg-zone';
        div.style.top = `${p.top}%`;
        div.style.height = `${p.height}%`;
        div.style.width = '100%';
        div.innerText = p.label;
        container.appendChild(div);
    });
}

function renderScanner() {
    const data = QuantEngine.getScannerData();
    const container = document.getElementById('scanner-list');
    container.innerHTML = data.map(d => `
        <div class="scan-item">
            <div class="scan-label">${d.asset}</div>
            <div class="scan-value">$${d.price}</div>
            <div class="scan-status">${d.setup} | PROB: ${d.prob}</div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    setLang('ja');
    renderChart();
    renderScanner();
    
    // Refresh simulation periodically
    setInterval(() => {
        renderScanner();
    }, 10000);
});
