# 技術スタック — 中央会員管理 & SSO ヒュブ

## 1. 承認されたスタック

| 層 | 技術 | 機能 |
|---|---|---|
| フロントエンド | Next.js 16+ (App Router), TypeScript | メンバー/管理者用Webサイトとパブリックページ。 |
| UI | Tailwind CSS, Base UI, Lucide | アクセシブルなデザインシステム。 |
| バックエンド | NestJS 11+ (TypeScript) | REST API, OAuth2, webhook, およびビジネスルール。 |
| API contract | REST `/api/v1`, Swagger/OpenAPI | フロントエンドとバックエンドの間の契約とドキュメント。 |
| データベース | PostgreSQL 15+ | ACIDをサポートするソースオブトゥルース。 |
| ORM | Prisma | スキーマ、ミグレーション、およびタイプセーフなクエリ。 |
| キャッシュ/キュー | Redis 7+ + BullMQ | キュー、リトライ、スケジュール、およびレート制限のサポート。 |
| 認証 | Passport, JWT RS256, OAuth2 Authorization Code + PKCE | SaaS間のログインとSSO。 |
| 支払い | Midtrans Snap, Xendit Invoice | インドネシア向けの支払いとwebhookのセットルメント。 |
| メール | SMTP プロバイダー / Resend | BullMQを使用したトランザクションメール。 |
| デプロイ | Docker + Coolify on VPS | サービス、ドメイン、TLS、環境、およびロールバックのデプロイ。 |
| テスト | Jest, Supertest, Playwright | 単体、統合/API、およびエンドツーエンドのテスト。 |

## 2. バックエンドの主な依存関係

| 必要なもの | 推奨のNestJS/Nodeパッケージ |
|---|---|
| HTTP、config、validation | `@nestjs/common`, `@nestjs/config`, `class-validator`, `class-transformer` |
| Prisma | `prisma`, `@prisma/client` |
| Auth | `@nestjs/passport`, `passport`, `passport-jwt`, `jose` |
| キュー | `@nestjs/bullmq`, `bullmq`, `ioredis` |
| スケジュール | `@nestjs/schedule` |
| API ドキュメント | `@nestjs/swagger` |
| セキュリティ | `helmet`, `@nestjs/throttler` |
| テスト | `jest`, `supertest` |

バックエンドのバージョンは`package.json`に固定されています。バックエンドを作成するときは、LTS Node.jsを使用してください。

## 3. 技術的な決定

| 決定 | 選択 | 理由 |
|---|---|---|
| 初期アーキテクチャ | モジュラー モノリシック NestJS | 簡単な運用、モジュールは明確で後で抽出できる。 |
| データベース | PostgreSQL + Prisma | ビリングトランザクションとデータの関係を強くサポートする。 |
| キュー | Redis + BullMQ | リトライ、遅延ジョブ、およびスケジュールをサポートする。 |
| トークン | JWT RS256 | SaaSはHubの公開鍵を使用してトークンを検証できる。 |
| OAuth フロー | Authorization Code + PKCE | ウェブアプリケーション向けに安全。 |
| デプロイ | Coolify on VPS | フロントエンド、API、ワーカー、Postgres、およびRedisのための1つのプラットフォーム。 |
| 支払い | Midtrans + Xendit | インドネシア向けの支払い方法に適合。 |

## 4. リポジトリの構造

```text
membership/
├── project/frontend/     # Next.js (repo自体)
├── backend/              # NestJS + Prisma (repo自体)
└── docs/                 # システム仕様
```

バックエンドには`api`プロセスと`worker`プロセスが含まれます。APIはHTTPトラフィックを受け取り、ワーカーはBullMQとスケジュールされたジョブを処理します。

## 5. 基本的な環境設定

```dotenv
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
APP_URL=https://api.hub.domain.com
FRONTEND_URL=https://hub.domain.com
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
XENDIT_SECRET_KEY=...
XENDIT_CALLBACK_TOKEN=...
EMAIL_FROM=no-reply@hub.domain.com
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

Gitや`NEXT_PUBLIC_*`にシークレットは入らないようにしてください。Coolifyはステージングとプロダクション用に環境を分離しています。