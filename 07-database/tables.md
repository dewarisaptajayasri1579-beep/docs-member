# Database Tables

## Konvensi umum

- Primary key menggunakan `uuid` dengan default `gen_random_uuid()`.
- Waktu menggunakan `timestamptz` dan disimpan dalam UTC.
- Nominal memakai `bigint` dalam unit minor (Rp50.000 = `50000`), bukan floating point.
- Password, token, dan client secret hanya disimpan sebagai hash.
- Entitas bisnis utama mempunyai `created_at` dan `updated_at`.

## Tabel inti

| Tabel | Fungsi | Kunci dan constraint utama |
|---|---|---|
| `members` | Akun member dan admin. | `email` unik; role `member`/`super_admin`. |
| `products` | Katalog aplikasi SaaS. | `code` unik, contoh `NTO`. |
| `plans` | Paket per produk. | Unik `(product_id, code)`; harga tidak negatif. |
| `licenses` | Hak akses member ke produk. | `license_key` unik; satu lisensi berlaku per member-produk. |
| `orders` | Sesi checkout/renewal. | `order_number` unik; menyimpan snapshot nilai checkout. |
| `payments` | Upaya dan hasil pembayaran. | ID transaksi gateway unik per gateway. |
| `webhook_events` | Callback gateway untuk audit/retry. | Payload `jsonb`; event dapat diidentifikasi idempoten. |

### `members`

| Kolom | Tipe | Null | Keterangan |
|---|---|---:|---|
| `id` | uuid | tidak | Primary key. |
| `email` | varchar(320) | tidak | Ditim, lowercase, dan unik. |
| `full_name` | varchar(120) | tidak | Nama tampilan member. |
| `password_hash` | varchar(255) | ya | Hash Argon2/bcrypt. |
| `status` | member_status | tidak | `unverified`, `active`, `suspended`, `deleted`. |
| `role` | member_role | tidak | `member` (default) atau `super_admin`. |
| `avatar_url` | text | ya | URL avatar bila tersedia. |
| `last_login_at` | timestamptz | ya | Login berhasil terakhir. |
| `created_at`, `updated_at` | timestamptz | tidak | Metadata lifecycle. |

Index: unique `lower(email)` dan index `status`.

### `products` dan `plans`

| Tabel | Kolom utama | Keterangan |
|---|---|---|
| `products` | `id`, `code`, `name`, `description`, `website_url`, `sso_redirect_uri`, `is_active`, `grace_period_days` | `code` 2–4 huruf kapital; grace period default 7 hari. |
| `plans` | `id`, `product_id`, `code`, `name`, `type`, `billing_interval`, `price_amount`, `currency`, `duration_days`, `features`, `is_active` | `features` `jsonb`; paket free bernilai 0 dan dapat tanpa expiry. |

`billing_interval`: `none`, `monthly`, atau `yearly`. Produk nonaktif tidak dapat
diaktivasi dan paket nonaktif tidak dapat dibeli baru.

### `licenses`

| Kolom | Tipe | Null | Keterangan |
|---|---|---:|---|
| `id` | uuid | tidak | Primary key. |
| `member_id`, `product_id`, `plan_id` | uuid | tidak | Foreign key pemilik, produk, dan paket. |
| `license_key` | varchar(32) | tidak | Contoh `NTO-A1B2-C3D4-E5F6`; unik global. |
| `tier` | varchar(50) | tidak | Snapshot kode/tier paket. |
| `status` | license_status | tidak | `active`, `active_free`, `grace_period`, `suspended`, `cancelled`. |
| `started_at`, `expired_at` | timestamptz | ya | `expired_at` null untuk Free Forever. |
| `grace_period_ends_at` | timestamptz | ya | Hanya lisensi berbayar di grace period. |
| `cancelled_at` | timestamptz | ya | Waktu pembatalan permanen. |
| `created_at`, `updated_at` | timestamptz | tidak | Metadata lifecycle. |

Index: unique `license_key`; index `(member_id, product_id)`; partial unique index
`(member_id, product_id) WHERE status <> 'cancelled'`.

### `orders`, `payments`, dan `webhook_events`

| Tabel | Kolom utama | Keterangan |
|---|---|---|
| `orders` | `id`, `order_number`, `member_id`, `product_id`, `plan_id`, `license_id`, `status`, `amount`, `currency`, `gateway`, `expires_at`, `paid_at` | Status: `pending_payment`, `paid`, `failed`, `expired`, `cancelled`, `duplicate`; `license_id` null untuk order pertama. |
| `payments` | `id`, `order_id`, `gateway`, `gateway_transaction_id`, `gateway_reference`, `status`, `amount`, `currency`, `paid_at`, `raw_response` | Status canonical: `pending`, `settlement`, `failed`, `expired`, `cancelled`, `refunded`. |
| `webhook_events` | `id`, `payment_id`, `gateway`, `external_event_id`, `event_type`, `signature_valid`, `processed_at`, `payload`, `received_at` | Payload bertipe `jsonb`; event invalid tetap tercatat tanpa aktivasi lisensi. |

Unique `(gateway, gateway_transaction_id)` pada `payments` dan `(gateway,
external_event_id)` pada `webhook_events` bila gateway menyediakan event ID. Worker
webhook memperbarui payment, order, license, dan audit dalam satu transaksi database.

## Tabel identitas dan OAuth2

| Tabel | Kolom utama | Keterangan |
|---|---|---|
| `email_verification_tokens` | `id`, `member_id`, `token_hash`, `expires_at`, `used_at`, `created_at` | Token baru membatalkan token lama; hanya yang valid dan belum dipakai diterima. |
| `password_reset_tokens` | `id`, `member_id`, `token_hash`, `expires_at`, `used_at`, `created_at` | Lifecycle sama dengan token verifikasi. |
| `oauth_clients` | `id`, `client_id`, `client_secret_hash`, `name`, `redirect_uris`, `allowed_scopes`, `is_active` | URI dan scope `jsonb`; `client_id` unik. |
| `authorization_codes` | `id`, `code_hash`, `member_id`, `oauth_client_id`, `product_id`, `license_id`, `redirect_uri`, `scope`, `code_challenge`, `code_challenge_method`, `expires_at`, `used_at` | Sekali pakai dan dipakai bersama PKCE. |
| `refresh_tokens` | `id`, `token_hash`, `member_id`, `oauth_client_id`, `product_id`, `license_id`, `signing_key_id`, `scope`, `expires_at`, `revoked_at`, `replaced_by_id` | Token direvoke saat logout, insiden, atau lisensi suspended. |
| `jwt_signing_keys` | `id`, `kid`, `algorithm`, `public_jwk`, `private_key_reference`, `activated_at`, `retired_at`, `is_active` | RS256; private key berada di secret manager. |

## Tabel operasional

| Tabel | Kolom utama | Keterangan |
|---|---|---|
| `notification_preferences` | `member_id`, `marketing_email_enabled`, `expiry_reminder_enabled`, `product_updates_enabled`, `updated_at` | Satu-ke-satu dengan member; email transaksional tetap dikirim. |
| `audit_logs` | `id`, `actor_id`, `actor_role`, `action`, `object_type`, `object_id`, `result`, `ip_address`, `user_agent`, `metadata`, `created_at` | Append-only. `metadata` tidak boleh memuat password, token, atau secret. |

`audit_logs` diindeks pada `(object_type, object_id)`, `actor_id`, dan `created_at`.
