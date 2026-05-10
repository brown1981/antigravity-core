/**
 * TACTICAL_BRIEFING: ORCHESTRATOR
 * Responsibilities: UI Synchronization, Intelligence Rendering
 */

function renderBriefing() {
    // Render Scenarios
    const scenarios = IntelligenceEngine.generateScenarios();
    const scContainer = document.getElementById('scenario-container');
    scContainer.innerHTML = scenarios.map(s => `
        <div class="scenario">
            <div class="sc-tag sc-${s.type}" id="case-${s.type}-tag">CASE_${s.type.toUpperCase()}</div>
            <div class="sc-title">${s.title}</div>
            <div class="sc-desc">${s.desc}</div>
        </div>
    `).join('');

    // Render Action Plan
    const actions = IntelligenceEngine.getActionPlan();
    const actionContainer = document.getElementById('action-container');
    actionContainer.innerHTML = actions.map(a => `
        <div class="action-item">
            <div class="action-label">${a.label}</div>
            <div class="action-desc">${a.desc}</div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    setLang('ja');
    renderBriefing();
    
    // Simulate periodic intelligence updates
    setInterval(() => {
        console.log("Refreshing Tactical Intelligence...");
        renderBriefing();
    }, 60000);
});
