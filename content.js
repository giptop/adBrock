// YouTube広告ブロック用content script

// 広告要素を削除する関数
function removeAds() {
    // より精密なYouTube広告のセレクタ（本来のコンテンツを避ける）
    const adSelectors = [
        // 動画プレーヤー内の広告のみ
        '.ytp-ad-module',
        '.ytp-ad-overlay-container',
        '.ytp-ad-text-overlay', 
        '.ytp-ad-player-overlay',
        '.ytp-ad-player-overlay-skip-or-preview',
        '.ytp-ad-skip-button-container',
        '.ytp-ad-button-container',
        
        // 確実に広告のもののみ
        '[id^="google_ads_iframe"]',
        '[data-ad-unit-path]',
        'ytd-ad-slot-renderer',
        'ytd-display-ad-renderer',
        'ytd-promoted-sparkles-web-renderer',
        'ytd-promoted-video-renderer',
        'ytd-compact-promoted-video-renderer',
        'ytd-in-feed-ad-layout-renderer',
        
        // マストヘッド広告
        '#masthead-ad',
        '.masthead-ad-control'
    ];

    // 各セレクタに対して要素を削除（ただし慎重に）
    adSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // 要素が実際に広告かどうか追加チェック
            if (element && isActualAd(element)) {
                element.style.display = 'none'; // 削除ではなく非表示にして影響を最小化
            }
        });
    });

    // YouTube Shorts広告（is-ad属性があるもののみ）
    const shortsAds = document.querySelectorAll('ytd-reel-video-renderer[is-ad="true"]');
    shortsAds.forEach(ad => ad.style.display = 'none');

    // 明確に広告スロットのもののみ
    const explicitAds = document.querySelectorAll('[data-ad-slot-id]');
    explicitAds.forEach(ad => ad.style.display = 'none');
}

// 要素が実際に広告かどうか判定する関数
function isActualAd(element) {
    // 広告でないことが確実な要素を除外
    if (element.querySelector('video') && !element.classList.contains('ytp-ad-module')) {
        return false; // 実際の動画コンテンツは除外
    }
    
    if (element.closest('ytd-watch-flexy')) {
        // 動画視聴ページの主要コンテンツエリアは除外（広告要素以外）
        if (!element.classList.contains('ytp-ad-module') && 
            !element.hasAttribute('data-ad-slot-id') &&
            !element.closest('.ytp-ad-overlay-container')) {
            return false;
        }
    }
    
    return true; // その他は広告と判定
}

// スキップボタンを自動クリック
function autoSkipAd() {
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
    if (skipButton && skipButton.offsetParent !== null) {
        skipButton.click();
    }
}

// ページ読み込み時に実行
function init() {
    removeAds();
    autoSkipAd();
}

// DOM監視を開始（より精密に）
const observer = new MutationObserver((mutations) => {
    let shouldRemoveAds = false;
    
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 確実に広告関連の要素が追加されたかのみチェック
                    if (node.querySelector && (
                        node.querySelector('.ytp-ad-module') ||
                        node.querySelector('[data-ad-slot-id]') ||
                        node.querySelector('ytd-ad-slot-renderer') ||
                        node.classList.contains('ytp-ad-overlay-container') ||
                        node.classList.contains('ytp-ad-module')
                    )) {
                        shouldRemoveAds = true;
                    }
                }
            });
        }
    });
    
    if (shouldRemoveAds) {
        setTimeout(() => {
            removeAds();
            autoSkipAd();
        }, 100);
    }
});

// ページの変更を監視（document.bodyが利用可能になってから）
function startObserver() {
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        // document.bodyがまだ存在しない場合は少し待ってから再試行
        setTimeout(startObserver, 100);
    }
}

// 初期実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        startObserver();
    });
} else {
    init();
    startObserver();
}

// 定期的にチェック（頻度を下げて負荷軽減）
setInterval(() => {
    removeAds();
    autoSkipAd();
}, 5000);

console.log('YouTube広告ブロッカーが有効になりました');