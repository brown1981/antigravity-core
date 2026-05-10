// === PHASE 2: DYNAMIC THRESHOLD ENGINE ===
function computeGrades(allCoins) {
    const changes = allCoins.map(c => c.change1h);
    const avg1h = changes.reduce((s, v) => s + v, 0) / (changes.length || 1);
    const std1h = Math.sqrt(changes.reduce((s, v) => s + (v - avg1h) ** 2, 0) / (changes.length || 1));
    
    const thresholdS = Math.max(2.0, avg1h + 1.5 * std1h);
    const thresholdA = Math.max(1.5, avg1h + 1.0 * std1h);
    const thresholdB = Math.max(1.0, avg1h + 0.5 * std1h);

    const filters = getFilterState();

    allCoins.forEach(c => {
        const inRange = c.rank > 20 && c.rank < 800;
        const inRangeWide = c.rank > 20 && c.rank < 900;

        const isGoldenBottom = c.change7d < -10 && c.change1h >= thresholdA && c.change24h < 5;
        const isEarlyIgnition = c.change1h >= thresholdS && c.change1h < 8 && c.change24h < 5;
        
        let grade = null;
        if (inRange && (isGoldenBottom || isEarlyIgnition)) grade = 'S';
        else if (inRangeWide && c.change1h >= thresholdA && c.change1h < 12 && c.change24h < 15) grade = 'A';
        else if (inRangeWide && c.change1h >= thresholdB && c.change24h >= 15 && c.change24h < 40) grade = 'B';
        else if (inRangeWide && c.change24h >= 30) grade = 'X';

        if (grade === 'S' && !filters.showS) grade = null;
        if (grade === 'A' && !filters.showA) grade = null;
        if (grade === 'B' && !filters.showB) grade = null;
        if (grade === 'X' && !filters.showX) grade = null;
        if (filters.goldenOnly && grade === 'S' && !isGoldenBottom) grade = null;

        c.applyGrade(grade);
    });

    updateEruptionPanel(allCoins);
}

function getFilterState() {
    return {
        showS: document.getElementById('filter-s').checked,
        showA: document.getElementById('filter-a').checked,
        showB: document.getElementById('filter-b').checked,
        showX: document.getElementById('filter-x').checked,
        goldenOnly: document.getElementById('filter-golden').checked
    };
}

function applyFilters() {
    if (!window.coins || window.coins.length === 0) return;
    saveFilterState(); // Persist choices
    computeGrades(window.coins);
    updateIgnitionList();
}
