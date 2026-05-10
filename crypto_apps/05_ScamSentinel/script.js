/**
 * SCAM SENTINEL: ORCHESTRATOR
 * Responsibilities: Diagnosis Flow, Training Scenarios, UI Synchronization
 */

async function runDiagnostics() {
    const input = document.getElementById('token-addr');
    const addr = input.value.trim();
    if (!addr) return;

    const results = document.getElementById('results');
    const threat = document.getElementById('val-threat');
    
    results.style.display = 'grid';
    threat.innerText = LANG_DICT[currentLang].scanning;
    threat.style.background = 'transparent';
    threat.style.borderColor = 'var(--border)';

    try {
        const info = await SecurityAPI.scanToken(addr);
        updateUI(info);
    } catch (e) {
        threat.innerText = "ERROR: SCAN FAILED";
        threat.style.color = 'var(--risk)';
    }
}

function updateUI(info) {
    const hVal = document.getElementById('val-honey');
    const tVal = document.getElementById('val-tax');
    const oVal = document.getElementById('val-own');
    const sVal = document.getElementById('val-source');
    const threat = document.getElementById('val-threat');

    // Honeypot
    const isHoney = info.is_honeypot === "1";
    hVal.innerText = isHoney ? "DETECTED!" : "CLEAR";
    hVal.style.color = isHoney ? "var(--risk)" : "var(--safe)";

    // Tax
    const sellTax = parseFloat(info.sell_tax || 0);
    tVal.innerText = `${(sellTax * 100).toFixed(1)}%`;
    tVal.style.color = sellTax > 0.1 ? "var(--risk)" : "var(--safe)";

    // Ownership
    const isRenounced = info.owner_address === "0x0000000000000000000000000000000000000000";
    oVal.innerText = isRenounced ? "RENOUNCED" : "HELD";
    oVal.style.color = isRenounced ? "var(--safe)" : "var(--gold)";

    // Source Code
    const isOpen = info.is_open_source === "1";
    sVal.innerText = isOpen ? "OPEN" : "CLOSED";
    sVal.style.color = isOpen ? "var(--safe)" : "var(--risk)";

    // Threat Assessment
    const isDangerous = isHoney || sellTax > 0.5 || !isOpen;
    threat.innerText = isDangerous ? LANG_DICT[currentLang].riskHigh : LANG_DICT[currentLang].riskLow;
    threat.style.background = isDangerous ? "rgba(255, 75, 43, 0.1)" : "rgba(0, 255, 136, 0.1)";
    threat.style.borderColor = isDangerous ? "var(--risk)" : "var(--safe)";
    threat.style.color = isDangerous ? "var(--risk)" : "var(--safe)";
}

// Training & Help Functions
window.openModal = () => document.getElementById('modal').style.display = 'flex';
window.closeModal = () => document.getElementById('modal').style.display = 'none';

window.startTraining = (type) => {
    closeModal();
    document.getElementById('training-overlay').style.display = 'block';
    // Logic for scenarios...
};

window.stopTraining = () => {
    document.getElementById('training-overlay').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    setLang('ja');
});
