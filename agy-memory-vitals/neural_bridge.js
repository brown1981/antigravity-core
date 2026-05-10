/**
 * Antigravity | Neural Bridge (Ollama API Interconnect)
 * Handles high-speed communication with local LLM nodes.
 */

class NeuralBridge {
    constructor(endpoint = 'http://localhost:11434') {
        this.endpoint = endpoint;
        this.activeModel = null;
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.endpoint}/api/tags`);
            if (response.ok) {
                const data = await response.json();
                return { connected: true, models: data.models };
            }
            return { connected: false, error: 'Ollama not responding properly.' };
        } catch (err) {
            return { connected: false, error: 'CORS or Network Error. Check OLLAMA_ORIGINS.' };
        }
    }

    async chat(messages, model, onChunk) {
        try {
            const response = await fetch(`${this.endpoint}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: true
                })
            });

            if (!response.ok) throw new Error('Failed to connect to Neural Node');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.message && json.message.content) {
                            fullText += json.message.content;
                            onChunk(json.message.content, fullText, json.done);
                        }
                    } catch (e) {
                        console.warn("Stream parse error:", e);
                    }
                }
            }
        } catch (err) {
            onChunk(`[NEURAL LINK ERROR]: ${err.message}`, null, true);
        }
    }
}

window.NeuralBridge = NeuralBridge;
