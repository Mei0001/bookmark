// Content Script: ページからメタデータを抽出

// メッセージリスナーの設定
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMetadata') {
    const metadata = extractMetadata();
    sendResponse({ metadata });
  }
  return true; // 非同期レスポンスを有効化
});

/**
 * ページからメタデータを抽出
 * 優先順位: OGP > Twitter Card > 標準HTMLメタタグ > ページタイトル
 */
function extractMetadata() {
  const metadata = {
    url: window.location.href,
    title: '',
    description: '',
    siteName: '',
    ogImage: '',
    domain: window.location.hostname
  };

  // タイトルの取得（優先順位順）
  metadata.title = 
    getMetaContent('og:title') ||
    getMetaContent('twitter:title') ||
    document.title ||
    'タイトルなし';

  // ディスクリプションの取得
  metadata.description = 
    getMetaContent('og:description') ||
    getMetaContent('twitter:description') ||
    getMetaContent('description') ||
    '';

  // サイト名の取得
  metadata.siteName = 
    getMetaContent('og:site_name') ||
    getMetaContent('twitter:site') ||
    extractSiteNameFromDomain(metadata.domain);

  // OGP画像の取得
  metadata.ogImage = 
    getMetaContent('og:image') ||
    getMetaContent('twitter:image') ||
    '';

  return metadata;
}

/**
 * メタタグの内容を取得
 * @param {string} name - メタタグの名前またはプロパティ
 * @returns {string} メタタグの内容
 */
function getMetaContent(name) {
  // property属性で検索（OGPタグ用）
  let element = document.querySelector(`meta[property="${name}"]`);
  
  // name属性で検索（標準メタタグ用）
  if (!element) {
    element = document.querySelector(`meta[name="${name}"]`);
  }
  
  return element ? element.getAttribute('content') : '';
}

/**
 * ドメインからサイト名を推測
 * @param {string} domain - ドメイン名
 * @returns {string} サイト名
 */
function extractSiteNameFromDomain(domain) {
  // サブドメインを除外
  const parts = domain.split('.');
  
  if (parts.length >= 2) {
    // 主要ドメインを取得（例: zenn.dev → zenn）
    return parts[parts.length - 2].charAt(0).toUpperCase() + 
           parts[parts.length - 2].slice(1);
  }
  
  return domain;
}

/**
 * 記事の本文を取得（将来の機能拡張用）
 * 現在は使用していないが、将来的に要約機能などで利用可能
 */
function extractArticleContent() {
  // articleタグから本文を取得
  const article = document.querySelector('article');
  if (article) {
    return article.innerText.substring(0, 500); // 最初の500文字のみ
  }

  // main要素から取得
  const main = document.querySelector('main');
  if (main) {
    return main.innerText.substring(0, 500);
  }

  return '';
}

// デバッグ用: メタデータをコンソールに出力
if (window.location.href.includes('debug=true')) {
  console.log('Bookmark AI Agent - Metadata:', extractMetadata());
}
