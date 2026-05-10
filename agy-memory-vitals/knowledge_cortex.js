/**
 * Antigravity | Knowledge Cortex (V12.0)
 * Context engine for Agentic RAG
 */

class KnowledgeCortex {
    constructor() {
        this.knowledge = [];
        this.load();
    }

    addSnippet(text) {
        if (!text || text.length < 5) return;
        this.knowledge.push({
            id: Date.now(),
            content: text,
            timestamp: new Date().toISOString()
        });
        this.save();
        this.broadcast();
    }

    removeSnippet(id) {
        this.knowledge = this.knowledge.filter(k => k.id !== id);
        this.save();
        this.broadcast();
    }

    getContext() {
        if (this.knowledge.length === 0) return "";
        return "PRESIDENT'S KNOWLEDGE CONTEXT:\n" + 
               this.knowledge.map(k => `- ${k.content}`).join("\n");
    }

    save() {
        localStorage.setItem('agy_knowledge', JSON.stringify(this.knowledge));
    }

    load() {
        const stored = localStorage.getItem('agy_knowledge');
        if (stored) this.knowledge = JSON.parse(stored);
    }

    broadcast() {
        // Trigger a re-render in the Automation Hub if available
        if (window.automation) window.automation.render();
    }
}

window.knowledgeCortex = new KnowledgeCortex();
