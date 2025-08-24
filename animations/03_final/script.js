// スイスイくんアニメーション
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('suisuiContainer');
    
    // 魚の種類と数
    const fishTypes = [
        { name: 'suisui1', count: 2 },
        { name: 'suisui2', count: 2 }
    ];
    
    // 各魚を生成
    fishTypes.forEach(fish => {
        for (let i = 0; i < fish.count; i++) {
            createFish(container, fish.name, i);
        }
    });
});

function createFish(container, fishType, index) {
    const fishImg = document.createElement('img');
    fishImg.src = `../../material/${fishType}.png`;
    fishImg.alt = fishType;
    fishImg.classList.add('suisui-fish', `${fishType}-${index}`);
    fishImg.id = `fish-${fishType}-${index}`;
    
    fishImg.style.position = 'absolute';
    fishImg.style.width = '40px';
    fishImg.style.height = '40px';
    fishImg.style.transformOrigin = 'center center';
    
    // 1体ずつ交互に反転させる
    if (index % 2 === 1) {
        fishImg.style.transform = 'scaleX(-1)';
    }
    
    // ランダムな泳ぎパターンを設定
    const swimDuration = 12 + Math.random() * 8; // 12-20秒
    const startDelay = Math.random() * 5; // 0-5秒の遅延
    
    fishImg.style.animationName = `swimFish-${fishType}-${index}`;
    fishImg.style.animationDuration = `${swimDuration}s`;
    fishImg.style.animationDelay = `${startDelay}s`;
    fishImg.style.animationIterationCount = 'infinite';
    fishImg.style.animationTimingFunction = 'linear';
    
    container.appendChild(fishImg);
    
    // CSS keyframes を動的に生成
    createSwimKeyframes(fishType, index, container.offsetWidth, container.offsetHeight);
}

function createSwimKeyframes(fishType, index, containerWidth, containerHeight) {
    const keyframeName = `swimFish-${fishType}-${index}`;
    
    // フラフラと泳ぐ経路を生成（コンテナ全域を活用）
    const points = [];
    const margin = 10; // マージンを縮小して全エリア活用
    
    // ランダムな8つの点でフラフラした経路を作成
    for (let i = 0; i < 8; i++) {
        const x = margin + Math.random() * (containerWidth - margin * 2 - 40);
        const y = margin + Math.random() * (containerHeight - margin * 2 - 40);
        points.push({ x, y });
    }
    
    // 最初の点を最後に追加してループさせる（瞬間移動防止）
    points.push({ x: points[0].x, y: points[0].y });
    
    // keyframes CSS を生成
    let keyframesCSS = `@keyframes ${keyframeName} {\n`;
    
    points.forEach((point, i) => {
        const percent = Math.round((i * 100) / (points.length - 1));
        
        keyframesCSS += `  ${percent}% { 
          left: ${point.x}px; 
          top: ${point.y}px; 
        }\n`;
    });
    keyframesCSS += '}\n';
    
    // スタイルシートに追加
    const style = document.createElement('style');
    style.textContent = keyframesCSS;
    document.head.appendChild(style);
}