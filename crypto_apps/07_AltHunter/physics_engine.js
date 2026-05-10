// === PHYSICS & VISUALIZATION ENGINE ===
const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('radar-tooltip');
let width, height;
let stars = [];

function resize() {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;
    width = canvas.width = wrapper.clientWidth;
    height = canvas.height = wrapper.clientHeight;
    initStars();
}
window.addEventListener('resize', resize);
resize();

function initStars() {
    stars = [];
    for(let i=0; i<200; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random()
        });
    }
}

class Bubble {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.symbol = data.symbol;
        this.rank = data.rank;
        this.price = data.price;
        
        // Parse live API format safely
        this.change1h = (data.performance && data.performance.hour) ? data.performance.hour : 0;
        this.change24h = (data.performance && data.performance.day) ? data.performance.day : 0;
        this.change7d = (data.performance && data.performance.week) ? data.performance.week : 0;
        
        const angle = Math.random() * Math.PI * 2;
        const distanceRatio = Math.sqrt(this.rank / 1000);
        const maxDist = Math.min(width, height) * 0.45;
        this.targetDist = distanceRatio * maxDist;
        
        this.x = width/2 + Math.cos(angle) * (this.targetDist + 500);
        this.y = height/2 + Math.sin(angle) * (this.targetDist + 500);
        this.vx = 0;
        this.vy = 0;
        this.radius = Math.max(3, (1100 - this.rank) / 80);
        if (this.rank <= 50) this.radius *= 1.3;
        
        // Grade is assigned later by computeGrades() with dynamic thresholds
        this.grade = null;
        this.isGradeS = false;
        this.isGradeA = false;
        this.isGradeB = false;
        this.isGradeX = false;
        this.isActive = false;
        
        this.updateStyle();
    }

    applyGrade(grade) {
        this.grade = grade;
        this.isGradeS = grade === 'S';
        this.isGradeA = grade === 'A';
        this.isGradeB = grade === 'B';
        this.isGradeX = grade === 'X';
        this.isActive = grade !== null;

        // Dynamic radius boost by grade
        this.radius = Math.max(3, (1100 - this.rank) / 80);
        if (this.rank <= 50) this.radius *= 1.3;
        if (this.isGradeS) this.radius *= 1.8;
        else if (this.isGradeX) this.radius *= 1.6;
        else if (this.isGradeA) this.radius *= 1.4;

        this.updateStyle();
    }

    updateStyle() {
        if (this.isGradeS) {
            this.color = '#ffcc00'; // Gold
            this.opacity = 1.0;
        } else if (this.isGradeA) {
            this.color = '#ff8c00'; // Orange
            this.opacity = 0.9;
        } else if (this.isGradeB) {
            this.color = '#00d4ff'; // Cyan
            this.opacity = 0.7;
        } else if (this.isGradeX) {
            this.color = '#ff3366'; // Red-Magenta (Eruption)
            this.opacity = 0.85;
        } else {
            this.color = '#2a3a4a'; 
            this.opacity = 0.08;
        }
    }

    update() {
        const dx = width/2 - this.x;
        const dy = height/2 - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        const force = (dist - this.targetDist) * 0.02;
        const angle = Math.atan2(dy, dx);
        
        this.vx += Math.cos(angle) * force;
        this.vy += Math.sin(angle) * force;
        
        const orbitSpeed = 0.005 * (1 - (this.rank/1000));
        this.vx += -dy * orbitSpeed;
        this.vy += dx * orbitSpeed;

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.92;
        this.vy *= 0.92;

        if (this.isGradeS) {
            this.glow = Math.sin(Date.now() / 200) * 18 + 18;
        } else if (this.isGradeA) {
            this.glow = Math.sin(Date.now() / 300) * 10 + 10;
        } else if (this.isGradeB) {
            this.glow = 5;
        } else if (this.isGradeX) {
            this.glow = 8;
        } else {
            this.glow = 0;
        }
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        if (this.glow > 0) {
            ctx.shadowBlur = this.glow;
            ctx.shadowColor = this.color;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;

        // CLUTTER REDUCTION: Labels for Top 10, Grade S, A, and X
        if (this.rank <= 10 || this.isGradeS || this.isGradeA || this.isGradeX) {
            ctx.fillStyle = this.isGradeS ? 'white' : this.isGradeX ? '#ff3366' : this.isGradeA ? 'rgba(255,200,150,0.8)' : 'rgba(255,255,255,0.3)';
            ctx.font = (this.isGradeS || this.isGradeX) ? 'bold 12px Inter' : '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(this.symbol, this.x, this.y + this.radius + 14);
        }
    }
}

// Hover interaction
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    let hovered = null;
    if (window.coins) {
        for (const c of window.coins) {
            const dx = mx - c.x;
            const dy = my - c.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < c.radius + 10) {
                hovered = c;
                break;
            }
        }
    }

    if (hovered && hovered.isActive) {
        const { reason, action } = generateReason(hovered);
        const gradeColor = { S: '#ffcc00', A: '#ff8c00', B: '#00d4ff', X: '#ff3366' }[hovered.grade];
        
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
        tooltip.style.borderColor = gradeColor;
        
        tooltip.innerHTML = `
            <div class="tt-title">${hovered.symbol} <span class="tt-grade" style="background:${gradeColor}22; color:${gradeColor}">GRADE ${hovered.grade}</span></div>
            <div style="font-size:0.7rem; opacity:0.6; margin-bottom:5px;">${hovered.name} | Rank #${hovered.rank}</div>
            <div class="tt-stats">
                <span style="color:${hovered.change1h>=0?'#00ffcc':'#ff4444'}">1h: ${hovered.change1h>=0?'+':''}${hovered.change1h.toFixed(1)}%</span>
                <span style="color:${hovered.change24h>=0?'#00ffcc':'#ff4444'}">24h: ${hovered.change24h>=0?'+':''}${hovered.change24h.toFixed(1)}%</span>
            </div>
            <div class="tt-reason">${reason}</div>
            <div class="tt-action">${action}</div>
            <div style="font-size:0.6rem; opacity:0.3; margin-top:8px; text-align:right;">${t('click_details')}</div>
        `;
        canvas.style.cursor = 'pointer';
    } else {
        tooltip.style.display = 'none';
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    if (window.coins) {
        for (const c of window.coins) {
            const dx = mx - c.x;
            const dy = my - c.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < c.radius + 10 && c.isActive) {
                window.open(`https://www.coingecko.com/en/coins/${c.name.toLowerCase().replace(/ /g, '-')}`, '_blank');
                break;
            }
        }
    }
});

function animate() {
    ctx.fillStyle = 'rgba(5, 9, 20, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    stars.forEach(s => {
        ctx.fillStyle = `rgba(255,255,255,${s.opacity * Math.sin(Date.now()/1000)})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    if (window.coins) {
        window.coins.forEach(c => {
            c.update();
            c.draw();
        });
    }
    requestAnimationFrame(animate);
}
animate();
