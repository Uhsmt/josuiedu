// 砂利沈殿アニメーション
class GravelAnimation {
    constructor() {
        this.areas = [
            { id: 'gravel-area-1', particles: [], active: true, direction: 'left' },   // 右→左
            { id: 'gravel-area-2', particles: [], active: true, direction: 'up' },     // 下→上
            { id: 'gravel-area-3', particles: [], active: true, direction: 'right' },  // 左→右
            { id: 'gravel-area-4', particles: [], active: true, direction: 'down' }    // 上→下
        ];

        // エリアマップ（area3->area2->area1の順）
        this.areaMap = {
            'gravel-area-3': 'gravel-area-2',  // area3の次はarea2
            'gravel-area-2': 'gravel-area-1',  // area2の次はarea1
            'gravel-area-1': null              // area1で終了
        };

        // 旅する砂利（area1,2,3を移動）
        this.travelingParticles = [];
        // 浮上中の砂利
        this.floatingParticles = [];

        this.config = {
            travelSpawnRate: 0.025, // 旅する砂利の生成確率（さらに半分に）
            spawnRate: 0.05,       // 1フレームあたりの生成確率（少なく）area1,2,3用
            spawnRate4: 0.3,       // area4の生成確率（元通り）
            particleSize: 12,      // 砂利のベースサイズ（px）
            sizeVariation: 6,      // サイズのランダム幅（±3px）
            scraperSpeed: 0.8,     // スクレーパーの速度と一致（area1,2,3用）
            fallSpeed: 0.6,        // 落下速度（area4用）
            speedVariation: 0.1,   // 速度のランダム幅
            wobbleAmplitude: 5,    // ふよふよの振幅（増加）
            wobbleFrequency: 0.03, // ふよふよの周波数（少し遅く）
            floatSpeed: 0.5,       // 浮上速度
            fadeSpeed: 0.02,       // フェードアウト速度
            maxParticles: 100,     // 各エリアの最大パーティクル数
            initialParticles4: 40, // area4の初期砂利数（元通り）
            initialTravelParticles: 10  // area1,2,3の各エリアの初期砂利数（さらに半分に）
        };

        this.init();
        this.animate();
    }

    init() {
        this.areas.forEach(area => {
            const element = document.getElementById(area.id);
            if (!element) return;

            // パーティクルコンテナを作成
            const container = document.createElement('div');
            container.className = 'gravel-particles-container';
            container.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                pointer-events: none;
            `;
            element.appendChild(container);
            area.container = container;
            area.element = element;

            // 初期砂利を配置
            if (area.id === 'gravel-area-4') {
                this.createInitialParticles(area);
            } else if (area.id !== 'gravel-area-4') {
                // area1,2,3に旅する砂利を初期配置
                this.createInitialTravelingParticles(area);
            }
        });
    }

    createInitialTravelingParticles(area) {
        const containerHeight = area.container.offsetHeight;
        const containerWidth = area.container.offsetWidth;

        for (let i = 0; i < this.config.initialTravelParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'gravel-particle';

            const size = this.config.particleSize + (Math.random() - 0.5) * this.config.sizeVariation;
            const radius = size / 2;

            // 砂利の色（茶色系のランダムな色）
            const colors = [
                'rgba(139, 90, 43, 0.8)',
                'rgba(101, 67, 33, 0.8)',
                'rgba(160, 82, 45, 0.8)',
                'rgba(120, 80, 50, 0.8)'
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border-radius: 50%;
                pointer-events: none;
            `;

            // エリア全体にランダム配置
            const x = radius + Math.random() * (containerWidth - radius * 2);
            const y = radius + Math.random() * (containerHeight - radius * 2);

            // 方向に応じた速度を設定
            let speedX = 0, speedY = 0;
            switch(area.direction) {
                case 'right':  // area3: 左から右
                    speedX = this.config.scraperSpeed + (Math.random() - 0.5) * this.config.speedVariation;
                    break;
                case 'up':  // area2: 下から上
                    speedY = -(this.config.scraperSpeed + (Math.random() - 0.5) * this.config.speedVariation);
                    break;
                case 'left':  // area1: 右から左
                    speedX = -(this.config.scraperSpeed + (Math.random() - 0.5) * this.config.speedVariation);
                    break;
            }

            const particleData = {
                element: particle,
                currentArea: area.id,
                x: x,
                y: y,
                speedX: speedX,
                speedY: speedY,
                phase: Math.random() * Math.PI * 2,
                radius: radius,
                opacity: 1
            };

            // CSS leftは要素の左端なので、中心位置から半径を引く
            particle.style.left = `${x - radius}px`;
            particle.style.top = `${y - radius}px`;

            area.container.appendChild(particle);
            this.travelingParticles.push(particleData);
        }
    }

    createTravelingParticle() {
        // area3の左端から砂利を生成
        const area3 = this.areas.find(a => a.id === 'gravel-area-3');
        if (!area3 || !area3.container) return;

        const particle = document.createElement('div');
        particle.className = 'gravel-particle';

        const size = this.config.particleSize + (Math.random() - 0.5) * this.config.sizeVariation;
        const radius = size / 2;

        // 砂利の色（茶色系のランダムな色）
        const colors = [
            'rgba(139, 90, 43, 0.8)',
            'rgba(101, 67, 33, 0.8)',
            'rgba(160, 82, 45, 0.8)',
            'rgba(120, 80, 50, 0.8)'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            pointer-events: none;
        `;

        const containerHeight = area3.container.offsetHeight;
        const x = radius;  // 左端から半径分内側（中心座標）
        const y = radius + Math.random() * (containerHeight - radius * 2);

        const particleData = {
            element: particle,
            currentArea: 'gravel-area-3',
            x: x,
            y: y,
            speedX: this.config.scraperSpeed + (Math.random() - 0.5) * this.config.speedVariation,
            speedY: 0,
            phase: Math.random() * Math.PI * 2,
            radius: radius,
            opacity: 1
        };

        // 初期位置を設定（CSS leftは要素の左端なので、中心位置から半径を引く）
        particle.style.left = `${x - radius}px`;
        particle.style.top = `${y - radius}px`;

        area3.container.appendChild(particle);
        this.travelingParticles.push(particleData);
    }

    createInitialParticles(area) {
        const containerHeight = area.container.offsetHeight;
        const containerWidth = area.container.offsetWidth;

        // area4は元の数、それ以外は少なめ
        const count = area.id === 'gravel-area-4' ? this.config.initialParticles4 : this.config.initialParticles;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'gravel-particle';

            // 砂利の色（茶色系のランダムな色）
            const colors = [
                '#8b5a2b',
                '#654321',
                '#a0522d',
                '#785032'
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];

            // サイズのランダム化
            const size = this.config.particleSize + (Math.random() - 0.5) * this.config.sizeVariation;
            const radius = size / 2;

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border-radius: 50%;
                pointer-events: none;
            `;

            // エリア全体にランダム配置（中心座標として生成、境界から半径分の余白を確保）
            const x = radius + Math.random() * (containerWidth - radius * 2);
            const y = radius + Math.random() * (containerHeight - radius * 2);

            // 方向に応じた速度を設定
            let speedX = 0, speedY = 0;
            switch(area.direction) {
                case 'down':  // area4: 上から下（元の落下速度）
                    speedY = this.config.fallSpeed + (Math.random() - 0.5) * this.config.speedVariation * 2;
                    speedX = (Math.random() - 0.5) * 0.1;  // わずかな横揺れ
                    break;
                case 'right':  // area3: 左から右
                    speedX = this.config.scraperSpeed + (Math.random() - 0.5) * this.config.speedVariation;
                    break;
                case 'up':  // area2: 下から上
                    speedY = -(this.config.scraperSpeed + (Math.random() - 0.5) * this.config.speedVariation);
                    break;
                case 'left':  // area1: 右から左
                    speedX = -(this.config.scraperSpeed + (Math.random() - 0.5) * this.config.speedVariation);
                    break;
            }

            // パーティクルデータを作成（初期配置も動くようにする）
            const particleData = {
                element: particle,
                x: x,
                y: y,
                speedX: speedX,
                speedY: speedY,
                phase: Math.random() * Math.PI * 2,
                direction: area.direction,
                radius: radius
            };

            // CSS leftは要素の左端なので、中心位置から半径を引く
            particle.style.left = `${x - radius}px`;
            particle.style.top = `${y - radius}px`;

            area.container.appendChild(particle);
            area.particles.push(particleData);
        }
    }

    createParticle(area) {
        if (!area.active || !area.container) return;
        if (area.particles.length >= this.config.maxParticles) return;

        const particle = document.createElement('div');
        particle.className = 'gravel-particle';

        // 砂利の色（茶色系のランダムな色）
        const colors = [
            'rgba(139, 90, 43, 0.8)',
            'rgba(101, 67, 33, 0.8)',
            'rgba(160, 82, 45, 0.8)',
            'rgba(120, 80, 50, 0.8)'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];

        // サイズのランダム化
        const size = this.config.particleSize + (Math.random() - 0.5) * this.config.sizeVariation;
        const radius = size / 2;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            pointer-events: none;
        `;

        // 方向に応じた初期位置と速度
        let x, y, speedX = 0, speedY = 0;
        const containerWidth = area.container.offsetWidth;
        const containerHeight = area.container.offsetHeight;

        switch(area.direction) {
            case 'down':  // area4: 上から下（元の落下速度）
                x = radius + Math.random() * (containerWidth - radius * 2);
                y = radius;
                speedY = this.config.fallSpeed + (Math.random() - 0.5) * this.config.speedVariation * 2;
                speedX = (Math.random() - 0.5) * 0.1;  // わずかな横揺れ
                break;
            case 'right':  // area3: 左から右
                x = radius;
                y = radius + Math.random() * (containerHeight - radius * 2);
                speedX = this.config.scraperSpeed + (Math.random() - 0.5) * this.config.speedVariation;
                speedY = 0;
                break;
            case 'up':  // area2: 下から上
                x = radius + Math.random() * (containerWidth - radius * 2);
                y = containerHeight - radius;
                speedY = -(this.config.scraperSpeed + (Math.random() - 0.5) * this.config.speedVariation);
                speedX = 0;
                break;
            case 'left':  // area1: 右から左
                x = containerWidth - radius;
                y = radius + Math.random() * (containerHeight - radius * 2);
                speedX = -(this.config.scraperSpeed + (Math.random() - 0.5) * this.config.speedVariation);
                speedY = 0;
                break;
        }

        // パーティクルデータ
        const particleData = {
            element: particle,
            x: x,
            y: y,
            speedX: speedX,
            speedY: speedY,
            phase: Math.random() * Math.PI * 2,
            direction: area.direction,
            radius: radius
        };

        // 初期位置を設定（CSS leftは要素の左端なので、中心位置から半径を引く）
        particle.style.left = `${x - radius}px`;
        particle.style.top = `${y - radius}px`;

        area.container.appendChild(particle);
        area.particles.push(particleData);
    }

    updateParticles() {
        // 旅する砂利を確率的に生成
        if (Math.random() < this.config.travelSpawnRate) {
            this.createTravelingParticle();
        }

        // area4の通常の砂利を更新
        const area4 = this.areas.find(a => a.id === 'gravel-area-4');
        if (area4 && area4.active && area4.container) {
            // area4の新しいパーティクルを生成
            if (Math.random() < this.config.spawnRate4) {
                this.createParticle(area4);
            }

            // area4のパーティクルを更新
            const containerWidth = area4.container.offsetWidth;
            const containerHeight = area4.container.offsetHeight;

            area4.particles = area4.particles.filter(particle => {
                particle.phase += this.config.wobbleFrequency;
                const wobbleX = Math.sin(particle.phase) * this.config.wobbleAmplitude;

                particle.x += particle.speedX;
                particle.y += particle.speedY;

                const radius = particle.radius || this.config.particleSize / 2;
                // CSS leftは要素の左端なので、中心位置から半径を引く
                particle.element.style.left = `${particle.x + wobbleX - radius}px`;
                particle.element.style.top = `${particle.y - radius}px`;

                // 画面外に出たら削除
                if (particle.y > containerHeight + radius || particle.x > containerWidth + radius || particle.x < -radius) {
                    particle.element.remove();
                    return false;
                }

                return true;
            });
        }

        // 旅する砂利を更新
        this.travelingParticles = this.travelingParticles.filter(particle => {
            const area = this.areas.find(a => a.id === particle.currentArea);
            if (!area || !area.container) return false;

            const containerWidth = area.container.offsetWidth;
            const containerHeight = area.container.offsetHeight;

            // ふよふよの揺れ
            particle.phase += this.config.wobbleFrequency;
            let wobbleX = 0, wobbleY = 0;
            if (particle.speedX !== 0) {
                wobbleY = Math.sin(particle.phase) * this.config.wobbleAmplitude;
            } else {
                wobbleX = Math.sin(particle.phase) * this.config.wobbleAmplitude;
            }

            // 位置を更新
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // エリアの境界チェック（半径分内側でチェック）
            const radius = particle.radius || this.config.particleSize / 2;
            let needsTransition = false;
            if (area.direction === 'right' && particle.x >= containerWidth - radius) {
                needsTransition = true;
            } else if (area.direction === 'up' && particle.y <= radius) {
                needsTransition = true;
            } else if (area.direction === 'left' && particle.x <= radius) {
                needsTransition = true;
            }

            // 次のエリアに移動
            if (needsTransition) {
                const nextAreaId = this.areaMap[particle.currentArea];
                if (nextAreaId) {
                    this.transitionToNextArea(particle, nextAreaId);
                } else {
                    // 最後のエリア（area1）を出たら浮上開始
                    this.startFloating(particle);
                    return false;
                }
            }

            // 位置を反映（揺れを含む、境界内にクランプ）
            // 中心位置をクランプ（半径分の余白を確保）
            const finalX = Math.max(radius, Math.min(containerWidth - radius, particle.x + wobbleX));
            const finalY = Math.max(radius, Math.min(containerHeight - radius, particle.y + wobbleY));

            // CSS leftは要素の左端なので、中心位置から半径を引く
            particle.element.style.left = `${finalX - radius}px`;
            particle.element.style.top = `${finalY - radius}px`;

            return true;
        });

        // 浮上中の砂利を更新
        this.floatingParticles = this.floatingParticles.filter(particle => {
            // 上に移動
            particle.y -= this.config.floatSpeed;

            // フェードアウト
            particle.opacity -= this.config.fadeSpeed;
            particle.element.style.opacity = particle.opacity;

            // 位置を反映（CSS topは要素の上端なので、中心位置から半径を引く）
            const radius = particle.radius || this.config.particleSize / 2;
            particle.element.style.top = `${particle.y - radius}px`;

            // 完全に透明になったら削除
            if (particle.opacity <= 0) {
                particle.element.remove();
                return false;
            }

            return true;
        });
    }

    startFloating(particle) {
        // area1から浮上を開始
        particle.speedX = 0;
        particle.speedY = 0;

        // 浮上中リストに追加
        this.floatingParticles.push(particle);
    }

    transitionToNextArea(particle, nextAreaId) {
        const currentArea = this.areas.find(a => a.id === particle.currentArea);
        const nextArea = this.areas.find(a => a.id === nextAreaId);

        if (!currentArea || !nextArea || !nextArea.container) return;

        // 現在のエリアから要素を削除
        if (particle.element.parentNode === currentArea.container) {
            currentArea.container.removeChild(particle.element);
        }

        // 次のエリアに追加
        nextArea.container.appendChild(particle.element);
        particle.currentArea = nextAreaId;

        // 次のエリアの開始位置と速度を設定
        const containerWidth = nextArea.container.offsetWidth;
        const containerHeight = nextArea.container.offsetHeight;
        const radius = particle.radius || this.config.particleSize / 2;

        switch(nextArea.direction) {
            case 'up':  // area2: 下から上
                particle.x = radius + Math.random() * (containerWidth - radius * 2);
                particle.y = containerHeight - radius;  // 下端から半径分内側
                particle.speedX = 0;
                particle.speedY = -this.config.scraperSpeed;
                break;
            case 'left':  // area1: 右から左
                particle.x = containerWidth - radius;  // 右端から半径分内側
                particle.y = radius + Math.random() * (containerHeight - radius * 2);
                particle.speedX = -this.config.scraperSpeed;
                particle.speedY = 0;
                break;
        }
    }

    animate() {
        this.updateParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// DOM読み込み完了後に開始
document.addEventListener('DOMContentLoaded', () => {
    new GravelAnimation();
});
