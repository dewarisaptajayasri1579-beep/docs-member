# データ辞書

## ドメイン / enum

| ドメイン | 値 | 意味 |
|---|---|---|
| `member_status` | `unverified`, `active`, `suspended`, `deleted` | アカウントライフサイクル; `deleted` はソフトデリート。 |
| `member_role` | `member`, `super_admin` | アプリケーションレベルの権限。 |
| `plan_type` | `free`, `trial`, `paid` | コマースパッケージのモデル。 |
| `license_status` | `active`, `active_free`, `grace_period`, `suspended`, `cancelled` | ライセンスのステータスとJWTのクレーム。 |
| `order_status` | `pending_payment`, `paid`, `failed`, `expired`, `cancelled`, `duplicate` | チェックアウトのステータス。 |
| `payment_status` | `pending`, `settlement`, `failed`, `expired`, `cancelled`, `refunded` | カノニカルな支払いステータス。 |
| `payment_gateway` | `midtrans`, `xendit` | 初期バージョンのゲートウェイ。 |

## データの定義 (テーブル間の共通定義)

| 要素 | 型/フォーマット | 定義とルール |
|---|---|---|
| `id` | UUID v4 | 内部識別子。 |
| `created_at`, `updated_at` | UTC `timestamptz` | `updated_at` はエンティティが更新されたときに変更される。 |
| `email` | 最大320文字 | ストアする前に小文字化され、グローバルに一意である。 |
| `*_hash` | シングル方向ハッシュ | オリジナルの値は保存されない。 |
| `amount` / `price_amount` | `bigint` | `currency` に基づく小数点未使用の単位。 |
| `currency` | ISO 4217、3文字 | 現在のデフォルトは `IDR`。 |
| `metadata`, `payload`, `features` | `jsonb` | アプリケーションによって検証されるフレキシブルなデータ; 秘密情報は含まない。 |
| `expires_at` | UTC `timestamptz` | トークン、オーダー、またはアクセスの有効期限; 有効期限なしの概念では null である。 |

## エンティティの定義

| エンティティ | ビジネス識別子 | 重要なデータ | 保持/注記 |
|---|---|---|---|
| Member | `members.email` | 名前、パスワードハッシュ、ステータス、ロール。 | ソフトデリートにより、トランザクション/オーディットの痕跡が残る。 |
| Product | `products.code` | 名前、SSOのリダイレクト、有効期限、グレースペリオド。 | 非アクティブ化、削除しない; ライセンスがある場合。 |
| Plan | `product_id + code` | 値、期間、間隔、タイプ、機能。 | 値は変更可能; オーダーはスナップショットを保存する。 |
| License | `licenses.license_key` | 所有者、製品、階層、ステータス、有効期限。 | IDは再生時に変更されない; `cancelled` の後、再度作成される。 |
| Order | `orders.order_number` | メンバー、プラン、金額、ゲートウェイ、有効期限。 | 値は商用オーダーが作成された後、変更されない。 |
| Payment | `gateway + gateway_transaction_id` | オーダー、ゲートウェイのステータス、金額、支払い時刻。 | 感感性データを除いたレスポンスがデータから抽出される。 |
| Webhook イベント | `gateway + external_event_id` | ペイロード、署名の検証、処理時刻。 | 再生性とトラブルシューティングのための証拠。 |
| OAuth クライアント | `oauth_clients.client_id` | リダイレクト URI、スコープ、シークレットハッシュ。 | シークレットはクライアントの登録時に一度だけ表示される。 |
| 認証コード | `code_hash` | メンバー、クライアント、製品/ライセンス、PKCE、有効期限。 | 一度使用され、非常に短い有効期限。 |
| リフレッシュトークン | `token_hash` | クライアント、メンバー、ライセンス、スコープ、削除/ローテーション。 | ログアウト、インシデント、またはライセンスが停止されたときに削除される。 |
| JWT 署名キー | `kid` | 公開 JWK、RS256、ライフサイクルキー。 | 私有キーはシークレットマネージャーに参照されるのみ。 |
| オーディットログ | `id` | アクター、操作、オブジェクト、結果、IP、安全なメタデータ。 | 追加のみ; アプリケーションが通常編集しない。 |

## データの品質とセキュリティのルール

1. フォレインキーは `RESTRICT` を使用して財務/オーディットデータに適用し、`CASCADE` はトークンが無意味な場合にのみ使用する。
2. 署名が無効なウェブフックは `orders`、`payments`、または `licenses` を変更しない; イベントは記録される。
3. セットルメントは `payments`、`orders`、`licenses`、および `audit_logs` を 1 つのデータベーストランザクションで変更する。
4. ウェブフックのペイロード、オーディットログ、OAuth データへのアクセスは、スーパーアドミンまたは権威あるサービスバックエンドに制限される。
5. チェックアウト/ウェブフックの重複を管理するには、ユニーク制約と idempotency キーが使用される; フロントエンドは単一の制御ではない。