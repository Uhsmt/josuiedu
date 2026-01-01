// 生物反応槽アニメーション制御
class BioReactionAnimation {
    constructor() {
        this.init();
    }

    init() {
        // 渦アニメーションの初期化
        this.initVortexAnimations();

        // 気泡アニメーションの初期化
        this.initBubbleAnimations();
    }
    
    initVortexAnimations() {
        // 無酸素槽の渦を生成（縦幅1.5倍）
        this.createVortexPath('vortex-path-1', 100, 50, 350, 80, 15, 12);
        
        // 嫌気槽の渦を生成（縦幅1.5倍）
        this.createVortexPath('vortex-path-2', 100, 50, 350, 80, 15, 12);
    }
    
    createVortexPath(pathId, cx, topY, bottomY, rTop, rBottom, turns) {
        const pathEl = document.getElementById(pathId);
        if (!pathEl) return;
        
        const pointsPerTurn = 60;
        const totalPoints = Math.max(50, Math.floor(pointsPerTurn * turns));
        const ySpan = bottomY - topY;
        
        let d = "";
        for (let i = 0; i <= totalPoints; i++) {
            const t = i / totalPoints;
            const y = topY + ySpan * t;
            const radius = rTop + (rBottom - rTop) * t;
            const theta = (turns * 2 * Math.PI) * t;
            const x = cx + Math.cos(theta) * radius;
            
            if (i === 0) {
                d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
            } else {
                d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
            }
        }
        
        pathEl.setAttribute("d", d);
    }
    
    initBubbleAnimations() {
        // 気泡アニメーション1を初期化
        this.createBubbleAnimation('bubble-canvas-1');
        
        // 気泡アニメーション2を初期化
        this.createBubbleAnimation('bubble-canvas-2');
    }
    
    createBubbleAnimation(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d', { alpha: true });
        const dpr = Math.max(1, devicePixelRatio || 1);
        
        const CFG = {
            spawnPerSec: 15,
            baseRise: 30,
            randomRise: 15,
            baseSize: 3.5,  // 泡のベースサイズを大きく
            growMax: 8.0,   // 泡の最大サイズも大きく
            fadeRate: 1.2,
            wobbleAmp: 12,  // 揺らぎも2倍
            wobbleFreq: 1.0,
            nozzleWidthRatio: 0.2,  // 散気口をさらに狭く
            eccMin: 0.8,
            eccMax: 1.0,
            fanSpread: 1.2  // 扇形拡散をさらに大きく
        };
        
        class Bubble {
            constructor(t) { this.reset(t) }
            reset(t) {
                const W = canvas.width / dpr;
                const H = canvas.height / dpr;
                const nozzleW = W * CFG.nozzleWidthRatio;
                this.x0 = W;  // 右端から発生
                this.y = H + 8;
                this.vy = -(CFG.baseRise + Math.random()*CFG.randomRise);
                this.birth = t;
                this.xDrift = -Math.random();  // 左方向への拡散（0～-1）
                this.wSeed = Math.random()*1000;
                this.baseR = CFG.baseSize + Math.random()*1.2;
                this.maxA = 1.0;
                this.initialAlpha = 1.0;  // 初期不透明度100%
                this.ecc = CFG.eccMin + Math.random()*(CFG.eccMax-CFG.eccMin);
            }
            update(dt, t) {
                const W = canvas.width / dpr;
                const H = canvas.height / dpr;
                this.y += this.vy * dt;
                const k = 1 - (this.y / H);
                this.r = this.baseR * (1 + (CFG.growMax/CFG.baseSize - 1) * Math.min(1, k));
                // 下部では不透明度100%、上部に行くほどフェードアウト
                this.alpha = k < 0.3 ? this.initialAlpha : Math.max(0, this.maxA * (1 - k*CFG.fadeRate));
                const fan = (this.y < H) ? (H - this.y) / H : 0;
                const spread = (this.xDrift * CFG.fanSpread * fan * W);
                const wobble = Math.sin(this.wSeed + t * CFG.wobbleFreq) * CFG.wobbleAmp * k;
                this.x = this.x0 + spread + wobble;
                if (this.y + this.r < -12 || this.alpha <= 0.02) this.reset(t);
            }
            draw() {
                ctx.globalAlpha = this.alpha;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.scale(1, this.ecc);
                ctx.beginPath();
                ctx.arc(0, 0, this.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(173, 216, 230, 0.9)';
                ctx.fill();
                ctx.restore();
                ctx.globalAlpha = 1;
            }
        }
        
        let bubbles = [];
        let spawnCarry = 0;
        let W = 0, H = 0;
        
        function resize() {
            const r = canvas.getBoundingClientRect();
            W = Math.max(50, Math.floor(r.width * dpr));
            H = Math.max(100, Math.floor(r.height * dpr));
            canvas.width = W;
            canvas.height = H;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        
        resize();
        window.addEventListener('resize', resize, {passive: true});
        
        // 初期の気泡を配置
        const t0 = performance.now() / 1000;
        for (let i = 0; i < 15; i++) {
            const b = new Bubble(t0);
            b.y = (H / dpr) - ((H / dpr) * i / 15) * 0.98;
            b.alpha = Math.random() * 0.4;
            bubbles.push(b);
        }
        
        let prev = performance.now() / 1000;
        function loop() {
            const now = performance.now() / 1000;
            let dt = Math.min(0.033, now - prev);
            prev = now;
            
            spawnCarry += CFG.spawnPerSec * dt;
            while (spawnCarry >= 1) {
                bubbles.push(new Bubble(now));
                spawnCarry -= 1;
            }
            
            if (bubbles.length > 60) bubbles.splice(0, bubbles.length - 60);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            bubbles.sort((a, b) => a.r - b.r);
            for (const b of bubbles) {
                b.update(dt, now);
                b.draw();
            }
            
            requestAnimationFrame(loop);
        }
        
        loop();
    }
}

// DOM読み込み完了後にアニメーション開始
document.addEventListener('DOMContentLoaded', () => {
    new BioReactionAnimation();
});