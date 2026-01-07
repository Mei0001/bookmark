# 開発ノート

このファイルには開発過程での気づき、議論、技術的な決定事項などを記録します。

---

## 2025-01-07

### 要件定義フェーズ

**議論内容:**
- ブックマーク管理AIエージェントの企画・要件定義
- 特定サイトに限定せず、URL汎用方式を採用
- メタデータのみをLLMに渡すアプローチで合意

**技術選定の経緯:**

**Chrome拡張機能の採用理由:**
- ブラウジング中の自然な導線でブックマーク登録が可能
- メタデータをページから直接抽出できる
- ログインが必要なサイトでも、ユーザーがアクセス済みなら取得可能

**n8nの採用理由:**
- 個人利用でバックエンドロジックをノーコード/ローコードで構築可能
- Webhook、OpenAI API、Notion APIなど複数サービスの連携が容易
- セルフホストまたはクラウド版の選択肢がある

**Notionの採用理由:**
- データ管理のUIが既に存在
- 手動修正・閲覧が容易
- 無料プランで十分な容量

**スクレイピングの回避:**
- メタデータ（OGP、Twitter Card等）のみを使用
- 記事本文の取得は行わない
- 法的・規約的なリスクを最小化

**重要な決定事項:**
1. リアルタイム更新は見送り → 定期更新に変更
2. サイト別実装は不要 → URL汎用方式を採用
3. MVP は2〜3週間で実装可能な範囲に絞る

---

## 今後のタスク

### Phase 1 (MVP)
- [ ] Chrome拡張機能の実装
  - [ ] manifest.json作成
  - [ ] popup UI実装
  - [ ] content script実装（メタデータ抽出）
  - [ ] background script実装（Webhook送信）
- [ ] n8nワークフロー構築
  - [ ] Webhook受信ノード
  - [ ] OpenAI APIノード（タグ付け）
  - [ ] Notionノード（保存）
  - [ ] スケジュールノード（週次実行）
  - [ ] Slackノード（通知）
- [ ] Notion Database作成
  - [ ] スキーマ設計
  - [ ] テンプレート作成
- [ ] 動作テスト

### Phase 2
- [ ] レコメンドロジック改善
- [ ] エラーハンドリング強化
- [ ] Notion UIカスタマイズ

---

## 技術メモ

### メタデータ抽出の優先順位
1. Open Graph Protocol (og:title, og:description, og:image等)
2. Twitter Card (twitter:title, twitter:description等)
3. 標準HTMLメタタグ (meta name="description")
4. ページタイトル (<title>タグ)

### Chrome拡張機能の注意点
- Manifest V3への対応必須
- Content Scriptはページのコンテキストで実行される
- Background ScriptはService Workerとして動作

### n8nの注意点
- Webhookノードは常時起動が必要（セルフホストの場合）
- OpenAI APIノードではトークン消費量に注意
- エラーハンドリングはワークフロー内で設定

---

## 参考リンク

- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [n8n Documentation](https://docs.n8n.io/)
- [Notion API Reference](https://developers.notion.com/reference)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Open Graph Protocol](https://ogp.me/)

---

## 問題・課題

現時点ではなし。

---

**最終更新:** 2025-01-07
