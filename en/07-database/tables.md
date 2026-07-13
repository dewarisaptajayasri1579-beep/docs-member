# Database Tables

## General conventions

- Primary keys use `uuid` with default `gen_random_uuid()`.
- Timestamps use `timestamptz` and are stored in UTC.
- Monetary values use `bigint` in minor units (Rp50.000 = `50000`), not floating point.
- Passwords, tokens, and client secrets are only stored as hashes.
- Main business entities have `created_at` and `updated_at`.

## Core tables

| Table | Function | Primary keys and main constraints |
|---|---|---|
| `members` | Member and admin accounts. | `email` unique; role `member`/`super_admin`. |
| `products` | SaaS application catalog. | `code` unique, e.g., `NTO`. |
| `plans` | Plans per product. | Unique `(product_id, code)`; price non-negative. |
| `licenses` | Member access rights to products. | `license_key` unique; one license per member-product. |
| `orders` | Checkout/renewal sessions. | `order_number` unique; stores checkout value snapshot. |
| `payments` | Payment attempts and results. | Gateway transaction ID unique per gateway. |
| `webhook_events` | Gateway callbacks for audit/retry. | Payload `jsonb`; events can be idempotently identified. |

### `members`

| Column | Type | Null | Description |
|---|---|---:|---|
| `id` | uuid | no | Primary key. |
| `email` | varchar(320) | no | Trimmed, lowercase, and unique. |
| `full_name` | varchar(120) | no | Member display name. |
| `password_hash` | varchar(255) | yes | Argon2/bcrypt hash. |
| `status` | member_status | no | `unverified`, `active`, `suspended`, `deleted`. |
| `role` | member_role | no | `member` (default) or `super_admin`. |
| `avatar_url` | text | yes | Avatar URL if available. |
| `last_login_at` | timestamptz | yes | Last successful login. |
| `created_at`, `updated_at` | timestamptz | no | Lifecycle metadata. |

Index: unique `lower(email)` and index `status`.

### `products` and `plans`

| Table | Main columns | Description |
|---|---|---|
| `products` | `id`, `code`, `name`, `description`, `website_url`, `sso_redirect_uri`, `is_active`, `grace_period_days` | `code` 2–4 uppercase letters; grace period default 7 days. |
| `plans` | `id`, `product_id`, `code`, `name`, `type`, `billing_interval`, `price_amount`, `currency`, `duration_days`, `features`, `is_active` | `features` `jsonb`; free plans have 0 value and can be without expiry. |

`billing_interval`: `none`, `monthly`, or `yearly`. Inactive products cannot be
activated and inactive plans cannot be newly purchased.

### `licenses`

| Column | Type | Null | Description |
|---|---|---:|---|
| `id` | uuid | no | Primary key. |
| `member_id`, `product_id`, `plan_id` | uuid | no | Foreign keys for owner, product, and plan. |
| `license_key` | varchar(32) | no | Example `NTO-A1B2-C3D4-E5F6`; globally unique. |
| `tier` | varchar(50) | no | Snapshot of plan code/tier. |
| `status` | license_status | no | `active`, `active_free`, `grace_period`, `suspended`, `cancelled`. |
| `started_at`, `expired_at` | timestamptz | yes | `expired_at` null for Free Forever. |
| `grace_period_ends_at` | timestamptz | yes | Only paid licenses in grace period. |
| `cancelled_at` | timestamptz | yes | Time of permanent cancellation. |
| `created_at`, `updated_at` | timestamptz | no | Lifecycle metadata. |

Index: unique `license_key`; index `(member_id, product_id)`; partial unique index
`(member_id, product_id) WHERE status <> 'cancelled'`.

### `orders`, `payments`, and `webhook_events`

| Table | Main columns | Description |
|---|---|---|
| `orders` | `id`, `order_number`, `member_id`, `product_id`, `plan_id`, `license_id`, `status`, `amount`, `currency`, `gateway`, `expires_at`, `paid_at` | Status: `pending_payment`, `paid`, `failed`, `expired`, `cancelled`, `duplicate`; `license_id` null for first order. |
| `payments` | `id`, `order_id`, `gateway`, `gateway_transaction_id`, `gateway_reference`, `status`, `amount`, `currency`, `paid_at`, `raw_response` | Canonical status: `pending`, `settlement`, `failed`, `expired`, `cancelled`, `refunded`. |
| `webhook_events` | `id`, `payment_id`, `gateway`, `external_event_id`, `event_type`, `signature_valid`, `processed_at`, `payload`, `received_at` | Payload of type `jsonb`; invalid events are still recorded without license activation. |

Unique `(gateway, gateway_transaction_id)` on `payments` and `(gateway,
external_event_id)` on `webhook_events` if the gateway provides an event ID. Webhook
workers update payment, order, license, and audit within a single database transaction.

## Identity and OAuth2 Tables

| Table | Main columns | Description |
|---|---|---|
| `email_verification_tokens` | `id`, `member_id`, `token_hash`, `expires_at`, `used_at`, `created_at` | New tokens invalidate old tokens; only valid and unused ones are accepted. |
| `password_reset_tokens` | `id`, `member_id`, `token_hash`, `expires_at`, `used_at`, `created_at` | Lifecycle same as verification tokens. |
| `oauth_clients` | `id`, `client_id`, `client_secret_hash`, `name`, `redirect_uris`, `allowed_scopes`, `is_active` | URI and scope `jsonb`; `client_id` unique. |
| `authorization_codes` | `id`, `code_hash`, `member_id`, `oauth_client_id`, `product_id`, `license_id`, `redirect_uri`, `scope`, `code_challenge`, `code_challenge_method`, `expires_at`, `used_at` | Single-use and used with PKCE. |
| `refresh_tokens` | `id`, `token_hash`, `member_id`, `oauth_client_id`, `product_id`, `license_id`, `signing_key_id`, `scope`, `expires_at`, `revoked_at`, `replaced_by_id` | Tokens are revoked upon logout, incident, or suspended license. |
| `jwt_signing_keys` | `id`, `kid`, `algorithm`, `public_jwk`, `private_key_reference`, `activated_at`, `retired_at`, `is_active` | RS256; private key resides in a secret manager. |

## Operational Tables

| Table | Main columns | Description |
|---|---|---|
| `notification_preferences` | `member_id`, `marketing_email_enabled`, `expiry_reminder_enabled`, `product_updates_enabled`, `updated_at` | One-to-one with members; transactional emails are still sent. |
| `audit_logs` | `id`, `actor_id`, `actor_role`, `action`, `object_type`, `object_id`, `result`, `ip_address`, `user_agent`, `metadata`, `created_at` | Append-only. `metadata` must not contain passwords, tokens, or secrets. |

`audit_logs` is indexed on `(object_type, object_id)`, `actor_id`, and `created_at`.