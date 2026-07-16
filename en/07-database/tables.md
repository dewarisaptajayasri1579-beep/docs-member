# Database Tables

## General Convention

- Primary key uses `uuid` with default `gen_random_uuid()`.
- Time uses `timestamptz` and is stored in UTC.
- Nominal uses `bigint` in minor units (Rp50,000 = `50000`), not floating point.
- Password, token, and client secret are stored as hashes only.
- Main business entities have `created_at` and `updated_at`.

## Core Tables

| Table | Function | Primary Key and Main Constraints |
|---|---|---|
| `members` | Member and admin accounts. | `email` is unique; role is `member`/`super_admin`. |
| `products` | SaaS application catalog. | `code` is unique, e.g., `NTO`. |
| `plans` | Product packages. | Unique `(product_id, code)`; price is non-negative. |
| `licenses` | Member access rights to products. | `license_key` is unique; one license per member-product. |
| `orders` | Checkout and renewal sessions. | `order_number` is unique; stores snapshot of checkout values. |
| `payments` | Payment attempts and results. | Unique transaction ID per gateway. |
| `webhook_events` | Gateway callbacks for audit/retry. | Payload is `jsonb`; events can be identified as idempotent. |

### `members`

| Column | Type | Null | Description |
|---|---|---:|---|
| `id` | uuid | not null | Primary key. |
| `email` | varchar(320) | not null | Lowercase, unique, and trimmed. |
| `full_name` | varchar(120) | not null | Member display name. |
| `password_hash` | varchar(255) | yes | Hashed Argon2/bcrypt password. |
| `status` | member_status | not null | `unverified`, `active`, `suspended`, `deleted`. |
| `role` | member_role | not null | `member` (default) or `super_admin`. |
| `avatar_url` | text | yes | URL of member avatar if available. |
| `last_login_at` | timestamptz | yes | Last successful login time. |
| `created_at`, `updated_at` | timestamptz | not null | Lifecycle metadata. |

Index: unique `lower(email)` and index `status`.

### `products` and `plans`

| Table | Primary Key Columns | Description |
|---|---|---|
| `products` | `id`, `code`, `name`, `description`, `website_url`, `sso_redirect_uri`, `is_active`, `grace_period_days` | `code` is 2-4 uppercase letters; grace period defaults to 7 days. |
| `plans` | `id`, `product_id`, `code`, `name`, `type`, `billing_interval`, `price_amount`, `currency`, `duration_days`, `features`, `is_active` | `features` is `jsonb`; free plans have a value of 0 and can be purchased without expiry. |

`billing_interval`: `none`, `monthly`, or `yearly`. Inactive products cannot be activated, and inactive plans cannot be purchased.

### `licenses`

| Column | Type | Null | Description |
|---|---|---:|---|
| `id` | uuid | not null | Primary key. |
| `member_id`, `product_id`, `plan_id` | uuid | not null | Foreign key to member, product, and plan owners. |
| `license_key` | varchar(32) | not null | Example: `NTO-A1B2-C3D4-E5F6`; unique globally. |
| `tier` | varchar(50) | not null | Snapshot of plan code/tier. |
| `status` | license_status | not null | `active`, `active_free`, `grace_period`, `suspended`, `cancelled`. |
| `started_at`, `expired_at` | timestamptz | yes | `expired_at` is null for Free Forever. |
| `grace_period_ends_at` | timestamptz | yes | Only paid licenses are in the grace period. |
| `cancelled_at` | timestamptz | yes | Time of permanent cancellation. |
| `created_at`, `updated_at` | timestamptz | not null | Lifecycle metadata. |

Index: unique `license_key`; index `(member_id, product_id)`; partial unique index `(member_id, product_id)` WHERE `status` <> 'cancelled'.

### `orders`, `payments`, and `webhook_events`

| Table | Primary Key Columns | Description |
|---|---|---|
| `orders` | `id`, `order_number`, `member_id`, `product_id`, `plan_id`, `license_id`, `status`, `amount`, `currency`, `gateway`, `expires_at`, `paid_at` | Status: `pending_payment`, `paid`, `failed`, `expired`, `cancelled`, `duplicate`; `license_id` is null for the first order. |
| `payments` | `id`, `order_id`, `gateway`, `gateway_transaction_id`, `gateway_reference`, `status`, `amount`, `currency`, `paid_at`, `raw_response` | Status canonical: `pending`, `settlement`, `failed`, `expired`, `cancelled`, `refunded`. |
| `webhook_events` | `id`, `payment_id`, `gateway`, `external_event_id`, `event_type`, `signature_valid`, `processed_at`, `payload`, `received_at` | Payload is `jsonb`; invalid events are still recorded without activating licenses. |

Unique `(gateway, gateway_transaction_id)` on `payments` and `(gateway, external_event_id)` on `webhook_events` if the gateway provides an event ID. The webhook worker updates payments, orders, licenses, and audit in a single database transaction.

## Identity and OAuth2 Tables

| Table | Primary Key Columns | Description |
|---|---|---|
| `email_verification_tokens` | `id`, `member_id`, `token_hash`, `expires_at`, `used_at`, `created_at` | New tokens invalidate old tokens; only valid and unused tokens are accepted. |
| `password_reset_tokens` | `id`, `member_id`, `token_hash`, `expires_at`, `used_at`, `created_at` | Lifecycle is the same as verification tokens. |
| `oauth_clients` | `id`, `client_id`, `client_secret_hash`, `name`, `redirect_uris`, `allowed_scopes`, `is_active` | URI and scope are `jsonb`; `client_id` is unique. |
| `authorization_codes` | `id`, `code_hash`, `member_id`, `oauth_client_id`, `product_id`, `license_id`, `redirect_uri`, `scope`, `code_challenge`, `code_challenge_method`, `expires_at`, `used_at` | One-time use and used with PKCE. |
| `refresh_tokens` | `id`, `token_hash`, `member_id`, `oauth_client_id`, `product_id`, `license_id`, `signing_key_id`, `scope`, `expires_at`, `revoked_at`, `replaced_by_id` | Tokens are revoked on logout, incidents, or license suspension. |
| `jwt_signing_keys` | `id`, `kid`, `algorithm`, `public_jwk`, `private_key_reference`, `activated_at`, `retired_at`, `is_active` | RS256; private key is in a secret manager. |

## Operational Tables

| Table | Primary Key Columns | Description |
|---|---|---|
| `notification_preferences` | `member_id`, `marketing_email_enabled`, `expiry_reminder_enabled`, `product_updates_enabled`, `updated_at` | One-to-one with member; transactional emails are still sent. |
| `audit_logs` | `id`, `actor_id`, `actor_role`, `action`, `object_type`, `object_id`, `result`, `ip_address`, `user_agent`, `metadata`, `created_at` | Append-only. `metadata` cannot contain passwords, tokens, or secrets. |

`audit_logs` is indexed on `(object_type, object_id)`, `actor_id`, and `created_at`.