/**
 * Antigravity | Chat Engine (Multi-Model Management)
 */

class NeuralChatEngine {
    constructor(bridge) {
        this.bridge = bridge;
        this.history = {
            'gemma2:9b': [],
            'qwen2.5:32b': [],
            'antigravity': []
        };
        this.activeModel = 'gemma2:9b';
        this.isTyping = false;
    }

    setModel(modelId) {
        this.activeModel = modelId;
        this.renderHistory();
        console.log(`[Neural Engine] Brain switched to: ${modelId}`);
    }

    renderHistory() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        container.innerHTML = this.history[this.activeModel].map(msg => `
            <div class="chat-bubble ${msg.role}">
                <div class="bubble-meta">${msg.role.toUpperCase()}</div>
                <div class="bubble-txt">${msg.content}</div>
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    }

    async sendMessage(text) {
        if (!text.trim() || this.isTyping) return;

        this.isTyping = true;
        const msgObj = { role: 'user', content: text };
        this.history[this.activeModel].push(msgObj);
        this.renderHistory();

        // Placeholder for AI response
        const aiMsgObj = { role: 'assistant', content: '' };
        this.history[this.activeModel].push(aiMsgObj);
        this.renderHistory();

        const chatEl = document.getElementById('chat-messages');
        const lastBubble = chatEl.lastElementChild.querySelector('.bubble-txt');

        await this.bridge.chat(this.history[this.activeModel].slice(0, -1), this.activeModel, (chunk, full, done) => {
            aiMsgObj.content = full;
            lastBubble.textContent = full;
            chatEl.scrollTop = chatEl.scrollHeight;

            if (done) {
                this.isTyping = false;
                if (window.memoryInspector) {
                    window.memoryInspector.log(`SYNC: ${this.activeModel.toUpperCase()} RESPONSE COMPLETE`, "success");
                }
            }
        });
    }
}

window.NeuralChatEngine = NeuralChatEngine;
