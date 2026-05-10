/**
 * Antigravity | Memory Inspector (V13.0)
 * Visual RAG and Variable Trace Engine
 */

class MemoryInspector {
    constructor() {
        this.trace = [];
        this.isVisible = false;
        this.initUI();
    }

    initUI() {
        this.container = document.createElement('div');
        this.container.id = 'v13-memory-side';
        this.container.className = 'v9-sidebar glass neural-xray';
        this.container.innerHTML = `
            <h5>NEURAL TRACE (X-RAY)</h5>
            <div id="trace-terminal" class="v13-terminal">
                <p class="term-line">> INITIALIZING NEURAL LINK...</p>
            </div>
            <div class="v13-var-trace">
                <h6>VARIABLE CORTEX</h6>
                <div id="var-list"></div>
            </div>
        `;
        document.body.appendChild(this.container);
    }

    log(message, type = 'info') {
        const term = document.getElementById('trace-terminal');
        if (!term) return;

        const line = document.createElement('p');
        line.className = `term-line ${type}`;
        line.textContent = `> [${new Date().toLocaleTimeString()}] ${message}`;
        term.appendChild(line);
        term.scrollTop = term.scrollHeight;

        this.trace.push({ timestamp: Date.now(), message, type });
    }

    updateVariables(vars) {
        const list = document.getElementById('var-list');
        if (!list) return;

        list.innerHTML = Object.entries(vars).map(([key, val]) => `
            <div class="var-item">
                <span class="var-key">${key}</span>
                <span class="var-val">${val}</span>
            </div>
        `).join('');
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.container.classList.toggle('visible', this.isVisible);
        
        // Push main layout to the left to make room
        const stages = document.querySelectorAll('.v9-stage');
        stages.forEach(s => s.classList.toggle('shifted', this.isVisible));
    }
}

window.memoryInspector = new MemoryInspector();
