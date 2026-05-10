/**
 * WHALE SONAR: ORCHESTRATOR
 * Responsibilities: Radar UI, Blip Management, Integration
 */

let logs = [];
let trainingInterval = null;

function createBlip(whale) {
    const layer = document.getElementById('blip-layer');
    const blip = document.createElement('div');
    blip.className = 'whale-blip';
    
    // Random polar coordinates within radar
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 240;
    const x = 280 + radius * Math.cos(angle);
    const y = 280 + radius * Math.sin(angle);
    
    blip.style.left = `${x}px`;
    blip.style.top = `${y}px`;
    
    if (whale.isExchange) {
        blip.style.background = 'var(--sonar-red)';
        blip.style.boxShadow = '0 0 20px var(--sonar-red)';
    }

    const info = document.createElement('div');
    info.className = 'blip-info';
    info.innerText = `${whale.coin}: ${whale.amount.toLocaleString()}`;
    blip.appendChild(info);

    layer.appendChild(blip);
    
    // Logging
    const time = new Date().toLocaleTimeString();
    const action = whale.isExchange ? LANG_DICT[currentLang].exchange : LANG_DICT[currentLang].wallet;
    logs.unshift({ time, coin: whale.coin, amount: whale.amount, action });
    if (logs.length > 15) logs.pop();
    renderLogs();

    // Divergence Update
    const divScore = SonarEngine.calculateDivergence(whale.isExchange, whale.amount);
    updateStats(divScore);

    setTimeout(() => blip.remove(), 6000);
}

function renderLogs() {
    const container = document.getElementById('log');
    container.innerHTML = logs.map(l => `
        <div class="log-entry">
            <span style="color:#555;">[${l.time}]</span> 
            <span style="color:var(--sonar-green); font-weight:bold;">${l.coin}</span> 
            <span>${l.amount.toLocaleString()}</span>
            <div style="font-size:0.6rem; opacity:0.5;">${l.action}</div>
        </div>
    `).join('');
}

function updateStats(divScore) {
    const display = document.getElementById('div-score');
    display.innerText = divScore;
    
    const statusVal = document.getElementById('status-val');
    if (Math.abs(divScore) > 8) {
        display.style.color = 'var(--sonar-red)';
        statusVal.innerText = LANG_DICT[currentLang].alert;
        statusVal.style.color = 'var(--sonar-red)';
    } else {
        display.style.color = 'var(--sonar-green)';
        statusVal.innerText = LANG_DICT[currentLang].scanning;
        statusVal.style.color = 'var(--sonar-green)';
    }
}

function updateSentimentUI() {
    const s = SonarEngine.simulateSentiment();
    const fill = document.getElementById('gauge-fill');
    fill.style.height = `${s}%`;
    
    if (s > 75) fill.style.background = 'var(--sonar-red)';
    else if (s < 30) fill.style.background = 'var(--sonar-blue)';
    else fill.style.background = 'var(--sonar-green)';
}

// Training Functions
window.openModal = () => document.getElementById('modal').style.display = 'flex';
window.closeModal = () => document.getElementById('modal').style.display = 'none';

window.startTraining = (type) => {
    closeModal();
    document.getElementById('training-overlay').style.display = 'block';
    // Logic for specific training scenarios...
};

window.stopTraining = () => {
    document.getElementById('training-overlay').style.display = 'none';
};

// Main Loop
document.addEventListener('DOMContentLoaded', () => {
    setLang('ja');
    setInterval(updateSentimentUI, 3000);
    setInterval(() => {
        if (document.getElementById('training-overlay').style.display !== 'block') {
            createBlip(SonarEngine.generateWhale());
        }
    }, 5000);
});
