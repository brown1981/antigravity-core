/**
 * Antigravity | Cockpit Chat Engine
 */

class CockpitChat {
    constructor(bridge) {
        this.bridge = bridge;
        this.activeModel = null;
        this.histories = {};
        this.isBusy = false;
    }

    async init() {
        await this.refreshModels();
        this.setupListeners();
    }

    async refreshModels() {
        const selector = document.getElementById('brain-selector');
        const status = document.getElementById('connection-status');
        
        const models = await this.bridge.getModels();
        
        if (models === null) {
            status.textContent = "OFFLINE";
            status.className = "status-indicator";
            selector.innerHTML = `<div class="error-msg">CHECK OLLAMA_ORIGINS</div>`;
            return;
        }

        status.textContent = "ONLINE";
        status.className = "status-indicator online";

        if (models.length === 0) {
            selector.innerHTML = `<div class="loading-shimmer">NO BRAINS PULLED YET</div>`;
            return;
        }

        selector.innerHTML = models.map(m => `
            <div class="brain-node" data-id="${m.name}">
                <h5>${m.name.split(':')[0].toUpperCase()}</h5>
                <span>${m.name.split(':')[1] || 'LATEST'}</span>
            </div>
        `).join('');

        const nodes = document.querySelectorAll('.brain-node');
        nodes.forEach(n => n.onclick = () => this.selectModel(n.getAttribute('data-id')));
    }

    selectModel(id) {
        document.querySelectorAll('.brain-node').forEach(n => {
            n.classList.toggle('active', n.getAttribute('data-id') === id);
        });
        
        this.activeModel = id;
        document.getElementById('active-model-name').textContent = id.toUpperCase();
        
        if (!this.histories[id]) this.histories[id] = [];
        this.renderHistory();
    }

    renderHistory() {
        const view = document.getElementById('chat-viewport');
        if (this.histories[this.activeModel].length === 0) {
            view.innerHTML = `<div class="welcome-msg"><h2>${this.activeModel.toUpperCase()} READY</h2><p>Send a tactical command to begin.</p></div>`;
            return;
        }

        view.innerHTML = this.histories[this.activeModel].map(m => `
            <div class="chat-msg ${m.role}" data-role="${m.role}">
                <div class="bubble-meta">${m.role.toUpperCase()}</div>
                <div class="content">${m.content}</div>
            </div>
        `).join('');
        view.scrollTop = view.scrollHeight;
        
        // Update busy state in DOM for manager visibility
        document.body.setAttribute('data-busy', this.isBusy);
    }

    async send(text) {
        if (!text.trim() || !this.activeModel || this.isBusy) return;

        this.isBusy = true;
        this.histories[this.activeModel].push({ role: 'user', content: text });
        this.renderHistory();

        const assistantMsg = { role: 'assistant', content: '' };
        this.histories[this.activeModel].push(assistantMsg);
        
        const view = document.getElementById('chat-viewport');
        const lastMsgEl = view.lastElementChild.querySelector('.content');

        await this.bridge.chat(this.histories[this.activeModel].slice(0, -1), this.activeModel, (chunk, full, done) => {
            assistantMsg.content = full;
            lastMsgEl.textContent = full;
            view.scrollTop = view.scrollHeight;
            if (done) this.isBusy = false;
        });
    }

    setupListeners() {
        const input = document.getElementById('neural-input');
        const btn = document.getElementById('send-btn');
        const rescan = document.getElementById('rescan-btn');

        const trigger = () => {
            const t = input.value;
            if (t) {
                this.send(t);
                input.value = "";
            }
        };

        btn.onclick = trigger;
        input.onkeypress = (e) => { if (e.key === 'Enter') trigger(); };
        rescan.onclick = () => this.refreshModels();
        
        document.getElementById('clear-stream').onclick = () => {
            if (this.activeModel) {
                this.histories[this.activeModel] = [];
                this.renderHistory();
            }
        };
    }
}

window.CockpitChat = CockpitChat;
