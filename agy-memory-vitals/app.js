/**
 * Antigravity | Neural Dashboard V9 (Final Polish & Synthesis)
 */

document.addEventListener('DOMContentLoaded', () => {
    initV9State();
    initV9Neural();
    renderV9Data();
    initV9Modal();
    startV9Typewriter();

    // V14.1 Crystalline Integration: Dynamic Boot Sequence
    setTimeout(() => {
        const badge = document.querySelector('.badge-v9');
        if (badge) {
            badge.classList.remove('initializing');
            badge.classList.add('active-pulse');
        }
        if (window.memoryInspector) {
            window.memoryInspector.log("NEURAL LINK SECURED: V14.1 CRYSTALLINE ACTIVE", "success");
            window.memoryInspector.log("AESTHETIC HARMONY SYNCHRONIZED", "info");
        }
    }, 1500);
});

// 1. Controller
function initV9State() {
    const root = document.documentElement;
    const hero = document.getElementById('stage-hero');
    const dash = document.getElementById('stage-dash');
    const toggle = document.getElementById('theme-toggle');

    const saved = localStorage.getItem('agy-v9-theme') || 'dark';
    root.setAttribute('data-theme', saved);

    toggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('agy-v9-theme', next);
        if (window.engine) window.engine.updatePalette(next);
    });

    const update = () => {
        const h = document.body.scrollHeight - window.innerHeight;
        const p = h > 0 ? Math.min(Math.max(window.scrollY / h, 0), 1) : 0;
        
        // --- STAGE ISOLATION & TRANSITION (V10.9) ---
        const hero = document.getElementById('stage-hero');
        const dash = document.getElementById('stage-dash');
        const auto = document.getElementById('stage-auto');

        // Stage 1: Hero (0% -> 35%)
        if (p < 0.35) {
            hero.style.display = 'flex';
            hero.style.visibility = 'visible';
            hero.style.opacity = Math.max(0, 1 - (p * 2.85));
            hero.style.transform = `scale(${1 - p * 0.1})`;
        } else {
            hero.style.display = 'none';
        }

        // Stage 2: Dashboard (35% -> 75%)
        if (p >= 0.35 && p < 0.75) {
            const pDash = (p - 0.35) / 0.15; // Transition window
            const pExit = (p - 0.65) / 0.10; // Exit window
            dash.style.display = 'flex';
            dash.style.visibility = 'visible';
            
            if (p < 0.65) {
                dash.style.opacity = Math.min(1, pDash);
            } else {
                dash.style.opacity = Math.max(0, 1 - pExit);
            }
            dash.style.transform = `translateY(${(1 - p) * 20}px)`;
        } else {
            dash.style.display = 'none';
        }

        // Stage 3: Automation (75% -> 100%)
        if (p >= 0.75) {
            const pAuto = (p - 0.75) / 0.20;
            auto.style.display = 'flex';
            auto.style.visibility = 'visible';
            auto.style.opacity = Math.min(1, pAuto);
            auto.style.transform = `scale(${0.95 + pAuto * 0.05})`;
        } else {
            auto.style.display = 'none';
        }

        window.scrollProgress = p;
        requestAnimationFrame(update);
    };

    // Intuition: Click stage to dive
    hero.addEventListener('click', () => {
        window.scrollTo({ top: window.innerHeight * 2.5, behavior: 'smooth' });
    });

    // Logo click to top
    document.querySelector('.logo').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    update();
}

// 2. Neural Synthesis (V14.0 Delegate)
function initV9Neural() { 
    // V14.0 Steel Symphony: Initializing the isolated Neural Engine
    window.engine = new NeuralEngine('neural-canvas'); 
}

// 3. Modal 
function initV9Modal() {
    const modal = document.getElementById('modal-v9');
    const close = document.getElementById('close-v9');
    close.onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
    window.openModal = (header, content) => {
        document.getElementById('m-title').textContent = header;
        document.getElementById('m-body').innerHTML = content;
        modal.classList.add('active');
    };
}

// 4. Rule Sync & Render
function renderV9Data() {
    if (typeof VITALS_DATA === 'undefined') return;
    const d = VITALS_DATA;

    // Correct Rules Parsing: Robust split and filter
    const rList = document.getElementById('r-list');
    const rulesSource = d.constitution || "";
    const sections = rulesSource.split('##').filter(s => s.trim().length > 0 && !s.includes('GLOBAL RULES'));
    
    rList.innerHTML = sections.map(s => {
        const lines = s.trim().split('\n');
        const title = lines[0] ? lines[0].trim() : "Unknown Section";
        const content = lines.slice(1).join('<br>').trim() || "No content available.";
        return `
            <div class="v9-item" onclick="openModal('${title}', '${content.replace(/'/g, "\\'")}')">
                <h4>${title}</h4>
                <div class="expand-icon"></div>
            </div>
        `;
    }).join('');

    // Memory
    document.getElementById('m-list').innerHTML = d.memories.map(m => `
        <div class="v9-item" onclick="openModal('${m.title}', '${m.summary.replace(/'/g, "\\'")}')">
            <h4>${m.title}</h4>
            <div class="expand-icon"></div>
        </div>
    `).join('');

    // Logs
    document.getElementById('l-list').innerHTML = d.thought_trace.reverse().map(l => `
        <div class="v9-item" onclick="openModal('${l.time}', '${l.decision.replace(/'/g, "\\'")}')">
            <h4>${l.time}</h4>
            <div class="expand-icon"></div>
        </div>
    `).join('');

    // Metrics
    document.getElementById('pg-fill').style.width = d.system_info.cognitive_load + '%';
    document.getElementById('pg-val').textContent = d.system_info.cognitive_load + '%';
}

function startV9Typewriter() {
    const s = "ANTIGRAVITY: SYNCING COGNITION...";
    const el = document.getElementById('type-v9');
    let i = 0; el.textContent = "";
    const timer = setInterval(() => {
        el.textContent += s[i]; i++;
        if (i >= s.length) clearInterval(timer);
    }, 100);
}
