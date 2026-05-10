/**
 * Antigravity | Neural Engine
 * SOLID: Responsibility Isolation (Visual Engine)
 */

class NeuralEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.synapses = [];
        this.palette = { primary: '#bc13fe', secondary: '#00f3ff' };
        
        // V13.1 Neural Anchor: Primal Clarity
        this.brainImg = new Image();
        this.brainImg.src = 'image.png'; 
        this.brainLoaded = false;
        this.brainImg.onload = () => { this.brainLoaded = true; };

        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.createNeuralMap();
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updatePalette(theme) {
        this.theme = theme;
        this.palette.primary = theme === 'dark' ? '#bc13fe' : '#007aff';
        this.palette.secondary = theme === 'dark' ? '#00f3ff' : '#bc13fe';
    }

    createNeuralMap() {
        // V13.3 Lateral Synergy: Expanding sparks sideways toward data streams
        for (let i = 0; i < 110; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const r = Math.random() * 120 + 40;
            const a = (Math.random() - 0.5) * Math.PI * 1.3;
            this.synapses.push({
                ox: Math.cos(a) * r * 1.4 + (side * 20), // Wider horizontal spread
                oy: Math.sin(a) * r * 0.85,             // Compact vertical spread
                size: Math.random() * 2 + 1,
                mod: Math.random() * Math.PI * 2
            });
        }
        this.updatePalette(document.documentElement.getAttribute('data-theme'));
    }

    loop() {
        const p = window.scrollProgress || 0;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // V13.2 Ultimate Zen: Constant Presence Scaling
        const currentScale = 1.1 - (p * 0.1); 
        const tx = this.canvas.width / 2;
        const ty = this.canvas.height / 2;

        this.ctx.save();
        this.ctx.translate(tx, ty);
        this.ctx.scale(currentScale, currentScale);

        // --- DRAW CHAMELEON NEURAL CORE ---
        if (this.brainLoaded) {
            const pulse = 1 + Math.sin(Date.now() * 0.001) * 0.02;
            this.ctx.save();
            this.ctx.scale(pulse, pulse);
            
            // V13.2 Calibrated Neural Fade
            let baseAlpha = 0.9;
            if (p > 0.35) baseAlpha = 0.35;
            if (p > 0.75) baseAlpha = 0.18; 
            
            if (this.theme === 'light') {
                this.ctx.filter = 'drop-shadow(0 0 15px rgba(0,0,0,0.1)) contrast(1.1)';
                this.ctx.globalAlpha = baseAlpha;
            } else {
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.filter = `drop-shadow(0 0 60px ${this.palette.primary})`;
                this.ctx.globalAlpha = baseAlpha;
            }

            this.ctx.drawImage(this.brainImg, -200, -200, 400, 400); 
            this.ctx.restore();
        }

        // Draw Connections (Synaptic Web)
        this.ctx.strokeStyle = this.palette.primary;
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        for (let i = 0; i < this.synapses.length; i++) {
            const n1 = this.synapses[i];
            const dpt1 = Math.sin(Date.now() * 0.001 + i) * 5;
            for (let j = i + 1; j < this.synapses.length; j++) {
                const n2 = this.synapses[j];
                const dist = Math.sqrt((n1.ox - n2.ox)**2 + (n1.oy - n2.oy)**2);
                if (dist < 100) {
                    this.ctx.globalAlpha = (1 - dist / 110) * 0.15;
                    this.ctx.moveTo(n1.ox + dpt1, n1.oy);
                    this.ctx.lineTo(n2.ox, n2.oy);
                }
            }
        }
        this.ctx.stroke();

        // Draw Neurons (Flickering Pulse)
        this.synapses.forEach(s => {
            const glow = 0.4 + Math.sin(Date.now() * 0.002 + s.mod) * 0.4;
            this.ctx.globalAlpha = glow;
            this.ctx.fillStyle = glow > 0.7 ? this.palette.secondary : this.palette.primary;
            this.ctx.beginPath();
            this.ctx.arc(s.ox, s.oy, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.restore();
        requestAnimationFrame(() => this.loop());
    }
}

window.NeuralEngine = NeuralEngine;
