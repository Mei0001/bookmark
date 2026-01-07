// n8n Webhook URL（環境に応じて変更してください）
const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/bookmark';

// ページ情報とメタデータを格納
let pageData = {};

// 初期化処理
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 現在のタブ情報を取得
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showError('タブ情報を取得できませんでした');
      return;
    }

    // ページの基本情報を表示
    displayPageInfo(tab);

    // Content Scriptにメタデータ取得を依頼
    chrome.tabs.sendMessage(tab.id, { action: 'getMetadata' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        showMetadata({ title: tab.title, url: tab.url });
        return;
      }
      
      if (response && response.metadata) {
        pageData = response.metadata;
        showMetadata(response.metadata);
      }
    });

  } catch (error) {
    console.error('Initialization error:', error);
    showError('初期化に失敗しました');
  }

  // イベントリスナーの設定
  setupEventListeners();
});

// ページ情報を表示
function displayPageInfo(tab) {
  document.getElementById('pageTitle').textContent = tab.title || 'タイトルなし';
  document.getElementById('pageUrl').textContent = tab.url || '';
  
  pageData.url = tab.url;
  pageData.title = tab.title;
}

// メタデータを表示
function showMetadata(metadata) {
  const metadataList = document.getElementById('metadataList');
  metadataList.innerHTML = '';

  const items = [
    { label: 'タイトル', value: metadata.title },
    { label: 'URL', value: metadata.url },
    { label: 'サイト名', value: metadata.siteName || '取得できませんでした' },
    { label: 'ドメイン', value: metadata.domain || extractDomain(metadata.url) },
    { label: 'ディスクリプション', value: metadata.description ? `${metadata.description.substring(0, 50)}...` : '取得できませんでした' }
  ];

  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
    metadataList.appendChild(li);
  });
}

// ドメインを抽出
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return '';
  }
}

// イベントリスナーの設定
function setupEventListeners() {
  // 文字数カウント
  const userMemoInput = document.getElementById('userMemo');
  const charCountSpan = document.getElementById('charCount');
  
  userMemoInput.addEventListener('input', () => {
    const length = userMemoInput.value.length;
    charCountSpan.textContent = length;
    
    // 文字数に応じて色を変更
    if (length < 10) {
      charCountSpan.style.color = '#e74c3c';
    } else if (length >= 10 && length <= 20) {
      charCountSpan.style.color = '#27ae60';
    }
  });

  // フォーム送信
  document.getElementById('bookmarkForm').addEventListener('submit', handleSubmit);

  // キャンセルボタン
  document.getElementById('cancelButton').addEventListener('click', () => {
    window.close();
  });
}

// フォーム送信処理
async function handleSubmit(e) {
  e.preventDefault();

  const userMemo = document.getElementById('userMemo').value.trim();
  
  if (userMemo.length < 10 || userMemo.length > 20) {
    showError('ブックマーク理由は10〜20文字で入力してください');
    return;
  }

  // 送信データの準備
  const bookmarkData = {
    ...pageData,
    userMemo: userMemo,
    bookmarkedAt: new Date().toISOString(),
    domain: pageData.domain || extractDomain(pageData.url)
  };

  // ボタンを無効化
  const saveButton = document.getElementById('saveButton');
  saveButton.disabled = true;
  saveButton.textContent = '保存中...';

  try {
    // n8n Webhookに送信
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmarkData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    showSuccess('ブックマークを保存しました！');
    
    // 2秒後にウィンドウを閉じる
    setTimeout(() => {
      window.close();
    }, 2000);

  } catch (error) {
    console.error('Save error:', error);
    showError('保存に失敗しました。もう一度お試しください。');
    saveButton.disabled = false;
    saveButton.textContent = 'ブックマークを保存';
  }
}

// 成功メッセージを表示
function showSuccess(message) {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = message;
  statusMessage.className = 'status-message success';
  statusMessage.classList.remove('hidden');
}

// エラーメッセージを表示
function showError(message) {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = message;
  statusMessage.className = 'status-message error';
  statusMessage.classList.remove('hidden');
}
