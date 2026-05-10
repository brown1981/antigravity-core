/**
 * TEAM_SPIRIT: ORCHESTRATOR
 * Responsibilities: UI Synchronization, Gem Rendering, Sync Visualization
 */

function renderGems() {
    const gems = BoardroomEngine.getGems();
    const container = document.getElementById('gem-grid');
    const d = DICT[currentLang].gems;
    
    container.innerHTML = gems.map(g => {
        const info = d[g.id];
        return `
            <div class="gem-card">
                <div class="gem-icon">${g.icon}</div>
                <div class="gem-name">${info.name}</div>
                <div class="gem-role">${info.role}</div>
                <div class="gem-desc">${info.desc}</div>
                <div class="gem-stat">
                    <span>SYNC_LEVEL</span>
                    <span style="color:var(--amber); font-weight:bold;">${g.sync}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-fill" style="width:${g.sync}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderStats() {
    const stats = BoardroomEngine.getSystemStats();
    document.getElementById('total-sync').innerText = `${stats.totalSync}%`;
    
    // Update Progress Bars for Layers
    const bars = document.querySelectorAll('.matrix-section .progress-fill');
    bars[0].style.width = stats.layers.l1 + '%';
    bars[1].style.width = stats.layers.l2 + '%';
    bars[2].style.width = stats.layers.l3 + '%';
}

document.addEventListener('DOMContentLoaded', () => {
    setLang('ja');
    renderStats();
});
