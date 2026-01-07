# セットアップ手順

このドキュメントでは、ブックマーク管理AIエージェントの初期セットアップ手順を説明します。

---

## 前提条件

以下のアカウント・環境が必要です：

- [ ] Google Chrome ブラウザ
- [ ] n8n アカウント（セルフホストまたはクラウド版）
- [ ] Notion アカウント
- [ ] OpenAI API キー
- [ ] Slack ワークスペース（通知先）

---

## 1. Notion Databaseの作成

### 1.1 新しいデータベースを作成

1. Notionで新しいページを作成
2. `/database` と入力して「Database - Full page」を選択
3. データベース名を「Bookmarks」に設定

### 1.2 プロパティの設定

以下のプロパティを追加してください：

| プロパティ名 | 型 | 説明 |
|------------|---|------|
| Title | タイトル | 記事タイトル（デフォルトで存在） |
| URL | URL | 記事URL |
| Description | テキスト | メタディスクリプション |
| User Memo | テキスト | ブックマーク理由 |
| Tags | マルチセレクト | 自動生成タグ |
| Site Name | セレクト | サイト名 |
| Domain | テキスト | ドメイン名 |
| OG Image | URL | OGP画像 |
| Bookmarked At | 日付 | ブックマーク登録日時 |
| Last Reminded | 日付 | 最終リマインド日時 |
| Reminder Count | 数値 | リマインド回数 |

### 1.3 タグのプリセット作成

「Tags」プロパティに以下のオプションを追加：
- AI
- プログラミング
- インフラ
- セキュリティ
- データ分析
- キャリア
- マーケティング
- 起業
- マネジメント
- UI/UX
- デザイン思考
- グラフィック
- 学習方法
- チュートリアル
- ドキュメント
- ライフハック
- エッセイ
- ニュース

### 1.4 Notion APIトークンの取得

1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. 「New integration」をクリック
3. Integration名を入力（例: Bookmark Agent）
4. 「Submit」をクリック
5. 表示される「Internal Integration Token」をコピー（後で使用）

### 1.5 データベースとIntegrationの接続

1. 作成したBookmarksデータベースを開く
2. 右上の「…」→「Connections」→「Connect to」
3. 作成したIntegration（Bookmark Agent）を選択

### 1.6 Database IDの取得

データベースのURLから Database ID を取得：
```
https://www.notion.so/workspace/abc123def456?v=xyz789
                              ↑
                        この部分がDatabase ID
```

---

## 2. n8nのセットアップ

### 2.1 n8nアカウントの準備

**セルフホストの場合:**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**クラウド版の場合:**
https://n8n.io/ からサインアップ

### 2.2 認証情報の設定

#### OpenAI API
1. n8nの「Credentials」メニューを開く
2. 「OpenAI」を選択
3. APIキーを入力

#### Notion API
1. n8nの「Credentials」メニューを開く
2. 「Notion API」を選択
3. Notion APIトークンを入力

#### Slack Webhook
1. [Slack API](https://api.slack.com/apps) で新しいアプリを作成
2. 「Incoming Webhooks」を有効化
3. Webhook URLを取得
4. n8nに設定

### 2.3 ワークフローのインポート

1. n8nの「Workflows」メニューを開く
2. 「Import from File」をクリック
3. `n8n/workflows/bookmark-save.json` をインポート
4. `n8n/workflows/weekly-recommend.json` をインポート

### 2.4 環境変数の設定

各ワークフロー内で以下を設定：

**bookmark-save.json:**
- Notion Database ID
- OpenAI API認証情報
- Notion API認証情報

**weekly-recommend.json:**
- Notion Database ID
- Slack Webhook URL
- 実行スケジュール（毎週日曜日 9:00推奨）

---

## 3. Chrome拡張機能のインストール

### 3.1 拡張機能のビルド（開発モード）

1. このリポジトリをクローン
```bash
git clone <repository-url>
cd bookmark-ai-agent
```

2. `extension/` ディレクトリに移動

### 3.2 n8n Webhook URLの設定

1. n8nで `bookmark-save` ワークフローを開く
2. Webhookノードをクリック
3. Webhook URLをコピー
4. `extension/popup/popup.js` の `N8N_WEBHOOK_URL` を更新

```javascript
const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/bookmark';
```

### 3.3 Chromeに拡張機能をロード

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `extension/` ディレクトリを選択

---

## 4. 動作確認

### 4.1 ブックマーク登録のテスト

1. 任意のWebページを開く
2. Chrome拡張機能のアイコンをクリック
3. ブックマーク理由を入力（10〜20文字）
4. 「ブックマークを保存」をクリック
5. Notionデータベースに登録されることを確認

### 4.2 タグ付けの確認

1. Notionで登録された記事を確認
2. Tagsプロパティに自動生成されたタグがあることを確認
3. 必要に応じて手動修正

### 4.3 レコメンド通知のテスト

1. n8nで `weekly-recommend` ワークフローを開く
2. 「Test workflow」をクリック（手動実行）
3. Slackに通知が届くことを確認

---

## 5. トラブルシューティング

### Chrome拡張機能が動作しない

**原因:** Webhook URLが正しく設定されていない
**解決:** `popup.js` のURL設定を再確認

**原因:** メタデータが取得できないページ
**解決:** 最低限タイトルとURLは保存されるはず。Notion側で確認

### n8nワークフローがエラーになる

**原因:** 認証情報が正しく設定されていない
**解決:** Credentials設定を再確認

**原因:** Notion Database IDが間違っている
**解決:** Database IDを再取得して設定

### タグが生成されない

**原因:** OpenAI APIの上限到達
**解決:** APIキーの使用状況を確認

**原因:** プロンプトが不適切
**解決:** OpenAIノードのプロンプトを調整

---

## 6. 次のステップ

セットアップが完了したら：

1. [ ] 実際に使ってみる（1週間程度）
2. [ ] タグ付けの精度を確認
3. [ ] レコメンドロジックを調整
4. [ ] 必要に応じてPhase 2の機能を実装

---

**Last Updated:** 2025-01-07
