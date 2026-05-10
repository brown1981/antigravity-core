// === APP INITIALIZATION & UI CONTROLLER ===
const dataStatus = document.getElementById('data-status');
window.coins = []; 

// SECURITY: Simple Passcode Logic
const ACCESS_KEY = "J0hn1enn0n"; 
let isAuthorized = localStorage.getItem('altHunter_auth') === 'true';

function checkPasscode() {
    const input = document.getElementById('passcode-input').value;
    if (input === ACCESS_KEY) {
        isAuthorized = true;
        localStorage.setItem('altHunter_auth', 'true');
        document.getElementById('auth-gate').style.display = 'none';
        fetchData();
    } else {
        alert("ACCESS_DENIED: Invalid Command Code");
    }
}

// Initial check
window.addEventListener('DOMContentLoaded', () => {
    if (isAuthorized) {
        document.getElementById('auth-gate').style.display = 'none';
        fetchData();
    }
    loadFilterState();
});

function saveFilterState() {
    const state = {
        s: document.getElementById('filter-s').checked,
        a: document.getElementById('filter-a').checked,
        b: document.getElementById('filter-b').checked,
        x: document.getElementById('filter-x').checked,
        golden: document.getElementById('filter-golden').checked
    };
    localStorage.setItem('altHunter_filters', JSON.stringify(state));
}

function loadFilterState() {
    const saved = localStorage.getItem('altHunter_filters');
    if (saved) {
        const state = JSON.parse(saved);
        document.getElementById('filter-s').checked = state.s;
        document.getElementById('filter-a').checked = state.a;
        document.getElementById('filter-b').checked = state.b;
        document.getElementById('filter-x').checked = state.x;
        document.getElementById('filter-golden').checked = state.golden;
    }
}

function updateEruptionPanel(allCoins) {
    const el = document.getElementById('eruption-list');
    const eruptions = allCoins
        .filter(c => c.change24h >= 30 && c.rank > 20 && c.rank < 900)
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 3);

    if (eruptions.length === 0) {
        el.innerHTML = `<div style="font-size:0.75rem; opacity:0.4;">${t('no_eruption')}</div>`;
        return;
    }

    el.innerHTML = eruptions.map(c => `
        <a href="https://www.coingecko.com/en/coins/${c.name.toLowerCase().replace(/ /g, '-')}" target="_blank" class="eruption-item" style="text-decoration:none; color:inherit; display:flex; justify-content:space-between;">
            <span class="sym">${c.symbol} <span style="opacity:0.4; font-weight:400;">#${c.rank}</span></span>
            <span class="pct">+${c.change24h.toFixed(1)}%</span>
        </a>
    `).join('');
}

function updateIgnitionList() {
    const listEl = document.getElementById('ignition-list');
    if (!window.coins) return;

    const gainerCount = window.coins.filter(c => c.change24h > 0).length;
    document.getElementById('gainer-count').textContent = gainerCount + ' / ' + window.coins.length;
    
    const avgChange = window.coins.reduce((s, c) => s + c.change1h, 0) / (window.coins.length || 1);
    const sentimentEl = document.getElementById('sentiment');
    if (avgChange > 1) { sentimentEl.textContent = t('bullish'); sentimentEl.style.color = '#00ffcc'; }
    else if (avgChange > 0) { sentimentEl.textContent = t('neutral'); sentimentEl.style.color = '#ffcc00'; }
    else { sentimentEl.textContent = t('bearish'); sentimentEl.style.color = '#ff4444'; }

    function compositeScore(c) {
        return c.change1h + (c.change24h < 0 ? Math.abs(c.change24h) * 0.2 : 0);
    }

    const gradeConfig = [
        { key: 'S', label: t('grade_s'), max: Infinity, css: 'gsh-s' },
        { key: 'A', label: t('grade_a'), max: 5, css: 'gsh-a' },
        { key: 'B', label: t('grade_b'), max: 2, css: 'gsh-b' },
        { key: 'X', label: t('grade_x'), max: 1, css: 'gsh-x' }
    ];

    listEl.innerHTML = '';
    let totalShown = 0;
    let globalIndex = 1;

    gradeConfig.forEach(gc => {
        const items = window.coins
            .filter(c => c.grade === gc.key)
            .sort((a, b) => compositeScore(b) - compositeScore(a))
            .slice(0, gc.max);

        if (items.length === 0) return;

        const totalInGrade = window.coins.filter(c => c.grade === gc.key).length;
        const header = document.createElement('div');
        header.className = 'grade-section-header ' + gc.css;
        header.innerHTML = `<span>${gc.label}</span><span class="count">${items.length}${totalInGrade > items.length ? ' / ' + totalInGrade : ''}</span>`;
        listEl.appendChild(header);

        items.forEach(c => {
            const item = document.createElement('a');
            item.href = `https://www.coingecko.com/en/coins/${c.name.toLowerCase().replace(/ /g, '-')}`;
            item.target = '_blank';
            item.className = 'ignition-item grade-' + c.grade.toLowerCase();

            const { reason, action } = generateReason(c);
            const gradeColors = { S: 'var(--gold)', A: 'var(--orange)', B: 'var(--cyan)', X: 'var(--eruption)' };
            const changeColor = c.change1h >= 0 ? gradeColors[c.grade] : 'var(--danger)';

            item.innerHTML = `
                <div class="ign-header">
                    <span class="ign-title">#${globalIndex} ${c.symbol}</span>
                    <span class="ign-badge ${c.grade.toLowerCase()}">GRADE ${c.grade}</span>
                </div>
                <div class="ign-stats">
                    <span style="color:${changeColor}">1h: ${c.change1h >= 0 ? '+' : ''}${c.change1h.toFixed(1)}%</span>
                    <span style="color:${c.change24h >= 0 ? 'rgba(255,255,255,0.6)' : 'var(--danger)'}">24h: ${c.change24h >= 0 ? '+' : ''}${c.change24h.toFixed(1)}%</span>
                    <span style="color:${c.change7d >= 0 ? 'rgba(255,255,255,0.4)' : 'var(--danger)'}">7d: ${c.change7d >= 0 ? '+' : ''}${c.change7d.toFixed(0)}%</span>
                    <span style="opacity:0.4">#${c.rank}</span>
                </div>
                <div class="ign-reason">${reason}</div>
                <div class="ign-action" style="color:${gradeColors[c.grade]}">${action}</div>
            `;
            listEl.appendChild(item);
            globalIndex++;
            totalShown++;
        });
    });

    if (totalShown === 0) {
        listEl.innerHTML = `<p style="font-size:0.75rem; opacity:0.5;">${t('no_ignition')}</p>`;
    }
}

async function fetchData() {
    if (!isAuthorized) return;

    dataStatus.innerText = t('status_connecting');
    const workerUrl = 'https://nexus-data-bridge.do-the-carpe-diem.workers.dev';

    try {
        const response = await fetch(workerUrl);
        if (response.ok) {
            const data = await response.json();
            const validData = data.filter(c => c && c.rank);
            window.coins = validData.map(c => new Bubble(c));
            
            computeGrades(window.coins);
            updateIgnitionList();
            
            dataStatus.innerText = t('status_live');
            dataStatus.style.color = '#00ffcc';
        } else {
            throw new Error('Worker returned error');
        }
    } catch (e) {
        console.error("Bridge Connection Failed:", e);
        dataStatus.innerText = t('status_offline');
        dataStatus.style.color = '#ff4444';
    }
}

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
    if (!isAuthorized) {
        if (e.key === 'Enter') checkPasscode();
        return;
    }

    const key = e.key.toLowerCase();
    if (key === '1') {
        document.getElementById('filter-s').checked = true;
        document.getElementById('filter-a').checked = false;
        document.getElementById('filter-b').checked = false;
        document.getElementById('filter-x').checked = false;
        applyFilters();
    } else if (key === '2') {
        document.getElementById('filter-s').checked = true;
        document.getElementById('filter-a').checked = true;
        document.getElementById('filter-b').checked = false;
        document.getElementById('filter-x').checked = false;
        applyFilters();
    } else if (key === '3') {
        document.getElementById('filter-s').checked = true;
        document.getElementById('filter-a').checked = true;
        document.getElementById('filter-b').checked = true;
        document.getElementById('filter-x').checked = true;
        applyFilters();
    } else if (key === 'g') {
        const cb = document.getElementById('filter-golden');
        cb.checked = !cb.checked;
        applyFilters();
    }
});
