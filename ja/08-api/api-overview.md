# API Overview — Central Membership & SSO Hub

## 目的

このドキュメントは、NestJSベースのCentral Membership & SSO HubのバックエンドAPIのHTTP API契約です。APIには、会員アカウント、カタログ、ライセンス、チェックアウト、支払い、管理者、OAuth2/SSOが含まれます。

## Base URLとバージョニング

| 環境 | Base URL |
|---|---|
| ローカル | `http://localhost:3001` |
| ステージング | `https://api-staging.hub.domain.com` |
| プロダクション | `https://api.hub.domain.com` |

RESTエンドポイントはprefix `/api/v1`で、例えば`GET /api/v1/products`です。OAuth2とウェブフックのエンドポイントはprefixが付いていないため、標準/プロバイダーの規格に従っています: `/oauth/token`と `/webhooks/midtrans`。

## NestJSのコンベンション

| エリア | 実装スタンダード |
|---|---|
| Controller | 1つのコントローラーあたり1つのリソース; HTTPのみを処理する。 |
| Service | ビジネスロジック、トランザクション境界、外部統合を保存する。 |
| DTO | `class-validator`と`class-transformer`を使用する; グローバルな`ValidationPipe`は`whitelist`、`forbidNonWhitelisted`、`transform`を使用する。 |
| データベース | Prisma Service; 支払い決済は`prisma.$transaction`を使用する。 |
| 認証 | `JwtAuthGuard`は会員用、`RolesGuard`は管理者用、OAuth2/ウェブフック用の専用ガードを使用する。 |
| ドキュメント | Swagger/OpenAPIは `/api/docs`で提供する; DTOとレスポンスはSwaggerのデコレータを使用する。 |
| キュー | BullMQはメール、リマインダー有効期限、非批判的なジョブを処理する。 |

## 認証と承認

会員/管理者エンドポイントは`Authorization: Bearer <access_token>`を受け付ける。ガードはRS256の署名、`exp`、アカウントのステータスを検証する。管理者エンドポイントは`super_admin`ロールを要求する。

OAuth2はAuthorization Code Flowを使用し、PKCEを使用する。ウェブフックのMidtrans/XenditはBearerトークンを使用しない: 署名/コールバックトークン、金額、イデンポテンシティはオーダーまたはライセンスの変更前に検証する必要がある。

## レスポンスフォーマット

### 成功

```json
{
  "data": { "id": "0d1c1b9e-4d61-4d60-8e34-1f7cc4f1a5f9" },
  "meta": { "requestId": "req_01J..." }
}
```

コレクションは`meta.page`、`meta.limit`、`meta.total`、`meta.totalPages`を使用する。

### 失敗

```json
{
  "statusCode": 409,
  "code": "LICENSE_ALREADY_EXISTS",
  "message": "あなたはすでにこの製品に対して有効なライセンスを持っています。",
  "details": [],
  "requestId": "req_01J..."
}
```

グローバルなNestJSの例外フィルタを使用する。安全なメッセージはユーザーに表示される; スタックトレース、パスワード、トークン、シークレットは戻り値に含めない。

## HTTPステータスとアプリケーションコード

| ステータス | 使用 |
|---:|---|
| `200` / `201` / `204` | リクエストが成功し、リソースが作成されたり、ボディが無い場合は成功した。 |
| `202` | 非同期ジョブが受け入れられた。 |
| `400` | DTO/リクエストが無効。 |
| `401` | トークン/クレデンシャルが無効または期限切れ。 |
| `403` | ロール、ライセンス、スコープがアクセスを許可しない。 |
| `404` | リソースが見つからない/無効。 |
| `409` | メール、オーダー、ライセンスの競合。 |
| `422` | リクエストが形式上有効だが、プロセス上のルールを破った。 |
| `429` | リートリミットが超過。 |
| `503` | 依存関係が利用できない。 |

主なアプリケーションコード: `EMAIL_ALREADY_REGISTERED`、`EMAIL_NOT_VERIFIED`、`INVALID_CREDENTIALS`、`LICENSE_ALREADY_EXISTS`、`NO_LICENSE`、`LICENSE_SUSPENDED`、`ORDER_EXPIRED`、`DUPLICATE_ORDER`、`INVALID_WEBHOOK_SIGNATURE`、`PAYMENT_AMOUNT_MISMATCH`。

## ページネーションとイデンポテンシティ

- コレクションは`page` (デフォルト `1`) と `limit` (デフォルト `20`、最大 `100`) を受け付ける。
- オーダー作成のエンドポイントは `Idempotency-Key` ヘッダー UUID を要求する。同じキーが同じボディを送信すると、元の結果が返される; 異なるボディが送信されると `409` が返される。
- ウェブフックはイベントゲートウェイのIDと `order_number` でイデンポテンシーされる。

## 運用上のセキュリティ

1. HTTPS、CORS allowlist、Helmet、NestJSのレートリミットを適用する。
2. ログイン、登録、パスワードリセット、メール再送のためのより厳しいリミットを適用する。
3. 認証、ライセンス変更、支払い、管理者アクションのためのアドビットログを作成する。
4. ウェブフックのエンドポイントは署名検証に必要な場合、rawボディを使用する。
5. ゲートウェイAPIキー、OAuthシークレット、JWTプライベートキーはサーバー/シークレットマネージャーにのみ存在する。