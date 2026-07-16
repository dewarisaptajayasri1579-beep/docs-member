# システムアーキテクチャ — 中央会員管理 & SSO ヒュブ

## 1. 概要

システムは **モジュラー モノリシズム** を採用: フロントエンドの Next.js とバックエンドの NestJS はサービスとして分離され、すべてのビジネス ドメインが 1 つの NestJS アプリケーション内にあります。これにより、初期デプロイが簡単になり、将来のサービス抽出機能が維持されます。

```text
ブラウザ
  │ HTTPS
  ├── フロントエンド (Next.js) ──────────────┐
  │                                    │ REST / OAuth2
  └────────────────────────────────────┤
                                       ▼
                            バックエンド (NestJS API)
                     auth · products · licenses · orders
                    payments · oauth · notifications · admin
                         │          │          │
                         ▼          ▼          ▼
                    PostgreSQL    Redis      Email provider
                    (Prisma)     (BullMQ)   
                         │
              Midtrans / Xendit webhook
```

## 2. コンポーネントと責任

| コンポーネント | 責任 |
|---|---|
| Next.js フロントエンド | 公開用 UI、会員、管理者; REST API を消費; 秘密ゲートウェイまたはプライベート キー JWT を保存しない。 |
| NestJS API | DTO の検証、認証、ビジネス ルール、OAuth2/SSO、支払い オーケストレーション、監査、OpenAPI。 |
| PostgreSQL | アカウント、ライセンス、注文、支払い、OAuth クライアント/トークン、監査ログのソース オブ トラース。 |
| Prisma | セーフティー タイプ、ミグレーション、データベース トランザクション。 |
| Redis | クイック ストアで BullMQ キューとレート リミット/ディストリビューテッド ロックを保存します。ビジネス ソース オブ トラースではありません。 |
| BullMQ ワーカー | バックグラウンド ジョブを実行することができる、リトライ可能でスケジュール可能なジョブ。 |
| Midtrans/Xendit | ホスト ペイメント ページと支払い確認の Webhook。 |
| Email プロバイダー | 検証用メール、パスワード リセット、ライセンス アクティベーション、請求書、リマインダー。 |
| Coolify di VPS | コンテナを実行、ドメイン ルーティング/HTTPS、環境、デプロイ、基本的なオブザーバビリティ。 |

## 3. NestJS モジュール

```text
src/
├── auth/             register, login, session, verify email, reset password
├── members/          profile dan notification preferences
├── products/         product dan plan catalog
├── licenses/         License-ID, activation, renewal, grace/suspension
├── orders/           checkout dan idempotency key
├── payments/         Midtrans, Xendit, webhook verification
├── oauth/            authorize, token, revoke, userinfo, JWKS
├── notifications/    producer BullMQ dan email delivery
├── jobs/              BullMQ processors dan scheduled jobs
├── admin/             protected administrative operations
├── audit/             append-only audit log
├── prisma/            PrismaService dan transaction helpers
├── common/            guards, decorators, filters, interceptors
└── config/            environment validation dan typed configuration
```

コントローラーは HTTP をしかるのみです。サービスはビジネス ルールを保存します。支払い セットルメントの変更は 1 つの `prisma.$transaction` で行われます: 支払い、注文、ライセンス、監査ログはすべて成功したり失敗したりします。

## 4. Redis と BullMQ

Redis はキューの暫定データを保存します。 **BullMQ は PostgreSQL の代わりではありません**; ライセンス/注文のステータスは常に PostgreSQL から読み取られ、書き込まれます。

| キュー / ジョブ | トリガー | 機能 | リトライ |
|---|---|---|---|
| `email` | アプリケーション イベント | 検証用メール、パスワード リセット、ライセンス アクティベーション、請求書を送信します。 | 指数バックオフ; エラーは記録されます。 |
| `license-reminder` | 日次 スケジューラ | ライセンスが期限切れまたはグレース ペリオド内にある場合に通知を送信します。 | 安全に再実行できるため、idempotency キーを使用します。 |
| `license-lifecycle` | スケジューラ | `active` → `grace_period` と `grace_period` → `suspended` を更新します。 | サービスは実際のステータスを DB から確認する前に更新します。 |
| `webhook-follow-up` | Webhook が完了したとき | 非批判的ジョブ: 請求書/ライセンス アクティベーション メールを送信し、アナリティクスを同期します。 | ライセンスを 2 回アクティブ化しないようにします。 |
| `cleanup` | 週次 スケジューラ | 有効期限切れのトークン/古いイベントを削除します。 | データベースが一時的に失敗した場合にリトライします。 |

支払い Webhook はセットルメントを待たずにキューに送信します:署名と金額を検証し、1 つの原子操作で支払い/注文/ライセンスを更新します。キューはトランザクションが成功した後のみジョブを受け取ります。

## 5. 批判的フロー

### 支払い済みのチェックアウト

1. NestJS は会員、プラン、idempotency キーを検証します。
2. システムは注文 `pending_payment` を作成し、ゲートウェイに支払い セッションを要求します。
3. 会員はゲートウェイのホスト ペイメント ページで支払います。
4. ゲートウェイは Webhook を NestJS に呼び出します。
5. NestJS は署名 + 金額 + idempotency キーを検証し、1 つの PostgreSQL トランザクションでセットルメントを実行します。
6. イベント メール/請求書が BullMQ に追加されます。

### SSO

1. SaaS は `/oauth/authorize` にリダイレクトします。Authorization Code + PKCE を使用します。
2. Hub は会員のセッションとライセンスを検証し、要求された製品のライセンスを検証します。
3. `/oauth/token` からアクセス トークン JWT RS256 とリフレッシュ トークンを取得します。
4. SaaS は JWT を検証し、`.well-known/jwks.json` から公開鍵を取得します。

## 6. セキュリティの制限

- フロントエンドは安全な API URL とクライアント構成のみを認識します。
- JWT 秘密鍵、データベース URL、ゲートウェイ シークレット、OAuth クライアント シークレット、Redis URL はすべてバックエンド/クールファイ秘密にあります。
- PostgreSQL と Redis はクールファイのプライベート ネットワーク内にあり、インターネットに公開されていません。
- NestJS はヘルメット、CORS allowlist、レート リミット、グローバル検証パイプ、例外フィルタを使用します。
- 監査ログはセキュリティ/請求のアクションを記録しますが、クレデンシャル、トークン、または秘密のペイロードを保存しません。