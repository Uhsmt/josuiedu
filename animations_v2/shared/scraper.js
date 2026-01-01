// 最初沈殿池アニメーション制御（台形トラック版）
class ShochinAnimation {
    constructor(options = {}) {
        this.animationId = null;
        this.blades = [];
        this.isPaused = false;
        this.reverseDirection = options.reverse || false;
        this.lastTime = performance.now(); // 時間管理用

        this.init();
        this.setupControls();
        this.initScraper();
    }

    init() {
        console.log('最初沈殿池アニメーション開始（台形版）');

        // レスポンシブ対応
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // フルスクリーン対応
        this.setupFullscreen();
    }

    handleResize() {
        // SVGサイズが変わった場合、スクレーパーも再初期化
        if (this.animationId) {
            this.stopScraper();
            // 少し遅延してから再初期化（画像のリサイズ完了を待つ）
            setTimeout(() => {
                this.initScraper();
            }, 100);
        }
        console.log('レイアウト自動調整完了');
    }

    setupFullscreen() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'f' || event.key === 'F') {
                this.toggleFullscreen();
            }
            if (event.key === 'Escape') {
                this.exitFullscreen();
            }
        });

        // ダブルクリックでフルスクリーン
        document.addEventListener('dblclick', () => {
            this.toggleFullscreen();
        });
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('フルスクリーンエラー:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    setupControls() {
        // スペースキーでアニメーション一時停止/再開
        document.addEventListener('keydown', (event) => {
            if (event.key === ' ') {
                event.preventDefault();
                this.toggleAnimation();
            }
        });
    }

    toggleAnimation() {
        if (this.isPaused) {
            this.startScraper();
            this.isPaused = false;
            console.log('アニメーション再開');
        } else {
            this.stopScraper();
            this.isPaused = true;
            console.log('アニメーション一時停止');
        }
    }

    // === スクレーパーアニメーション関連（台形版） ===

    initScraper() {
        // === 基準サイズ（手動調整で最適だった値） ===
        const BASE_IMAGE_SIZE = { width: 1000, height: 750 };
        const BASE_CONFIG = {
            borderWidth: 9,
            bladeSize: 20,
            bladeSpacing: 60,  // 間隔を狭めてブレード数をさらに増加
            speed: 0.56,  // 0.8 * 0.7
            // 台形の4つの頂点を定義
            trapezoid: {
                topLeft: { x: 390, y: 120 },      // 上辺左端
                topRight: { x: 600, y: 120 },     // 上辺右端
                bottomRight: { x: 600, y: 410 },  // 下辺右端
                bottomLeft: { x: 70, y: 410 }     // 下辺左端（extension底辺左）
            }
        };

        // === 現在の画像サイズを取得してスケール計算 ===
        const baseImage = document.querySelector('.base-image');
        const currentImageSize = {
            width: baseImage.offsetWidth,
            height: baseImage.offsetHeight
        };

        const scaleX = currentImageSize.width / BASE_IMAGE_SIZE.width;
        const scaleY = currentImageSize.height / BASE_IMAGE_SIZE.height;

        // === スケールを適用した設定 ===
        this.CONFIG = {
            borderWidth: Math.round(BASE_CONFIG.borderWidth * scaleX),
            bladeSize: Math.round(BASE_CONFIG.bladeSize * scaleX),
            bladeSpacing: Math.round(BASE_CONFIG.bladeSpacing * scaleX),
            speed: BASE_CONFIG.speed,

            // 台形の頂点をスケーリング
            trapezoid: {
                topLeft: {
                    x: Math.round(BASE_CONFIG.trapezoid.topLeft.x * scaleX),
                    y: Math.round(BASE_CONFIG.trapezoid.topLeft.y * scaleY)
                },
                topRight: {
                    x: Math.round(BASE_CONFIG.trapezoid.topRight.x * scaleX),
                    y: Math.round(BASE_CONFIG.trapezoid.topRight.y * scaleY)
                },
                bottomRight: {
                    x: Math.round(BASE_CONFIG.trapezoid.bottomRight.x * scaleX),
                    y: Math.round(BASE_CONFIG.trapezoid.bottomRight.y * scaleY)
                },
                bottomLeft: {
                    x: Math.round(BASE_CONFIG.trapezoid.bottomLeft.x * scaleX),
                    y: Math.round(BASE_CONFIG.trapezoid.bottomLeft.y * scaleY)
                }
            }
        };

        // === 軌道設定 ===
        this.track = this.CONFIG.trapezoid;

        this.perimeter = this.calculateTrapezoidPerimeter();
        this.bladeCount = Math.floor(this.perimeter / this.CONFIG.bladeSpacing);

        // スタイルとトラック初期化
        this.initBladeStyles();
        this.initTrackStyles();
        this.initAxleStyles();
        this.initTrack();
        this.initAxles();
        this.initBlades();

        // アニメーション開始
        this.startScraper();
    }

    calculateTrapezoidPerimeter() {
        // 上辺の長さ
        const topLength = Math.abs(this.track.topRight.x - this.track.topLeft.x);

        // 右辺の長さ
        const rightLength = Math.abs(this.track.bottomRight.y - this.track.topRight.y);

        // 下辺の長さ
        const bottomLength = Math.abs(this.track.bottomRight.x - this.track.bottomLeft.x);

        // 左辺（斜辺）の長さ
        const leftDx = this.track.bottomLeft.x - this.track.topLeft.x;
        const leftDy = this.track.bottomLeft.y - this.track.topLeft.y;
        const leftLength = Math.sqrt(leftDx * leftDx + leftDy * leftDy);

        return topLength + rightLength + bottomLength + leftLength;
    }

    initBladeStyles() {
        const style = document.createElement('style');
        const size = this.CONFIG.bladeSize;
        const thickness = Math.floor(size / 3);

        if (this.reverseDirection) {
            // 逆回転時の形状
            style.textContent = `
                .scraper-blade {
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    transition: none;
                    z-index: 3;
                }

                .blade-top::before {
                    content: '';
                    position: absolute;
                    width: ${thickness}px;
                    height: ${size}px;
                    background: black;
                    left: 0;
                    top: 0;
                }
                .blade-top::after {
                    content: '';
                    position: absolute;
                    width: ${size}px;
                    height: ${thickness}px;
                    background: black;
                    left: 0;
                    bottom: 0;
                }

                .blade-left::before {
                    content: '';
                    position: absolute;
                    width: ${thickness}px;
                    height: ${size}px;
                    background: black;
                    right: 0;
                    top: 0;
                }
                .blade-left::after {
                    content: '';
                    position: absolute;
                    width: ${size}px;
                    height: ${thickness}px;
                    background: black;
                    left: 0;
                    bottom: 0;
                }

                .blade-bottom::before {
                    content: '';
                    position: absolute;
                    width: ${thickness}px;
                    height: ${size}px;
                    background: black;
                    right: 0;
                    top: 0;
                }
                .blade-bottom::after {
                    content: '';
                    position: absolute;
                    width: ${size}px;
                    height: ${thickness}px;
                    background: black;
                    left: 0;
                    top: 0;
                }

                .blade-right::before {
                    content: '';
                    position: absolute;
                    width: ${thickness}px;
                    height: ${size}px;
                    background: black;
                    left: 0;
                    top: 0;
                }
                .blade-right::after {
                    content: '';
                    position: absolute;
                    width: ${size}px;
                    height: ${thickness}px;
                    background: black;
                    left: 0;
                    top: 0;
                }

                .blade-diagonal::before {
                    content: '';
                    position: absolute;
                    width: ${thickness}px;
                    height: ${size}px;
                    background: black;
                    left: 0;
                    top: 0;
                }
                .blade-diagonal::after {
                    content: '';
                    position: absolute;
                    width: ${size}px;
                    height: ${thickness}px;
                    background: black;
                    left: 0;
                    bottom: 0;
                }
            `;
        } else {
            // 通常回転
            style.textContent = `
                .scraper-blade {
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    transition: none;
                    z-index: 3;
                }

                .blade-top::before {
                    content: '';
                    position: absolute;
                    width: ${thickness}px;
                    height: ${size}px;
                    background: black;
                    right: 0;
                    top: 0;
                }
                .blade-top::after {
                    content: '';
                    position: absolute;
                    width: ${size}px;
                    height: ${thickness}px;
                    background: black;
                    left: 0;
                    bottom: 0;
                }

                .blade-right::before {
                    content: '';
                    position: absolute;
                    width: ${thickness}px;
                    height: ${size}px;
                    background: black;
                    left: 0;
                    top: 0;
                }
                .blade-right::after {
                    content: '';
                    position: absolute;
                    width: ${size}px;
                    height: ${thickness}px;
                    background: black;
                    left: 0;
                    bottom: 0;
                }

                .blade-bottom::before {
                    content: '';
                    position: absolute;
                    width: ${thickness}px;
                    height: ${size}px;
                    background: black;
                    left: 0;
                    top: 0;
                }
                .blade-bottom::after {
                    content: '';
                    position: absolute;
                    width: ${size}px;
                    height: ${thickness}px;
                    background: black;
                    left: 0;
                    top: 0;
                }

                .blade-left::before,
                .blade-diagonal::before {
                    content: '';
                    position: absolute;
                    width: ${thickness}px;
                    height: ${size}px;
                    background: black;
                    right: 0;
                    top: 0;
                }
                .blade-left::after,
                .blade-diagonal::after {
                    content: '';
                    position: absolute;
                    width: ${size}px;
                    height: ${thickness}px;
                    background: black;
                    left: 0;
                    top: 0;
                }
            `;
        }
        document.head.appendChild(style);
    }

    initTrackStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .scraper-track-trapezoid {
                position: absolute;
                z-index: 4;
            }
        `;
        document.head.appendChild(style);
    }

    initAxleStyles() {
        const style = document.createElement('style');
        const axleSize = this.CONFIG.borderWidth * 5;
        style.textContent = `
            .scraper-axle {
                position: absolute;
                width: ${axleSize}px;
                height: ${axleSize}px;
                z-index: 5;
                animation: rotateGear 4s linear infinite;
            }

            @keyframes rotateGear {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(-360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }

    initTrack() {
        const container = document.getElementById('scraperContainer');

        // SVGで台形のトラックを描画
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'scraper-track-trapezoid');
        svg.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = `
            ${this.track.topLeft.x},${this.track.topLeft.y}
            ${this.track.topRight.x},${this.track.topRight.y}
            ${this.track.bottomRight.x},${this.track.bottomRight.y}
            ${this.track.bottomLeft.x},${this.track.bottomLeft.y}
        `;
        polygon.setAttribute('points', points);
        polygon.setAttribute('fill', 'none');
        polygon.setAttribute('stroke', 'black');
        polygon.setAttribute('stroke-width', this.CONFIG.borderWidth);

        svg.appendChild(polygon);
        container.appendChild(svg);
    }

    initAxles() {
        const container = document.getElementById('scraperContainer');
        const axleSize = this.CONFIG.borderWidth * 4;
        const offset = axleSize / 2;
        const inset = this.CONFIG.borderWidth / 2; // ボーダー幅の半分だけ内側

        // 台形の4つの角に軸を配置（トラックとボーダー内側の中間）
        const axlePositions = [
            { x: this.track.topLeft.x - offset + inset, y: this.track.topLeft.y - offset + inset },           // 左上
            { x: this.track.topRight.x - offset*2 - inset, y: this.track.topRight.y - offset + inset },         // 右上
            { x: this.track.bottomRight.x - offset*2 - inset, y: this.track.bottomRight.y - offset*1.5 - inset },   // 右下
            { x: this.track.bottomLeft.x + inset, y: this.track.bottomLeft.y - offset*1.5 - inset }      // 左下
        ];

        axlePositions.forEach((pos, index) => {
            const axle = document.createElement('img');
            axle.src = '../../material/gear.svg';
            axle.className = 'scraper-axle';
            axle.id = `axle-${index + 1}`;
            axle.alt = '歯車';
            axle.style.left = pos.x + 'px';
            axle.style.top = pos.y + 'px';
            container.appendChild(axle);
        });
    }

    initBlades() {
        const container = document.getElementById('scraperContainer');

        this.blades.forEach(blade => {
            if (blade.element && blade.element.parentNode) {
                blade.element.parentNode.removeChild(blade.element);
            }
        });
        this.blades = [];

        for (let i = 0; i < this.bladeCount; i++) {
            const blade = document.createElement('div');
            blade.className = 'scraper-blade blade-top';
            container.appendChild(blade);

            const position = (i * this.CONFIG.bladeSpacing) % this.perimeter;

            this.blades.push({
                element: blade,
                position: position
            });
        }

        this.updateBlades();
    }

    getBladeTransform(position) {
        const normalizedPos = position % this.perimeter;
        let cumulativeLength = 0;
        let x, y, direction, angle;

        // 1. 上辺（左から右へ）
        const topLength = this.track.topRight.x - this.track.topLeft.x;
        if (normalizedPos < cumulativeLength + topLength) {
            const localPos = normalizedPos - cumulativeLength;
            x = this.track.topLeft.x + localPos - this.CONFIG.bladeSize/2;
            y = this.track.topLeft.y - this.CONFIG.bladeSize;
            direction = 'top';
            angle = 0;
            return { x, y, direction, angle };
        }
        cumulativeLength += topLength;

        // 2. 右辺（上から下へ）
        const rightLength = this.track.bottomRight.y - this.track.topRight.y;
        if (normalizedPos < cumulativeLength + rightLength) {
            const localPos = normalizedPos - cumulativeLength;
            x = this.track.topRight.x;
            y = this.track.topRight.y + localPos - this.CONFIG.bladeSize/2;
            direction = 'right';
            angle = 0;
            return { x, y, direction, angle };
        }
        cumulativeLength += rightLength;

        // 3. 下辺（右から左へ）
        const bottomLength = this.track.bottomRight.x - this.track.bottomLeft.x;
        if (normalizedPos < cumulativeLength + bottomLength) {
            const localPos = normalizedPos - cumulativeLength;
            x = this.track.bottomRight.x - localPos - this.CONFIG.bladeSize/2;
            y = this.track.bottomRight.y;
            direction = 'bottom';
            angle = 0;
            return { x, y, direction, angle };
        }
        cumulativeLength += bottomLength;

        // 4. 左辺（斜辺：下から上へ）
        const leftDx = this.track.topLeft.x - this.track.bottomLeft.x;
        const leftDy = this.track.topLeft.y - this.track.bottomLeft.y;
        const leftLength = Math.sqrt(leftDx * leftDx + leftDy * leftDy);

        const localPos = normalizedPos - cumulativeLength;
        const ratio = localPos / leftLength;

        // 斜辺の角度を計算（ラジアンから度に変換）
        angle = Math.atan2(leftDy, leftDx) * (180 / Math.PI);

        // ブレードの底辺がトラックに密着するように位置調整
        // トラックの太さの半分だけ左上に移動
        x = this.track.bottomLeft.x + leftDx * ratio - this.CONFIG.bladeSize - this.CONFIG.borderWidth / 2;
        y = this.track.bottomLeft.y + leftDy * ratio - this.CONFIG.bladeSize/2 - this.CONFIG.borderWidth / 2;
        direction = 'diagonal';

        return { x, y, direction, angle };
    }

    updateBlades(deltaFactor = 1) {
        this.blades.forEach(blade => {
            const transform = this.getBladeTransform(blade.position);

            blade.element.style.left = transform.x + 'px';
            blade.element.style.top = transform.y + 'px';
            blade.element.className = `scraper-blade blade-${transform.direction}`;

            // 斜辺では角度をつける
            if (transform.angle !== 0) {
                blade.element.style.transform = `rotate(${transform.angle}deg)`;
                blade.element.style.transformOrigin = 'center center';
            } else {
                blade.element.style.transform = '';
            }

            if (this.reverseDirection) {
                blade.position = (blade.position - this.CONFIG.speed * deltaFactor + this.perimeter) % this.perimeter;
            } else {
                blade.position = (blade.position + this.CONFIG.speed * deltaFactor) % this.perimeter;
            }
        });
    }

    startScraper() {
        if (this.animationId) return;

        const animate = () => {
            if (!this.isPaused) {
                const currentTime = performance.now();
                const deltaTime = (currentTime - this.lastTime) / 1000; // 秒単位
                this.lastTime = currentTime;

                // 60fpsを基準とした係数
                const deltaFactor = deltaTime * 60;

                this.updateBlades(deltaFactor);
            }
            this.animationId = requestAnimationFrame(animate);
        };

        this.lastTime = performance.now(); // 開始時刻をリセット
        animate();
    }

    stopScraper() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// DOM読み込み完了後にアニメーション開始
if (typeof window.scraperConfig === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new ShochinAnimation();
    });
}

// パフォーマンス監視
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        console.log('アニメーション最適化完了（台形版）');
    });
}
