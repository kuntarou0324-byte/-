# デイサービス レクリエーション プランナー

AI (Google Gemini 2.5 Flash) が、デイサービス(通所介護事業所)向けの高齢者レクリエーション案を条件に合わせて提案する Web アプリです。

## 特徴

- 参加人数・身体機能レベル・所要時間・目的・季節・利用可能な道具・避けたい活動を指定
- 安全配慮・難易度調整・声かけ例まで含む実践的なプラン
- 今日のおすすめ / 週間プラン(7日×5案=35案)の一括生成
- お気に入り・プリセット・実施記録を **施設内で共有** (SQLite に保存)
- 施設共通パスワードによるログイン認証
- 印刷レイアウト対応 (その日の活動計画書として配布可能)
- 個人情報は扱わない設計 (参加者氏名・個人特定情報を保存しない)

## セットアップ

```bash
# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local に GEMINI_API_KEY, FACILITY_PASSWORD, SESSION_SECRET を記入

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 環境変数

| 変数 | 説明 |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API キー (必須) |
| `FACILITY_PASSWORD` | 施設共通ログインパスワード。未設定 (空) なら認証は無効化されます |
| `SESSION_SECRET` | セッション Cookie の署名用シークレット (16文字以上、本番では必須) |
| `DATABASE_PATH` | SQLite データベースファイルのパス (未指定なら `./data/app.db`) |

## API キーの取得

1. https://aistudio.google.com にアクセスし、Google アカウントでログイン
2. 左上のメニューから **Get API key** → **Create API key**
3. 発行された文字列を `.env.local` の `GEMINI_API_KEY=` の右側に貼り付け

## データ保存について

- お気に入り / プリセット / 実施記録は **サーバー側の SQLite** に保存され、同じ `FACILITY_PASSWORD` でログインした全端末で共有されます。
- 生成履歴と入力フォームの下書きは、各端末の **ブラウザ (localStorage)** に保存されます。
- 既存のブラウザデータ (v1 以前) がある端末では、初回アクセス時に「サーバーへ移行する」バナーが表示されます。

## デプロイ

シングルサーバー (Railway, Fly.io, VPS, 社内サーバーなど) を推奨します。SQLite ファイルが永続化できる環境であれば動作します。

Vercel のようなサーバーレス環境では SQLite ファイルが揮発するため、Postgres (Vercel Postgres / Neon / Supabase など) に差し替える必要があります。`app/lib/repositories.ts` のインターフェースを維持したまま実装を差し替えてください。

## 技術スタック

- Next.js 14 (App Router)
- TypeScript / React 18
- Tailwind CSS
- Google Gen AI SDK (`@google/genai`)
- Gemini 2.5 Flash (`gemini-2.5-flash`)
- better-sqlite3

## セキュリティ

- API キーはサーバーサイド (Route Handler) でのみ利用し、ブラウザには露出しません。
- 認証は HMAC-SHA256 署名付き Cookie を使用します (`SESSION_SECRET` 必須)。
- 個人情報を扱わないため、利用者氏名・個人特定情報を入力しないでください。
