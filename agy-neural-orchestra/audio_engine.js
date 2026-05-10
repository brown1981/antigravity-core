/**
 * Antigravity | Neural Audio Engine V1.0
 * Generative WebAudio Orchestration for AI Synergy.
 */

class NeuralAudioEngine {
    constructor() {
        this.ctx = null;
        this.isStarted = false;
        
        // Layers: Base, Harmony, Fusion, Sync, Uptime
        this.layers = {};
        this.metrics = {
            mouseVelocity: 0,
            load: 0,
            sync: 0,
            uptime: 0
        };
        
        this.tempo = 140; 
        this.level = 0; // 0-3
        this.nextNoteTime = 0;
        this.currentQuarterNote = 0;
        this.lookahead = 25.0;
        this.scheduleAheadTime = 0.1;
        this.timerID = null;

        // Dominance System
        this.dominance = 'base';
    }

    init() {
        if (this.isStarted) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.setupLayers();
        this.isStarted = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduler();
        console.log("Audio Engine Synchronized. Resonance Mode: FAIR.");
    }

    setupLayers() {
        const createLayer = (name, initialVolume = 0) => {
            const gain = this.ctx.createGain();
            gain.connect(this.ctx.destination);
            gain.gain.setValueAtTime(initialVolume, this.ctx.currentTime);
            this.layers[name] = gain;
        };

        createLayer('base', 0.4);   // Eurobeat
        createLayer('harmony', 0); // Trance
        createLayer('fusion', 0);  // Techno
        createLayer('sync', 0);    // Ambient
        createLayer('uptime', 0);  // DnB
    }

    // --- SYNTHESIZERS ---

    playKick(time, gainNode) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(gainNode);

        const freq = 150 + (this.level * 20);
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    playSnare(time, gainNode) {
        const noise = this.ctx.createBufferSource();
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000 + (this.level * 500), time);

        const gain = this.ctx.createGain();
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(gainNode);

        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.start(time);
        noise.stop(time + 0.2);
    }

    playSawSynth(time, freq, duration, gainNode, filterFreq = 2000) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);
        
        filter.type = 'lowpass';
        // [ENGINEER: GPT-OSS] Clamping frequency to human/machine safety range
        const finalFilter = Math.min(filterFreq + (this.level * 1000), 21000); 
        filter.frequency.setValueAtTime(finalFilter, time);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(gainNode);

        const vol = 0.2 + (this.level * 0.05);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc.start(time);
        osc.stop(time + duration);
    }

    playAmbientChord(time, freq, duration, gainNode) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.connect(gain);
        gain.connect(gainNode);

        // Omni-Resonance Polish
        const maxVol = this.level === 4 ? 0.4 : 0.2;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(maxVol, time + duration/2);
        gain.gain.linearRampToValueAtTime(0, time + duration);

        osc.start(time);
        osc.stop(time + duration);
    }

    // --- SCHEDULER ---

    scheduler() {
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentQuarterNote, this.nextNoteTime);
            this.advanceNote();
        }
        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    }

    advanceNote() {
        const baseTempo = 140 + (this.level * 20);
        const secondsPerBeat = 60.0 / baseTempo / 4; 
        this.nextNoteTime += secondsPerBeat;
        this.currentQuarterNote++;
        if (this.currentQuarterNote === 16) this.currentQuarterNote = 0;
    }

    scheduleNote(beat, time) {
        // [AUTOMATOR: HERMES] Final Chapter: OMNI-RESONANCE (Phase 5 Logic)
        if (this.level === 4) {
            // In Omni-Resonance, all genres collapse into a celestial chord-pattern
            if (beat % 4 === 0) this.playKick(time, this.layers['base']);
            const celestial = [523.25, 659.25, 783.99, 987.77]; // Cmaj7
            if (beat % 2 === 0) {
                this.playAmbientChord(time, celestial[beat % 4], 0.5, this.layers['sync']);
            }
            return;
        }

        // Base Beat
        if (beat % 4 === 0) this.playKick(time, this.layers['base']);
        if (beat % 8 === 4) this.playSnare(time, this.layers['base']);
        
        const baseFreq = 110; 
        if (beat % 2 === 0) {
            this.playSawSynth(time, baseFreq, 0.1, this.layers['base'], 1000 + (this.metrics.mouseVelocity * 50));
        }

        // Harmony (Trance)
        if (this.dominance === 'harmony' || this.layers['harmony'].gain.value > 0.05) {
            const scale = [220, 261.63, 329.63, 392];
            const freq = scale[beat % scale.length];
            this.playSawSynth(time, freq, 0.15, this.layers['harmony'], 3000);
        }

        // Fusion (Techno)
        if (this.dominance === 'fusion' || this.layers['fusion'].gain.value > 0.05) {
            if (beat % 2 === 1) this.playSawSynth(time, 55, 0.05, this.layers['fusion'], 500);
        }

        // Sync (Ambient)
        if (this.dominance === 'sync' || this.layers['sync'].gain.value > 0.05) {
            if (beat % 8 === 0) {
                const chord = [440, 554, 659]; 
                chord.forEach(f => this.playAmbientChord(time, f, 2.0, this.layers['sync']));
            }
        }

        // Uptime (DnB)
        if (this.dominance === 'uptime' || this.layers['uptime'].gain.value > 0.05) {
            if (beat % 4 !== 0 && Math.random() > (0.8 - (this.level % 4) * 0.1)) {
                this.playSnare(time, this.layers['uptime']);
            }
        }
    }

    // --- FAIR RESONANCE CONTROL ---

    updateMetrics(metrics) {
        this.metrics = { ...this.metrics, ...metrics };
        this.calculateStandardizedDominance();
    }

    calculateStandardizedDominance() {
        if (!this.ctx) return;
        
        // [PHYSICIST: PHI-4] Normalizing mixed physical units
        const weights = {
            // Target: 25% (0.25) contribution each at saturation
            harmony: Math.min(this.metrics.distanceCm / 30, 1.0) * 0.25,
            fusion: Math.min(this.metrics.dataMB / 50, 1.0) * 0.25,
            sync: Math.min(this.metrics.syncRate / 100, 1.0) * 0.25,
            uptime: Math.min(this.metrics.energyCost / 0.1, 1.0) * 0.25
        };

        // Determine visual "Winner"
        let winner = 'base';
        let maxWeight = 0.01;
        Object.keys(weights).forEach(key => {
            if (weights[key] > maxWeight) {
                maxWeight = weights[key];
                winner = key;
            }
        });
        this.dominance = winner;

        // Apply additive gains based on physical consumption
        Object.keys(this.layers).forEach(name => {
            const node = this.layers[name];
            let targetVol = 0;

            if (name === 'base') {
                targetVol = 0.3; // Base remains steady
            } else if (weights[name] !== undefined) {
                // Fair 0.25 slice based on real-world impact
                targetVol = weights[name] * 3.5; // Boosted for audible presence
            }
            
            if (this.level === 4) targetVol = (name === 'sync' || name === 'base') ? 0.8 : 0;

            node.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.2);
        });
    }

    setLevel(level) {
        this.level = level;
    }
}

window.NeuralAudioEngine = new NeuralAudioEngine();
