// Background Service Worker (Manifest V3)

// 拡張機能のインストール時
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Bookmark AI Agent がインストールされました');
    
    // 初期設定（必要に応じて）
    chrome.storage.local.set({
      bookmarkCount: 0,
      lastSyncDate: null
    });
  } else if (details.reason === 'update') {
    console.log('Bookmark AI Agent が更新されました');
  }
});

// 拡張機能アイコンのクリック時
chrome.action.onClicked.addListener((tab) => {
  // ポップアップが設定されている場合は自動的に開くため、
  // このイベントハンドラは通常実行されない
  console.log('Extension icon clicked on tab:', tab.id);
});

// メッセージリスナー（他のスクリプトからのメッセージを受信）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'incrementBookmarkCount') {
    // ブックマーク数をインクリメント
    chrome.storage.local.get(['bookmarkCount'], (result) => {
      const newCount = (result.bookmarkCount || 0) + 1;
      chrome.storage.local.set({ bookmarkCount: newCount }, () => {
        sendResponse({ success: true, count: newCount });
      });
    });
    return true; // 非同期レスポンスを有効化
  }
  
  if (request.action === 'getStats') {
    // 統計情報を取得
    chrome.storage.local.get(['bookmarkCount', 'lastSyncDate'], (result) => {
      sendResponse({
        bookmarkCount: result.bookmarkCount || 0,
        lastSyncDate: result.lastSyncDate || null
      });
    });
    return true;
  }
});

// エラーハンドリング
chrome.runtime.onError = (error) => {
  console.error('Runtime error:', error);
};

// 定期的なクリーンアップ（必要に応じて）
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24時間

setInterval(() => {
  console.log('定期クリーンアップ実行');
  // 必要に応じて古いデータの削除など
}, CLEANUP_INTERVAL);

/**
 * 通知を表示（将来の機能拡張用）
 */
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: title,
    message: message,
    priority: 2
  });
}

/**
 * バッジにブックマーク数を表示（将来の機能拡張用）
 */
function updateBadge() {
  chrome.storage.local.get(['bookmarkCount'], (result) => {
    const count = result.bookmarkCount || 0;
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  });
}

// 初回ロード時にバッジを更新
updateBadge();
