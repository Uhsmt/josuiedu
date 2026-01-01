// キャプションコントローラー - 説明文の自動切り替えとハイライト表示を制御
class CaptionController {
    constructor(captions, interval = 5000) {
        this.captions = captions;
        this.interval = interval;
        this.currentIndex = 0;
        this.captionElement = document.getElementById('captionText');
        this.highlightLayer = document.getElementById('highlightLayer');

        if (!this.captionElement) {
            console.error('キャプション要素が見つかりません');
            return;
        }

        // 複数のキャプションがある場合のみ自動切り替えを開始
        if (this.captions.length > 1) {
            this.startAutoSwitch();
        } else {
            // 1つだけの場合は初期表示のみ
            this.showCaption(0);
        }
    }

    startAutoSwitch() {
        // 最初のキャプションを表示（初期状態）
        this.showCaption(0);
        this.captionElement.classList.add('fade-in');

        // 定期的にキャプションを切り替え
        setInterval(() => {
            this.nextCaption();
        }, this.interval);
    }

    nextCaption() {
        // すべてのクラスをクリア
        this.captionElement.classList.remove('fade-in', 'fade-in-start');

        // 次のフレームでフェードアウト開始
        requestAnimationFrame(() => {
            this.captionElement.classList.add('fade-out');
        });

        // フェードアウトの完了を待つ（500ms）
        setTimeout(() => {
            // 次のキャプションに移動
            this.currentIndex = (this.currentIndex + 1) % this.captions.length;
            this.showCaption(this.currentIndex);

            // fade-outを削除
            this.captionElement.classList.remove('fade-out');

            // フレームを1つ待機してからfade-in-startを設定
            requestAnimationFrame(() => {
                this.captionElement.classList.add('fade-in-start');

                // さらに次のフレームでfade-inに変更してアニメーション開始
                requestAnimationFrame(() => {
                    this.captionElement.classList.remove('fade-in-start');
                    this.captionElement.classList.add('fade-in');
                });
            });
        }, 500);
    }

    showCaption(index) {
        const caption = this.captions[index];

        // テキストを更新
        this.captionElement.innerHTML = caption.text;

        // ハイライトを更新
        this.updateHighlight(caption.highlight);
    }

    updateHighlight(highlightData) {
        // 既存のハイライトをクリア
        if (this.highlightLayer) {
            this.highlightLayer.innerHTML = '';
        }

        // ハイライトデータがない場合は終了
        if (!highlightData || !this.highlightLayer) {
            return;
        }

        // 単一のハイライトエリアの場合
        if (!Array.isArray(highlightData)) {
            highlightData = [highlightData];
        }

        // ハイライトエリアを作成
        highlightData.forEach(area => {
            const highlightDiv = document.createElement('div');
            highlightDiv.className = 'highlight-area';
            highlightDiv.style.top = area.top;
            highlightDiv.style.left = area.left;
            highlightDiv.style.width = area.width;
            highlightDiv.style.height = area.height;

            this.highlightLayer.appendChild(highlightDiv);
        });
    }
}

// グローバルに公開
window.CaptionController = CaptionController;
