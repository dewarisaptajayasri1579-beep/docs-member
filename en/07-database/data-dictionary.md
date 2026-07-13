# Data Dictionary

## Domain / enum

| Domain | Value | Meaning |
|---|---|---|
| `member_status` | `unverified`, `active`, `suspended`, `deleted` | Account lifecycle; `deleted` is a soft delete. |
| `member_role` | `member`, `super_admin` | Application-level authorization. |
| `plan_type` | `free`, `trial`, `paid` | Commercial model of the plan. |
| `license_status` | `active`, `active_free`, `grace_period`, `suspended`, `cancelled` | License status and JWT claim. |
| `order_status` | `pending_payment`, `paid`, `failed`, `expired`, `cancelled`, `duplicate` | Checkout session status. |
| `payment_status` | `pending`, `settlement`, `failed`, `expired`, `cancelled`, `refunded` | Canonical payment status. |
| `payment_gateway` | `midtrans`, `xendit` | Gateway in the initial version. |

## Cross-table data definitions

| Element | Type/format | Definition and rules |
|---|---|---|
| `id` | UUID v4 | Internal identifier. |
| `created_at`, `updated_at` | UTC `timestamptz` | `updated_at` changes when the entity is mutated. |
| `email` | max. 320 characters | Trimmed/lowercased before storage; globally unique. |
| `*_hash` | string hash | One-way hash; original value is not stored or logged. |
| `amount` / `price_amount` | `bigint` | Minor unit according to `currency`; does not use floating point. |
| `currency` | ISO 4217, 3 characters | Current default `IDR`. |
| `metadata`, `payload`, `features` | `jsonb` | Flexible data that is still validated by the application; without secrets. |
| `expires_at` | UTC `timestamptz` | Limit for tokens, orders, or access; null only for concepts without expiry. |

## Entity definitions

| Entity | Business identity | Key data | Retention / notes |
|---|---|---|---|
| Member | `members.email` | Name, password hash, status, role. | Soft-delete to retain transaction/audit trails. |
| Product | `products.code` | Name, SSO redirect, active status, grace period. | Deactivate, do not delete if licenses exist. |
| Plan | `product_id + code` | Price, duration, interval, type, features. | Price may change; orders store a snapshot. |
| License | `licenses.license_key` | Owner, product, tier, status, active period. | ID does not change upon renewal; recreated only after `cancelled`. |
| Order | `orders.order_number` | Member, plan, amount, gateway, expiry. | Commercial value is not mutated after creation. |
| Payment | `gateway + gateway_transaction_id` | Order, gateway status, amount, payment time. | Raw response is sanitized from sensitive data. |
| Webhook Event | `gateway + external_event_id` | Payload, signature validation, processing time. | Proof of idempotency and for troubleshooting. |
| OAuth Client | `oauth_clients.client_id` | Redirect URI, scope, secret hash. | Secret is displayed once during client registration. |
| Authorization Code | `code_hash` | Member, client, product/license, PKCE, expiry. | Single-use and very short-lived. |
| Refresh Token | `token_hash` | Client, member, license, scope, revoke/rotation. | Revoked upon logout, incident, or suspended license. |
| JWT Signing Key | `kid` | Public JWK, RS256, key lifecycle. | Private key is only referenced to a secret manager. |
| Audit Log | `id` | Actor, action, object, result, IP, secure metadata. | Append-only; not edited by regular applications. |

## Data quality and security rules

1.  Foreign keys use `RESTRICT` for financial/audit data and `CASCADE` only for
    temporary tokens that are meaningless without their owner.
2.  Webhooks with invalid signatures must not modify `orders`, `payments`, or
    `licenses`; the event is still logged.
3.  Settlement modifies `payments`, `orders`, `licenses`, and `audit_logs` within a single
    database transaction.
4.  Access to webhook payload, audit log, and OAuth data is restricted to Super Admins or
    authorized backend services.
5.  Unique constraints and idempotency keys handle duplicate checkouts/webhooks; frontend
    is not the sole control.