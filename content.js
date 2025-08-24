// よくある広告パターンを削除
const selectors = [
  'iframe[src*="ads"]',
  'div[class*="ad"]',
  'div[id*="ad"]',
  'section[class*="sponsored"]',
];

function removeAds() {
  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => el.remove());
  });
}

// 初期実行
removeAds();

// SPA（スクロールや動的読み込み）対応のため監視
const observer = new MutationObserver(removeAds);
observer.observe(document.body, { childList: true, subtree: true });
