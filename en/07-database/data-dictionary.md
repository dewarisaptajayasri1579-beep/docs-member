# Data Dictionary

## Domain / enum

| Domain | Value | Meaning |
|---|---|---|
| `member_status` | `unverified`, `active`, `suspended`, `deleted` | Account lifecycle; `deleted` is soft delete. |
| `member_role` | `member`, `super_admin` | Application-level authorization. |
| `plan_type` | `free`, `trial`, `paid` | Commercial package model. |
| `license_status` | `active`, `active_free`, `grace_period`, `suspended`, `cancelled` | License status and JWT claim. |
| `order_status` | `pending_payment`, `paid`, `failed`, `expired`, `cancelled`, `duplicate` | Checkout session status. |
| `payment_status` | `pending`, `settlement`, `failed`, `expired`, `cancelled`, `refunded` | Canonical payment status. |
| `payment_gateway` | `midtrans`, `xendit` | Gateway in the initial version. |

## Cross-table data definitions

| Element | Type/format | Definition and rules |
|---|---|---|
| `id` | UUID v4 | Internal identifier. |
| `created_at`, `updated_at` | UTC `timestamptz` | `updated_at` changes when the entity is mutated. |
| `email` | max. 320 characters | Stored in lowercase; unique globally. |
| `*_hash` | string hash | One-way hash; original value not stored or logged. |
| `amount` / `price_amount` | `bigint` | Minor unit according to `currency`; does not use floating point. |
| `currency` | ISO 4217, 3 characters | Default is currently `IDR`. |
| `metadata`, `payload`, `features` | `jsonb` | Flexible data that remains validated by the application; no secrets. |
| `expires_at` | UTC `timestamptz` | Token, order, or access expiration; null only for concepts without expiry. |

## Entity definitions

| Entity | Business identifier | Important data | Retention / notes |
|---|---|---|---|
| Member | `members.email` | Name, password hash, status, role. | Soft-delete to keep transaction/audit trail. |
| Product | `products.code` | Name, redirect SSO, active status, grace period. | Disable, do not delete if licensed. |
| Plan | `product_id + code` | Price, duration, interval, type, features. | Price can change; order stores snapshot. |
| License | `licenses.license_key` | Owner, product, tier, status, active period. | ID does not change when renewed; recreated after `cancelled`. |
| Order | `orders.order_number` | Member, plan, nominal, gateway, expiry. | Commercial value after creation does not mutate. |
| Payment | `gateway + gateway_transaction_id` | Order, gateway status, nominal, payment time. | Raw response sanitized from sensitive data. |
| Webhook Event | `gateway + external_event_id` | Payload, validation signature, processing time. | Proof of idempotence and troubleshooting. |
| OAuth Client | `oauth_clients.client_id` | Redirect URI, scope, secret hash. | Secret shown only once during client registration. |
| Authorization Code | `code_hash` | Member, client, product/license, PKCE, expiry. | One-time use and very short-lived. |
| Refresh Token | `token_hash` | Client, member, license, scope, revoke/rotation. | Revoked when logout, incident, or license suspended. |
| JWT Signing Key | `kid` | Public JWK, RS256, lifecycle key. | Private key only referenced to secret manager. |
| Audit Log | `id` | Actor, action, object, result, IP, secure metadata. | Append-only; not edited by regular application. |

## Data quality and security rules

1. Foreign keys use `RESTRICT` for financial/audit data and `CASCADE` only for temporary tokens without owners.
2. Webhooks with invalid signatures should not modify `orders`, `payments`, or `licenses`; events are still recorded.
3. Settlement updates `payments`, `orders`, `licenses`, and `audit_logs` in a single database transaction.
4. Access to webhook payload, audit log, and OAuth data is limited to Super Admin or authorized backend services.
5. Unique constraints and idempotency keys handle duplicate checkouts/webhooks; frontend is not the sole control.