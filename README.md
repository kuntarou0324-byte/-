# デイサービス レクリエーション プランナー

AI (Claude Opus 4.7) が、デイサービス(通所介護事業所)向けの高齢者レクリエーション案を条件に合わせて 3 つ提案する Web アプリです。

## 特徴

- 参加人数・身体機能レベル・所要時間・目的・季節・利用可能な道具・避けたい活動を指定
- 安全配慮・難易度調整・声かけ例まで含む実践的なプラン
- お気に入り保存 (ブラウザの localStorage に保存、サーバーには送信しません)
- 印刷レイアウト対応 (その日の活動計画書として配布可能)
- プロンプトキャッシュによりリピート利用時のコスト・遅延を削減

## セットアップ

```bash
# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local に ANTHROPIC_API_KEY を記入

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## デプロイ

Vercel を推奨します。

1. この GitHub リポジトリを Vercel にインポート
2. Environment Variables で `ANTHROPIC_API_KEY` を設定
3. Deploy

## 技術スタック

- Next.js 14 (App Router)
- TypeScript / React 18
- Tailwind CSS
- Anthropic TypeScript SDK (`@anthropic-ai/sdk`)
- Claude Opus 4.7 (`claude-opus-4-7`)

## セキュリティ

- API キーはサーバーサイド (Route Handler) でのみ利用し、ブラウザには露出しません。
- お気に入りはブラウザのローカルストレージに保存され、外部送信はしません。
