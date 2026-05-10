/**
 * Antigravity | Neural Bridge V1.0 (Dynamic Discovery)
 */

class NeuralBridge {
    constructor(endpoint = 'http://localhost:11434') {
        this.endpoint = endpoint;
    }

    async getModels() {
        try {
            const response = await fetch(`${this.endpoint}/api/tags`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.models || [];
        } catch (e) {
            console.error("Ollama connection failed", e);
            return null; // Return null to indicate connection error
        }
    }

    async chat(messages, model, onChunk) {
        try {
            const response = await fetch(`${this.endpoint}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, messages, stream: true })
            });

            if (!response.ok) throw new Error('Model offline or connection lost');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let full = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    onChunk("", full, true);
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.message && json.message.content) {
                            full += json.message.content;
                            onChunk(json.message.content, full, false);
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {
            onChunk(`[BRIDGE ERROR]: ${e.message}`, "", true);
        }
    }
}

window.NeuralBridge = NeuralBridge;
