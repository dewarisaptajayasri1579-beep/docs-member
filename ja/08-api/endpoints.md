# メンバーシップ & SSO ハブ API エンドポイント リファレンス

Prefix REST: `/api/v1`。ボディは `application/json` を使用します。ただし、`/oauth/token` の場合は `application/x-www-form-urlencoded` を使用します。

## ヘルスとパブリック カタログ

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| `GET` | `/health` | パブリック | アプリケーションと主な依存関係のヘルス チェック。 |
| `GET` | `/api/v1/products` | パブリック | 有効な製品の一覧; `search`、`page`、`limit` クエリ パラメーターを使用します。 |
| `GET` | `/api/v1/products/:productCode` | パブリック | 製品と有効なパッケージの詳細。 |
| `GET` | `/api/v1/products/:productCode/plans` | パブリック | 製品に利用可能なパッケージの一覧。 |

```json
{ "data": { "code": "NTO", "name": "NOTO", "plans": [{ "code": "free", "type": "free", "priceAmount": 0, "currency": "IDR" }] } }
```

## 認証とアカウント

| メソッド | パス | 認証 | 要求 / 結果 |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | パブリック | `{ fullName, email, password, passwordConfirmation }`; 未確認のアカウントを作成し、201 を返します。 |
| `POST` | `/api/v1/auth/login` | パブリック | `{ email, password }`; アクセス トークン、リフレッシュ トークン、プロフィールを取得し、200 を返します。 |
| `POST` | `/api/v1/auth/logout` | メンバー | リフレッシュ トークン / セッションを削除し、204 を返します。 |
| `POST` | `/api/v1/auth/refresh` | パブリック | `{ refreshToken }`; リフレッシュ トークンをローテートします。 |
| `POST` | `/api/v1/auth/verify-email` | パブリック | `{ token }`; アカウントを有効化します。 |
| `POST` | `/api/v1/auth/resend-verification` | パブリック | `{ email }`; 通知を再送します。 |
| `POST` | `/api/v1/auth/forgot-password` | パブリック | `{ email }`; パスワード リセットの通知を送信します。 |
| `POST` | `/api/v1/auth/reset-password` | パブリック | `{ token, password, passwordConfirmation }`, 204 を返します。 |
| `GET` | `/api/v1/me` | メンバー | メンバーのプロフィールとステータス サマリーを取得します。 |
| `PATCH` | `/api/v1/me` | メンバー | `{ fullName, avatarUrl? }` を更新します。 |
| `PATCH` | `/api/v1/me/password` | メンバー | `{ currentPassword, newPassword, passwordConfirmation }`, 204 を返します。 |
| `PATCH` | `/api/v1/me/notification-preferences` | メンバー | 通知のプreference を更新します。 |

ログイン / 登録 / パスワード リセットにはレート リミッターが必要です。忘れたパスワードとメールの再送信には、メールが登録されているかどうかを明らかにしないでください。

## メンバー ダッシュボードとライセンス

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| `GET` | `/api/v1/dashboard` | メンバー | サブスクリプション、警告、最新の支払いに関するサマリーを取得します。 |
| `GET` | `/api/v1/licenses` | メンバー | 自分のライセンスの一覧; `status`、`productCode`、`page`、`limit` フィルタを使用します。 |
| `GET` | `/api/v1/licenses/:licenseId` | メンバー | 自分のライセンスの詳細を取得します。 |
| `POST` | `/api/v1/licenses/activate-free` | メンバー | `{ productCode, planCode }`; `active_free` を作成し、201 を返します。 |
| `POST` | `/api/v1/licenses/:licenseId/renew` | メンバー | `{ planCode, gateway }`; 有料の再契約を生成し、201 を返します。 |
| `GET` | `/api/v1/licenses/:licenseId/sso-link` | メンバー | ライセンスの製品に紐づく SSO 認証 URL を取得します。 |

フリート ライセンスのアクティベーションは、未確認のアカウント、非アクティブな製品 / パッケージ、既存の有効なライセンスを拒否します。ライセンス ID は最初のアクティベーション時に作成され、再契約時に変更されません。

## チェックアウトと支払い

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| `POST` | `/api/v1/orders` | メンバー | 有料のチェックアウトを作成します; `Idempotency-Key` ヘッダーが必要です。 |
| `GET` | `/api/v1/orders` | メンバー | 自分のオーダーの一覧; `status`、`page`、`limit` フィルタを使用します。 |
| `GET` | `/api/v1/orders/:orderId` | メンバー | オーダーと支払い指示の詳細を取得します。 |
| `GET` | `/api/v1/payments` | メンバー | 支払いの一覧; `status`、`page`、`limit` フィルタを使用します。 |
| `GET` | `/api/v1/payments/:paymentId/invoice` | メンバー | メタデータ / ダウンロード可能な支払い請求書の詳細を取得します。 |

オーダー ボディ:

```json
{ "productCode": "NTO", "planCode": "pro-monthly", "gateway": "midtrans" }
```

201 の応答には `id`、`orderNumber`、`status: "pending_payment"`、`amount`、`currency`、`paymentUrl`、`expiresAt` が含まれます。

## Webhook 支払いゲートウェイ

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| `POST` | `/webhooks/midtrans` | Midtrans の署名 | 通知 / スナップ コールバックを処理します。 |
| `POST` | `/webhooks/xendit` | Xendit のコールバック トークン | インボイス コールバックを処理します。 |

Webhook は署名 / トークンを検証し、イベントを保存し、idempotency を確認し、1 つのトランザクションで支払い、オーダー、ライセンス、オーディト ログを更新する必要があります。無効なイベントは 400 を返し、すでに成功したイベントを再送信すると 200 を返します。フロントエンドはこのエンドポイントを呼び出すことはできません。

## 管理 API

すべてのエンドポイントは、`super_admin` ロールを持つ Bearer トークンが必要です。

| メソッド | パス | 説明 |
|---|---|
| `GET` | `/api/v1/admin/dashboard` | メンバー、ライセンス、オーダー、支払いに関するメトリックを取得します。 |
| `GET` | `/api/v1/admin/members` | メンバーの一覧; `search`、`status`、`page`、`limit` フィルタを使用します。 |
| `GET` | `/api/v1/admin/members/:memberId` | メンバー、ライセンス、オーダーの詳細を取得します。 |
| `PATCH` | `/api/v1/admin/members/:memberId/status` | `{ status: "active" | "suspended" }`; オーディト ログが必要です。 |
| `GET` | `/api/v1/admin/products` | 有効な製品 / パッケージの一覧; 非アクティブな製品も含まれます。 |
| `POST` | `/api/v1/admin/products` | 新しい製品を作成します。 |
| `PATCH` | `/api/v1/admin/products/:productId` | 製品のメタデータ / ステータスを更新します。 |
| `POST` | `/api/v1/admin/products/:productId/plans` |