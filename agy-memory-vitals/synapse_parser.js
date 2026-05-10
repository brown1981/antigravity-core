/**
 * Antigravity | Synapse Parser
 * SOLID: Single Responsibility Principle (Logic Extraction)
 */

class SynapseParser {
    /**
     * Translates a natural language query into a structured workflow synapse.
     * @param {string} query - The raw command input.
     * @param {string} context - The knowledge cortex string.
     * @returns {object} Structured workflow definition.
     */
    static parse(query, context = "") {
        const q = query.toLowerCase();
        let steps = [];
        
        // 1. Trigger Logic
        if (q.includes('@vitals')) {
            steps.push({ type: 'Trigger', app: 'vitals', title: "Targeted Spike", desc: "Forced Vit-Targeting active" });
        } else if (q.includes('cognitive') || q.includes('load')) {
            steps.push({ type: 'Trigger', app: 'vitals', title: "Neural Spike", desc: "If Cognitive Load > 80%" });
        } else {
            steps.push({ type: 'Trigger', app: 'auto', title: "Manual Sync", desc: "Initiated by President" });
        }

        // 2. Knowledge Influence (RAG Simulator)
        if (context.length > 0) {
            steps.push({ type: 'Knowledge', app: 'intelligence', title: "Context Pulse", desc: "Influenced by President's Cortex" });
        }

        // 3. Conditional Branching
        if (q.includes('if') || q.includes('emergency') || q.includes('/path')) {
            steps.push({ type: 'Path', title: "Emergency Filter", desc: "Route based on priority" });
        }

        // 4. Processing Tools
        if (q.includes('/summarize') || q.includes('summarize')) {
            steps.push({ type: 'Tool', app: 'intelligence', title: "AI Summary", desc: "Synthesizing input trace" });
        }
        if (q.includes('format') || q.includes('translate') || q.includes('/format')) {
            steps.push({ type: 'Tool', app: 'formatter', title: "Format Payload", desc: "Prepare for external transmission" });
        }

        // 5. Safety Protocols
        const appsThatNeedAudit = ['slack', 'gmail', '@slack', '@gmail'];
        if (appsThatNeedAudit.some(app => q.includes(app))) {
            steps.push({ 
                type: 'Safety', app: 'safety', title: "Audit Logged", 
                desc: "Speed Priority Active: Execution Direct", status: 'APPROVED' 
            });
        }

        // 6. Action Integration
        if (q.includes('@slack') || q.includes('slack')) {
            steps.push({ type: 'Action', app: 'slack', title: "Post Signal", desc: "External transmission via Slack" });
        } else if (q.includes('@gmail') || q.includes('gmail')) {
            steps.push({ type: 'Action', app: 'gmail', title: "Send Report", desc: "External transmission via Gmail" });
        } else if (q.includes('/vision') || q.includes('vision')) {
            steps.push({ type: 'Action', app: 'vision', title: "AI Vision Analysis", desc: "Generating high-fidelity image insight" });
        } else {
            steps.push({ type: 'Action', app: 'vision', title: "AI Analysis", desc: "Summarizing neural state to dashboard" });
        }

        // 7. Elite Tools (V13.1+)
        if (q.includes('/scrape') || q.includes('crawl')) {
            steps.push({ type: 'Tool', app: 'scraper', title: "Playwright Core", desc: "Crawling target URL for intelligence" });
        }
        if (q.includes('/local') || q.includes('system')) {
            steps.push({ type: 'Tool', app: 'local', title: "FastMCP Bridge", desc: "Accessing local system file structure" });
        }
        if (q.includes('/delay')) {
            steps.push({ type: 'Tool', app: 'delay', title: "Wait Protocol", desc: "Next execution delayed by 5m" });
        }
        if (q.includes('/webhook')) {
            steps.push({ type: 'Tool', app: 'webhook', title: "Wait for Pulse", desc: "Listening for external webhook signal" });
        }
        if (q.includes('/digest')) {
            steps.push({ type: 'Tool', app: 'digest', title: "Buffer Node", desc: "Aggregating data for daily summary" });
        }

        return { id: Date.now(), steps, active_idx: -1 };
    }
}

window.SynapseParser = SynapseParser;
