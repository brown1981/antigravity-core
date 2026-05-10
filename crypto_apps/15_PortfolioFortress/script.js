/**
 * PORTFOLIO_FORTRESS: ORCHESTRATOR
 * Responsibilities: UI Synchronization, Hexagonal Grid Placement, Risk Monitoring
 */

function renderShield() {
    const data = FortressEngine.getPortfolioData();
    const container = document.getElementById('shield-grid');
    
    container.innerHTML = data.assets.map(a => `
        <div class="hex" style="transform: translate(${a.pos.x}px, ${a.pos.y}px);">
            <div class="hex-label">${a.name}</div>
            <div class="hex-value">${a.value}</div>
        </div>
    `).join('');
    
    // Core Hex
    container.innerHTML += `
        <div class="hex" style="background:rgba(255,255,255,0.1); border-color:#fff; transform: scale(1.2);">
            <div class="hex-label">SHIELD</div>
            <div class="hex-value">${data.shieldIntegrity}%</div>
        </div>
    `;
}

function renderRisk() {
    const stress = FortressEngine.simulateStressTest();
    document.getElementById('market-crash').innerText = `${stress.marketCrash}%`;
    document.getElementById('fortress-survival').innerText = `${stress.fortressSurvival}%`;
}

document.addEventListener('DOMContentLoaded', () => {
    setLang('ja');
    renderShield();
    renderRisk();
});
