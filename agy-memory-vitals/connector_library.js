/**
 * Antigravity | Connector Library & Tool Registry
 * A central repository of apps, seed tools, and triggers for the Universal Automation Core.
 */

const CONNECTOR_LIBRARY = {
    apps: {
        slack: { name: "Slack", icon: "💬", color: "#4A154B" },
        discord: { name: "Discord", icon: "👾", color: "#5865F2" },
        sheets: { name: "Google Sheets", icon: "📊", color: "#0F9D58" },
        gmail: { name: "Gmail", icon: "📩", color: "#DB4437" },
        vision: { name: "AI Vision", icon: "👁️", color: "#BC13FE" },
        vitals: { name: "Neural Vitals", icon: "🧠", color: "#00F3FF" }
    },
    
    seeds: {
        formatter: { name: "Formatter", type: "Tool", icon: "⚙️", desc: "Convert text or dates" },
        filter: { name: "Filter", type: "Tool", icon: "🛡️", desc: "Control flow based on conditions" },
        math: { name: "Math", type: "Tool", icon: "➕", desc: "Perform calculations" },
        extractor: { name: "AI Extractor", type: "Tool", icon: "✨", desc: "Extract data from text" }
    },

    intelligence_safety: {
        intelligence: { name: "Neural Core", icon: "🧠", color: "#BC13FE", desc: "AI Synthesis & Summarization" },
        safety: { name: "Approval Gate", icon: "🛡️", color: "#FFCC00", desc: "Human-In-The-Loop Verification" },
        registry: { name: "Core Registry", icon: "📊", color: "#00FFCC", desc: "State Persistent Database" },
        
        // V13.1 Primal Clarity: Elite Tool Installation
        delay: { name: "Logic Delay", icon: "⏰", color: "#666", desc: "Wait step for scheduled execution" },
        webhook: { name: "Universal Webhook", icon: "🔌", color: "#007AFF", desc: "External signal reception" },
        digest: { name: "Data Digest", icon: "📚", color: "#ff8c00", desc: "Buffer and summarize data" },
        vision: { name: "AI Vision", icon: "👁️", color: "#ff00ff", desc: "High-fidelity image analysis" },
        scraper: { name: "Playwright Scraper", icon: "🌐", color: "#45ba4b", desc: "Web data extraction engine" },
        local: { name: "FastMCP Bridge", icon: "🏠", color: "#666", desc: "Local system & script bridge" }
    },

    getMetadata(key) {
        return this.apps[key] || this.seeds[key] || this.intelligence_safety[key] || { name: key, icon: "📋", color: "#666" };
    }
};

if (typeof window !== 'undefined') window.CONNECTOR_LIBRARY = CONNECTOR_LIBRARY;
