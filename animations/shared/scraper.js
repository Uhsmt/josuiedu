// 最初沈殿池アニメーション制御
class ShochinAnimation {
    constructor(options = {}) {
        this.animationId = null;
        this.blades = [];
        this.isPaused = false;
        this.reverseDirection = options.reverse || false;

        this.init();
        this.setupControls();
        this.initScraper();
    }
    
    init() {
        console.log('最初沈殿池アニメーション開始');
        
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
    
    // === スクレーパーアニメーション関連 ===
    
    initScraper() {
        // === 基準サイズ（手動調整で最適だった値） ===
        const BASE_IMAGE_SIZE = { width: 1000, height: 750 };
        const BASE_CONFIG = {
            borderWidth: 9,
            bladeSize: 20,
            bladeSpacing: 100,
            speed: 0.8,
            main: {
                top: 120,
                left: 390,
                width: 210,
                height: 290
            },
            extension: {
                top: 270,
                left: 70,
                width: 320,
                height: 140
            },
            borderPartial: {
                top: 120,
                left: 390,
                height: 158
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

            main: {
                top: Math.round(BASE_CONFIG.main.top * scaleY),
                left: Math.round(BASE_CONFIG.main.left * scaleX),
                width: Math.round(BASE_CONFIG.main.width * scaleX),
                height: Math.round(BASE_CONFIG.main.height * scaleY)
            },

            extension: {
                top: Math.round(BASE_CONFIG.extension.top * scaleY),
                left: Math.round(BASE_CONFIG.extension.left * scaleX),
                width: Math.round(BASE_CONFIG.extension.width * scaleX),
                height: Math.round(BASE_CONFIG.extension.height * scaleY)
            },

            borderPartial: {
                top: Math.round(BASE_CONFIG.borderPartial.top * scaleY),
                left: Math.round(BASE_CONFIG.borderPartial.left * scaleX),
                height: Math.round(BASE_CONFIG.borderPartial.height * scaleY)
            }
        };
        
        // === 軌道設定（スケール済みの値を使用） ===
        this.track = {
            main: {
                top: this.CONFIG.main.top,
                left: this.CONFIG.main.left,
                width: this.CONFIG.main.width,
                height: this.CONFIG.main.height
            },
            extension: {
                top: this.CONFIG.extension.top,
                left: this.CONFIG.extension.left,
                width: this.CONFIG.extension.width,
                height: this.CONFIG.extension.height
            }
        };
        
        this.perimeter = this.calculateLPerimeter();
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
    
    calculateLPerimeter() {
        const mainTop = this.track.main.width;
        const mainRight = this.track.main.height; 
        const mainBottom = this.track.main.width;
        
        const extBottom = this.track.extension.width;
        const extLeft = this.track.extension.height;
        const extTop = this.track.extension.width - (this.CONFIG.bladeSize/2 + this.CONFIG.borderWidth);
        
        const mainLeftTop = this.track.extension.top - this.track.main.top;
        
        return mainTop + mainRight + mainBottom + extBottom + extLeft + extTop + mainLeftTop;
    }
    
    initBladeStyles() {
        const style = document.createElement('style');
        const size = this.CONFIG.bladeSize;
        const thickness = Math.floor(size / 3);

        if (this.reverseDirection) {
            // 逆回転時の形状：
            // 上辺（左に進む）：Lの形 = 縦棒左、横棒下
            // 左辺（下に進む）：」の形 = 縦棒右、横棒下
            // 下辺（右に進む）：「の形 = 縦棒左、横棒上
            // 右辺（上に進む）：「の形 = 縦棒左、横棒上
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
            `;
        } else {
            // 通常：L字の縦棒を右側に
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
                    top: 0;
                }
            `;
        }
        document.head.appendChild(style);
    }
    
    initTrackStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .scraper-track {
                position: absolute;
                border: ${this.CONFIG.borderWidth}px solid black;
                background: none;
                box-sizing: border-box;
                z-index: 4;
            }

            .track-main {
                border-left: none !important;
            }

            .track-extension {
                border-right: none !important;
            }

            .border-partial {
                position: absolute;
                border-left: ${this.CONFIG.borderWidth}px solid black;
                z-index: 4;
            }
        `;
        document.head.appendChild(style);
    }
    
    initAxleStyles() {
        const style = document.createElement('style');
        const axleSize = this.CONFIG.borderWidth * 3; // 軸の直径
        style.textContent = `
            .scraper-axle {
                position: absolute;
                width: ${axleSize}px;
                height: ${axleSize}px;
                background: #f5f5f5;
                border-radius: 50%;
                border: 2px solid #888;
                z-index: 2;
            }
        `;
        document.head.appendChild(style);
    }
    
    initTrack() {
        const container = document.getElementById('scraperContainer');
        
        const mainTrack = document.createElement('div');
        mainTrack.className = 'scraper-track track-main';
        mainTrack.style.cssText = `top: ${this.track.main.top}px; left: ${this.track.main.left}px; width: ${this.track.main.width}px; height: ${this.track.main.height}px;`;
        container.appendChild(mainTrack);
        
        const extTrack = document.createElement('div');
        extTrack.className = 'scraper-track track-extension';
        extTrack.style.cssText = `top: ${this.track.extension.top}px; left: ${this.track.extension.left}px; width: ${this.track.extension.width}px; height: ${this.track.extension.height}px;`;
        container.appendChild(extTrack);
        
        const borderPartial = document.createElement('div');
        borderPartial.className = 'border-partial';
        borderPartial.style.cssText = `top: ${this.CONFIG.borderPartial.top}px; left: ${this.CONFIG.borderPartial.left}px; width: 0px; height: ${this.CONFIG.borderPartial.height}px;`;
        container.appendChild(borderPartial);
    }
    
    initAxles() {
        const container = document.getElementById('scraperContainer');
        const axleSize = this.CONFIG.borderWidth * 3;
        const offset = axleSize / 2;

        // L字型軌道の5つの角の座標（内側に配置 + 微調整）
        const adjustment = 8; // 微調整のピクセル数
        const axlePositions = [
            // 1. メイン長方形の左上角（内側） - 下に + 右に
            {
                x: this.track.main.left + this.CONFIG.borderWidth - offset + adjustment,
                y: this.track.main.top + this.CONFIG.borderWidth - offset + adjustment
            },
            // 2. メイン長方形の右上角（内側） - 下に + 左に
            {
                x: this.track.main.left + this.track.main.width - this.CONFIG.borderWidth - offset - adjustment,
                y: this.track.main.top + this.CONFIG.borderWidth - offset + adjustment
            },
            // 3. メイン長方形の右下角（内側） - 上に + 左に
            {
                x: this.track.main.left + this.track.main.width - this.CONFIG.borderWidth - offset - adjustment,
                y: this.track.main.top + this.track.main.height - this.CONFIG.borderWidth - offset - adjustment
            },
            // 4. 突出部分の左下角（内側） - 上に + 右に
            {
                x: this.track.extension.left + this.CONFIG.borderWidth - offset + adjustment,
                y: this.track.extension.top + this.track.extension.height - this.CONFIG.borderWidth - offset - adjustment
            },
            // 5. 突出部分の左上角（内側） - 下に + 右に
            {
                x: this.track.extension.left + this.CONFIG.borderWidth - offset + adjustment,
                y: this.track.extension.top + this.CONFIG.borderWidth - offset + adjustment
            },
            // 6. メインと突出の接点の上の角（90度側）- 外側配置 + さらに左に
            {
                x: this.track.main.left - this.CONFIG.borderWidth - offset,
                y: this.track.extension.top - this.CONFIG.borderWidth - offset
            }
        ];

        axlePositions.forEach((pos, index) => {
            const axle = document.createElement('div');
            axle.className = 'scraper-axle';
            axle.id = `axle-${index + 1}`; // 管理用ID
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
        let x, y, direction;

        // 1. メイン長方形の上辺
        const seg1 = this.track.main.width;
        if (normalizedPos < cumulativeLength + seg1) {
            const localPos = normalizedPos - cumulativeLength;
            x = this.track.main.left + localPos - this.CONFIG.bladeSize/2;
            y = this.track.main.top - this.CONFIG.bladeSize;
            direction = 'top';
            return { x, y, direction };
        }
        cumulativeLength += seg1;

        // 2. メイン長方形の右辺
        const seg2 = this.track.main.height;
        if (normalizedPos < cumulativeLength + seg2) {
            const localPos = normalizedPos - cumulativeLength;
            x = this.track.main.left + this.track.main.width;
            y = this.track.main.top + localPos - this.CONFIG.bladeSize/2;
            direction = 'right';
            return { x, y, direction };
        }
        cumulativeLength += seg2;

        // 3. メイン長方形の下辺
        const seg3 = this.track.main.width;
        if (normalizedPos < cumulativeLength + seg3) {
            const localPos = normalizedPos - cumulativeLength;
            x = this.track.main.left + this.track.main.width - localPos - this.CONFIG.bladeSize/2;
            y = this.track.main.top + this.track.main.height;
            direction = 'bottom';
            return { x, y, direction };
        }
        cumulativeLength += seg3;

        // 4. 突出部分の下辺
        const seg4 = this.track.extension.width;
        if (normalizedPos < cumulativeLength + seg4) {
            const localPos = normalizedPos - cumulativeLength;
            x = this.track.main.left - localPos - this.CONFIG.bladeSize/2;
            y = this.track.extension.top + this.track.extension.height;
            direction = 'bottom';
            return { x, y, direction };
        }
        cumulativeLength += seg4;

        // 5. 突出部分の左辺
        const seg5 = this.track.extension.height;
        if (normalizedPos < cumulativeLength + seg5) {
            const localPos = normalizedPos - cumulativeLength;
            x = this.track.extension.left - this.CONFIG.bladeSize;
            y = this.track.extension.top + this.track.extension.height - localPos - this.CONFIG.bladeSize/2;
            direction = 'left';
            return { x, y, direction };
        }
        cumulativeLength += seg5;

        // 6. 突出部分の上辺
        const seg6 = this.track.extension.width - (this.CONFIG.bladeSize/2 + this.CONFIG.borderWidth);
        if (normalizedPos < cumulativeLength + seg6) {
            const localPos = normalizedPos - cumulativeLength;
            x = this.track.extension.left + localPos - this.CONFIG.bladeSize/2;
            y = this.track.extension.top - this.CONFIG.bladeSize;
            direction = 'top';
            return { x, y, direction };
        }
        cumulativeLength += seg6;

        // 7. メイン長方形の左辺上部
        const seg7 = this.track.extension.top - this.track.main.top;
        const localPos = normalizedPos - cumulativeLength;
        x = this.track.main.left - this.CONFIG.bladeSize;
        y = this.track.extension.top - localPos - this.CONFIG.bladeSize/2;
        direction = 'left';

        return { x, y, direction };
    }
    
    updateBlades() {
        this.blades.forEach(blade => {
            const transform = this.getBladeTransform(blade.position);

            blade.element.style.left = transform.x + 'px';
            blade.element.style.top = transform.y + 'px';
            blade.element.className = `scraper-blade blade-${transform.direction}`;

            if (this.reverseDirection) {
                blade.position = (blade.position - this.CONFIG.speed + this.perimeter) % this.perimeter;
            } else {
                blade.position = (blade.position + this.CONFIG.speed) % this.perimeter;
            }
        });
    }
    
    startScraper() {
        if (this.animationId) return;
        
        const animate = () => {
            if (!this.isPaused) {
                this.updateBlades();
            }
            this.animationId = requestAnimationFrame(animate);
        };
        
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
// デフォルトの初期化（HTMLから上書き可能）
if (typeof window.scraperConfig === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new ShochinAnimation();
    });
}

// パフォーマンス監視
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        console.log('アニメーション最適化完了');
    });
}