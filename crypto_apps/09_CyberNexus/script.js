/**
 * CYBER_NEXUS: ORCHESTRATOR
 * Responsibilities: UI Synchronization, Node Rendering, Log Streaming
 */

function renderNodes() {
    const nodes = NexusEngine.getNodes();
    const container = document.getElementById('node-grid');
    container.innerHTML = nodes.map(n => `
        <div class="node ${n.isActive ? 'active' : ''} ${n.isPurified ? 'purified' : ''}">
            <div style="font-weight:bold;">${n.id}</div>
            <div style="font-size:0.5rem; margin-top:2px;">${n.name}</div>
        </div>
    `).join('');
}

function streamLog() {
    const packet = NexusEngine.getPackets();
    const container = document.getElementById('log-stream');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `[${packet.time}] <span>${packet.src}</span> >> <span>${packet.dst}</span> [${packet.size}] ${packet.status}`;
    
    container.prepend(entry);
    if (container.children.length > 50) container.lastChild.remove();
}

document.addEventListener('DOMContentLoaded', () => {
    renderNodes();
    setInterval(streamLog, 800);
});
