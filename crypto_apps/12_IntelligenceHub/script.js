/**
 * INTELLIGENCE_HUB: ORCHESTRATOR
 * Responsibilities: UI Synchronization, Archive Rendering, Monitor Updates
 */

function renderArchives() {
    const archives = HarvesterEngine.getArchives();
    const container = document.getElementById('archive-list');
    container.innerHTML = archives.map(a => `
        <div class="report-item">
            <div class="report-meta">${a.date} | INTELLIGENCE_REPORT</div>
            <div class="report-title">${a.title}</div>
            <div class="report-excerpt">${a.excerpt}</div>
        </div>
    `).join('');
}

function updateMonitor() {
    const status = HarvesterEngine.getStatus();
    const sourceContainer = document.getElementById('source-list');
    
    document.getElementById('status-text').innerText = status.isLive ? 'SYSTEM_LIVE' : 'OFFLINE';
    document.getElementById('uptime-val').innerText = status.uptime;

    sourceContainer.innerHTML = status.sources.map(s => `
        <div class="source-item">
            ${s.name} <span>${s.status}</span>
        </div>
    `).join('');
}

function triggerSync() {
    const btn = document.getElementById('sync-btn');
    btn.innerText = "SYNCHRONIZING...";
    btn.style.opacity = "0.5";
    
    setTimeout(() => {
        btn.innerText = "MANUAL_HARVEST_SYNC";
        btn.style.opacity = "1";
        renderArchives();
        alert(currentLang === 'ja' ? "同期完了: 知識アーカイブが更新されました。" : "Sync Complete: Knowledge Archive updated.");
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    setLang('ja');
    renderArchives();
    updateMonitor();
});

window.triggerSync = triggerSync;
