/**
 * Antigravity | Neural Cockpit Main Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    const bridge = new NeuralBridge();
    const chat = new CockpitChat(bridge);
    
    chat.init();

    // UI Polish: Background Canvas (Optional but cool)
    console.log("[Cockpit] Systems Initialized.");
});
