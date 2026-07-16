# データベース テーブル

## 一般的な規則

- 主キーは `uuid` を使用し、デフォルトは `gen_random_uuid()` です。
- 時刻は `timestamptz` を使用し、UTC で保存します。
- 金額は `bigint` を使用し、単位はミニ (50,000 Rupiah = `50000` ) です。浮動小数点数を使用しないようにします。
- パスワード、トークン、クライアント シークレットはハッシュのみで保存します。
- 主要なビジネス エンティティには `created_at` と `updated_at` があります。

## 主要テーブル

| テーブル | 機能 | 主キーと主な制約 |
| --- | --- | --- |
| `members` | メンバーと管理者のアカウント | `email` が一意; ロールが `member` / `super_admin` です。 |
| `products` | SaaS アプリケーションのカタログ | `code` が一意; 例: `NTO` |
| `plans` | 各製品のパッケージ | `(product_id, code)` が一意; 価格は負でない必要があります。 |
| `licenses` | メンバーが製品にアクセスするライセンス | `license_key` が一意; 1 つのライセンスは 1 つのメンバーと製品に対して有効です。 |
| `orders` | チェックアウト/再契約のセッション | `order_number` が一意; チェックアウトの値を保存します。 |
| `payments` | 支払いの試行と結果 | ゲートウェイのトランザクション ID が一意です。 |
| `webhook_events` | ゲートウェイのコールバック (Audit/Retry) | ペイロードは `jsonb` です; イベントは idempotent です。 |

### `members`

| 列 | 型 | Null | 説明 |
| --- | --- | --- | --- |
| `id` | uuid | なし | 主キー。 |
| `email` | varchar(320) | なし | 大文字小文字を区別しない一意の値。 |
| `full_name` | varchar(120) | なし | メンバーの表示名。 |
| `password_hash` | varchar(255) | 有効 | Argon2/bcrypt のハッシュ値。 |
| `status` | member_status | なし | `unverified`、`active`、`suspended`、`deleted` のいずれか。 |
| `role` | member_role | なし | `member` (デフォルト) または `super_admin` のいずれか。 |
| `avatar_url` | text | 有効 | アバター URL (存在する場合)。 |
| `last_login_at` | timestamptz | 有効 | 最後のログイン成功時刻。 |
| `created_at`、`updated_at` | timestamptz | なし | ライフサイクル メタデータ。 |

インデックス: `lower(email)` の一意インデックスと `status` のインデックス。

### `products` と `plans`

| テーブル | 主要な列 | 説明 |
| --- | --- | --- |
| `products` | `id`、`code`、`name`、`description`、`website_url`、`sso_redirect_uri`、`is_active`、`grace_period_days` | `code` は 2-4 文字の大文字です; グレース パリオドはデフォルトで 7 日です。 |
| `plans` | `id`、`product_id`、`code`、`name`、`type`、`billing_interval`、`price_amount`、`currency`、`duration_days`、`features`、`is_active` | `features` は `jsonb` です; 無料のパッケージは 0 の値と無期限です。 |

`billing_interval`: `none`、`monthly`、または `yearly` のいずれかです。非アクティブな製品は再アクティブ化できず、非アクティブなパッケージは新規購入できません。

### `licenses`

| 列 | 型 | Null | 説明 |
| --- | --- | --- | --- |
| `id` | uuid | なし | 主キー。 |
| `member_id`、`product_id`、`plan_id` | uuid | なし | 所有者、製品、パッケージの外部キー。 |
| `license_key` | varchar(32) | なし | 例: `NTO-A1B2-C3D4-E5F6`; グローバルで一意です。 |
| `tier` | varchar(50) | なし | パッケージのコード/階層のスナップショット。 |
| `status` | license_status | なし | `active`、`active_free`、`grace_period`、`suspended`、`cancelled` のいずれか。 |
| `started_at`、`expired_at` | timestamptz | 有効 | `expired_at` は無期限の場合に null です。 |
| `grace_period_ends_at` | timestamptz | 有効 | 有料のライセンスのみがグレース パリオド内です。 |
| `cancelled_at` | timestamptz | 有効 | 永久的なキャンセル時刻。 |
| `created_at`、`updated_at` | timestamptz | なし | ライフサイクル メタデータ。 |

インデックス: `license_key` の一意インデックス; `(member_id, product_id)` のインデックス; `(member_id, product_id)` の部分一意インデックス `WHERE status <> 'cancelled'`。

### `orders`、`payments`、`webhook_events`

| テーブル | 主要な列 | 説明 |
| --- | --- | --- |
| `orders` | `id`、`order_number`、`member_id`、`product_id`、`plan_id`、`license_id`、`status`、`amount`、`currency`、`gateway`、`expires_at`、`paid_at` | ステータス: `pending_payment`、`paid`、`failed`、`expired`、`cancelled`、`duplicate` のいずれか; `license_id` は最初のオーダーに null です。 |
| `payments` | `id`、`order_id`、`gateway`、`gateway_transaction_id`、`gateway_reference`、`status`、`amount`、`currency`、`paid_at`、`raw_response` | ステータス: `pending`、`settlement`、`failed`、`expired`、`cancelled`、`refunded` のいずれか。 |
| `webhook_events` | `id`、`payment_id`、`gateway`、`external_event_id`、`event_type`、`signature_valid`、`processed_at`、`payload`、`received_at` | ペイロードは `jsonb` です; 無効なイベントは記録されますが、ライセンスの有効化には影響しません。 |

`payments` と `webhook_events` の `(gateway, gateway_transaction_id)` と `(gateway, external_event_id)` の一意インデックスは、ゲートウェイがイベント ID を提供する場合にのみ作成されます。ウェブホック ワーカーは、1 つのデータベース トランザクションで `payment`、`order`、`license`、`audit` を更新します。

## ID テーブルと OAuth2

| テーブル | 主要な列 | 説明 |
| --- | --- | --- |
| `email_verification_tokens` | `id`、`member_id`、`token_hash`、`expires_at`、`used_at`、`created_at` | 新しいトークンは古いトークンを無効にします; 有効で未使用のトークンのみが受け入れられます。 |
| `password_reset_tokens` | `id`、`member_id`、`token_hash`、`expires_at`、`used_at`、`created_at` | ライフサイクルはトークン検証と同じです。 |
| `oauth_clients` | `id`、`client_id`、`client_secret_hash`、`name`、`redirect_uris`、`allowed_scopes`、`is_active` | URI とスコープは `jsonb` です; `client_id` は一意です。 |
| `authorization_codes` | `id`、`code_hash`、`member_id`、`oauth_client_id`、`product_id`、`license_id`、`redirect_uri`、`scope`、`code_challenge`、`code_challenge_method`、`expires