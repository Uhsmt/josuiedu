// スイスイくんアニメーション
class SuisuiAnimation {
    constructor() {
        this.container = document.getElementById('suisui-area');
        this.fishes = [];
        this.lastTime = performance.now(); // 時間管理用

        // 魚の種類と数
        const fishTypes = [
            { name: 'suisui1', count: 2 },
            { name: 'suisui2', count: 2 }
        ];

        // 各魚を生成
        fishTypes.forEach(fish => {
            for (let i = 0; i < fish.count; i++) {
                this.createFish(fish.name, i);
            }
        });

        // アニメーションループを開始
        this.animate();
    }

    createFish(fishType, index) {
        const fishImg = document.createElement('img');
        fishImg.src = `../../material/${fishType}.png`;
        fishImg.alt = fishType;
        fishImg.style.position = 'absolute';
        fishImg.style.width = '40px';
        fishImg.style.height = '40px';
        fishImg.style.transition = 'transform 0.3s ease';

        this.container.appendChild(fishImg);

        // 魚のデータオブジェクト
        const fish = {
            element: fishImg,
            x: Math.random() * (this.container.offsetWidth - 40),
            y: Math.random() * (this.container.offsetHeight - 40),
            vx: (Math.random() - 0.5) * 1.4,  // 2 * 0.7
            vy: (Math.random() - 0.5) * 1.4,  // 2 * 0.7
            speed: 0.7 + Math.random() * 0.7,  // (1~2) * 0.7
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.014 + Math.random() * 0.014  // (0.02 + 0.02) * 0.7
        };

        this.fishes.push(fish);
    }

    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // 秒単位
        this.lastTime = currentTime;

        // 60fpsを基準とした係数
        const deltaFactor = deltaTime * 60;

        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;
        const fishSize = 40;

        this.fishes.forEach(fish => {
            // 揺らぎを追加
            fish.wobblePhase += fish.wobbleSpeed * deltaFactor;
            const wobbleX = Math.sin(fish.wobblePhase) * 0.3;
            const wobbleY = Math.cos(fish.wobblePhase * 1.3) * 0.3;

            // 速度に揺らぎを加えて移動
            fish.x += (fish.vx + wobbleX) * fish.speed * deltaFactor;
            fish.y += (fish.vy + wobbleY) * fish.speed * deltaFactor;

            // 壁で反射（境界チェック）
            if (fish.x <= 0 || fish.x >= containerWidth - fishSize) {
                fish.vx *= -1;
                fish.x = Math.max(0, Math.min(containerWidth - fishSize, fish.x));
            }
            if (fish.y <= 0 || fish.y >= containerHeight - fishSize) {
                fish.vy *= -1;
                fish.y = Math.max(0, Math.min(containerHeight - fishSize, fish.y));
            }

            // ランダムに方向を微調整（ふらふら感を出す）
            if (Math.random() < 0.02) {
                fish.vx += (Math.random() - 0.5) * 0.35;  // 0.5 * 0.7
                fish.vy += (Math.random() - 0.5) * 0.35;  // 0.5 * 0.7

                // 速度を制限
                const currentSpeed = Math.sqrt(fish.vx * fish.vx + fish.vy * fish.vy);
                if (currentSpeed > 1.4) {  // 2 * 0.7
                    fish.vx = (fish.vx / currentSpeed) * 1.4;
                    fish.vy = (fish.vy / currentSpeed) * 1.4;
                }
            }

            // 位置を更新
            fish.element.style.left = `${fish.x}px`;
            fish.element.style.top = `${fish.y}px`;

            // 進行方向に応じて反転（右に動く時は反転、左に動く時はデフォルト）
            fish.element.style.transform = fish.vx > 0 ? 'scaleX(-1)' : 'scaleX(1)';
        });

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new SuisuiAnimation();
});