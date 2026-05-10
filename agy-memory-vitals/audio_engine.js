/**
 * Antigravity | Unified Neural Audio Engine V2.1 (Fair Resonance)
 * Logic by Hermes 3 & GPT-OSS | Orchestration by Antigravity Core
 */

class NeuralAudioEngine {
    constructor() {
        this.ctx = null;
        this.isStarted = false;
        this.layers = {};
        this.metrics = { mouseVelocity: 0, load: 0, sync: 0, uptime: 0 };
        this.tempo = 140; 
        this.level = 0; 
        this.dominance = 'base';
        this.nextNoteTime = 0;
        this.currentQuarterNote = 0;
        this.lookahead = 25.0;
        this.scheduleAheadTime = 0.1;
    }

    init() {
        if (this.isStarted) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.setupLayers();
        this.isStarted = true;
        this.scheduler();
        console.log("NEURAL SYMPHONY ACTIVE: FAIR RESONANCE MODE ENABLED.");
    }

    setupLayers() {
        const create = (name, vol) => {
            const g = this.ctx.createGain();
            g.connect(this.ctx.destination);
            g.gain.setValueAtTime(vol, this.ctx.currentTime);
            this.layers[name] = g;
        };
        create('base', 0.3);
        create('harmony', 0); // Trance
        create('fusion', 0);  // Techno
        create('sync', 0);    // Ambient
        create('uptime', 0);  // DnB
    }

    // --- SYNTHS ---
    playKick(t, g) {
        const o = this.ctx.createOscillator();
        const v = this.ctx.createGain();
        o.connect(v); v.connect(g);
        o.frequency.setValueAtTime(150 + (this.level * 20), t);
        o.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
        v.gain.setValueAtTime(1, t);
        v.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        o.start(t); o.stop(t + 0.5);
    }

    playSaw(t, f, d, g, filt = 2000) {
        const o = this.ctx.createOscillator();
        const v = this.ctx.createGain();
        const l = this.ctx.createBiquadFilter();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f, t);
        l.type = 'lowpass';
        l.frequency.setValueAtTime(Math.min(filt + (this.level * 1000), 21000), t);
        o.connect(l); l.connect(v); v.connect(g);
        v.gain.setValueAtTime(0.2 + (this.level * 0.05), t);
        v.gain.exponentialRampToValueAtTime(0.01, t + d);
        o.start(t); o.stop(t + d);
    }

    playChord(t, f, d, g) {
        const o = this.ctx.createOscillator();
        const v = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t);
        o.connect(v); v.connect(g);
        const max = this.level === 4 ? 0.4 : 0.2;
        v.gain.setValueAtTime(0, t);
        v.gain.linearRampToValueAtTime(max, t + d/2);
        v.gain.linearRampToValueAtTime(0, t + d);
        o.start(t); o.stop(t + d);
    }

    // --- LOGIC ---
    scheduler() {
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentQuarterNote, this.nextNoteTime);
            const baseTempo = 140 + (this.level * 20);
            this.nextNoteTime += 60.0 / baseTempo / 4;
            this.currentQuarterNote = (this.currentQuarterNote + 1) % 16;
        }
        setTimeout(() => this.scheduler(), this.lookahead);
    }

    scheduleNote(b, t) {
        if (this.level === 4) {
            if (b % 4 === 0) this.playKick(t, this.layers['base']);
            const celestial = [523.25, 659.25, 783.99, 987.77];
            if (b % 2 === 0) this.playChord(t, celestial[b % 4], 0.5, this.layers['sync']);
            return;
        }
        if (b % 4 === 0) this.playKick(t, this.layers['base']);
        if (b % 2 === 0) this.playSaw(t, 110, 0.1, this.layers['base'], 1000 + (this.metrics.mouseVelocity * 50));
        
        if (this.dominance === 'harmony' || this.layers['harmony'].gain.value > 0.05) {
            this.playSaw(t, [220, 261, 329, 392][b % 4], 0.15, this.layers['harmony'], 3000);
        }
        if (this.dominance === 'fusion' || this.layers['fusion'].gain.value > 0.05) {
            if (b % 2 === 1) this.playSaw(t, 55, 0.05, this.layers['fusion'], 500);
        }
        if (this.dominance === 'sync' || this.layers['sync'].gain.value > 0.05) {
            if (b % 8 === 0) [440, 554, 659].forEach(f => this.playChord(t, f, 2.0, this.layers['sync']));
        }
        if (this.dominance === 'uptime' || this.layers['uptime'].gain.value > 0.05) {
            if (b % 4 !== 0 && Math.random() > (0.8 - (this.level % 4) * 0.1)) {
                const noise = this.ctx.createBufferSource();
                const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                noise.buffer = buffer;
                const v = this.ctx.createGain();
                noise.connect(v); v.connect(this.layers['uptime']);
                v.gain.setValueAtTime(0.3, t); v.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                noise.start(t); noise.stop(t + 0.1);
            }
        }
    }

    updateMetrics(m) {
        this.metrics = { ...this.metrics, ...m };
        const w = {
            harmony: Math.min(this.metrics.mouseVelocity / 50, 1.0),
            fusion: Math.min(this.metrics.load / 100, 1.0),
            sync: Math.min(this.metrics.sync, 1.0),
            uptime: Math.min(this.metrics.uptime / 600, 1.0)
        };
        let win = 'base', max = 0.1;
        Object.keys(w).forEach(k => { if (w[k] > max) { max = w[k]; win = k; } });
        this.dominance = win;
        Object.keys(this.layers).forEach(n => {
            let tv = (n === 'base') ? 0.3 : (n === win ? 1.0 : 0);
            if (win === 'sync' && n !== 'sync' && n !== 'base') tv = 0;
            if (this.level === 4) tv = (n === 'sync' || n === 'base') ? 0.8 : 0;
            this.layers[n].gain.setTargetAtTime(tv, this.ctx.currentTime, 0.2);
        });
    }

    setLevel(l) { this.level = l; }
}

window.NeuralAudioEngine = new NeuralAudioEngine();
