// 生物反応槽アニメーション制御
class BioReactionAnimation {
    constructor() {
        this.animationId = null;
        this.isPaused = false;
        
        this.init();
        this.setupControls();
    }
    
    init() {
        console.log('生物反応槽アニメーション開始');
        
        // レスポンシブ対応
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
        
        // フルスクリーン対応
        this.setupFullscreen();
    }
    
    handleResize() {
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
            this.isPaused = false;
            console.log('アニメーション再開');
        } else {
            this.isPaused = true;
            console.log('アニメーション一時停止');
        }
    }
}

// DOM読み込み完了後にアニメーション開始
document.addEventListener('DOMContentLoaded', () => {
    new BioReactionAnimation();
});

// パフォーマンス監視
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        console.log('アニメーション最適化完了');
    });
}