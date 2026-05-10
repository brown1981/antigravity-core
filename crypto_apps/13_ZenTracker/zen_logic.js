/**
 * ZEN_TRACKER: MINDFULNESS ENGINE
 * Responsibilities: Breathing Cycles, Quote Generation
 */

const ZenEngine = {
    phases: ["Inhale", "Hold", "Exhale", "Rest"],
    currentPhaseIndex: 0,

    getQuote() {
        const quotes = [
            "冷静な判断は、静寂の中から生まれる。",
            "市場は呼吸している。あなたも同じように。",
            "ガス代の低下は、忍耐の報酬である。",
            "ノイズを遮断し、シグナルに耳を澄ませ。"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    },

    getNextPhase() {
        this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length;
        return this.phases[this.currentPhaseIndex];
    }
};

window.ZenEngine = ZenEngine;
