(function() {
    // Basic Constants
    const AVG_BTC_DAY_UNIT = 0.00002393;
    const UNITS = 2;
    const DAYS_MONTH = 30;
    const EXP_FIXED = 111000;
    const REPAYMENT = 37333;

    let currentBtcRate = 14000000;
    let selectedScenario = 'standard';

    const SCENARIOS = {
        optimistic: { label: '楽観', btcMult: 1.2, app: 80000, heat: 50000, color: '#3b82f6' },
        standard:   { label: '標準', btcMult: 1.0, app: 50000, heat: 20000, color: '#8b5cf6' },
        pessimistic: { label: '悲観', btcMult: 0.7, app: 30000, heat: 0,     color: '#f59e0b' },
        worst:       { label: '最悪', btcMult: 0.5, app: 0,     heat: 0,     color: '#ef4444' }
    };

    function fmt(n) { return Math.floor(n).toLocaleString('ja-JP'); }

    function calculate() {
        const scenarioData = [];
        
        Object.keys(SCENARIOS).forEach(key => {
            const s = SCENARIOS[key];
            const miningBtc = AVG_BTC_DAY_UNIT * UNITS * DAYS_MONTH * s.btcMult;
            const revMining = miningBtc * currentBtcRate;
            const revTotal = revMining + s.app + s.heat;
            const netProfit = revTotal - EXP_FIXED;
            const freeCash = netProfit - REPAYMENT;

            scenarioData.push({
                key,
                ...s,
                miningBtc,
                revMining,
                revTotal,
                netProfit,
                freeCash
            });

            if (key === selectedScenario) {
                updateDetails({
                    revMining,
                    revApp: s.app,
                    revHeat: s.heat,
                    revTotal,
                    netProfit,
                    freeCash
                });
            }
        });

        renderScenarioCards(scenarioData);
    }

    function updateDetails(d) {
        document.getElementById('revMining').textContent = `¥${fmt(d.revMining)}`;
        document.getElementById('revApp').textContent = `¥${fmt(d.revApp)}`;
        document.getElementById('revHeat').textContent = `¥${fmt(d.revHeat)}`;
        document.getElementById('revTotal').textContent = `¥${fmt(d.revTotal)}`;
        
        const netEl = document.getElementById('netProfit');
        netEl.textContent = `¥${fmt(d.netProfit)}`;
        netEl.style.color = d.netProfit >= 0 ? '#10b981' : '#ef4444';

        const freeEl = document.getElementById('freeCash');
        freeEl.textContent = `¥${fmt(d.freeCash)}`;
        freeEl.style.color = d.freeCash >= 0 ? '#10b981' : '#ef4444';

        const finalCard = document.querySelector('.final-card');
        const noteEl = document.getElementById('safetyNote');
        
        if (d.freeCash >= 50000) {
            noteEl.textContent = '極めて安全';
            finalCard.classList.remove('alert');
        } else if (d.freeCash >= 0) {
            noteEl.textContent = '安全（本業補填不要）';
            finalCard.classList.remove('alert');
        } else {
            noteEl.textContent = '要・本業給与補填';
            finalCard.classList.add('alert');
        }
    }

    function renderScenarioCards(data) {
        const grid = document.getElementById('scenarioGrid');
        grid.innerHTML = '';

        data.forEach(d => {
            const card = document.createElement('div');
            card.className = `scenario-card ${d.key === selectedScenario ? 'active' : ''}`;
            card.onclick = () => {
                selectedScenario = d.key;
                const btns = document.querySelectorAll('.tab-controls button');
                btns.forEach(b => {
                    b.classList.remove('active');
                    if (b.getAttribute('onclick').includes(d.key)) b.classList.add('active');
                });
                calculate();
            };

            card.innerHTML = `
                <h4>${d.label}</h4>
                <div class="profit ${d.freeCash >= 0 ? 'plus' : 'minus'}">
                    ${d.freeCash >= 0 ? '+' : ''}${fmt(d.freeCash)}
                </div>
                <div class="cf-note">最終手残り</div>
            `;
            grid.appendChild(card);
        });
    }

    // Global selector for tabs
    window.setScenario = function(key) {
        selectedScenario = key;
        calculate();
    };

    // Events
    const slider = document.getElementById('btcRateSlider');
    const btcVal = document.getElementById('btcRateVal');

    slider.oninput = function() {
        currentBtcRate = parseInt(this.value);
        btcVal.textContent = `¥${currentBtcRate.toLocaleString('ja-JP')}`;
        calculate();
    };

    // Initial Run
    calculate();
})();
