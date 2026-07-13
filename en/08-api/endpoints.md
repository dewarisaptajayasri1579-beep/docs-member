# API Endpoints Reference — Central Membership & SSO Hub

REST Prefix: `/api/v1`. Body uses `application/json`, except for `/oauth/token` which uses `application/x-www-form-urlencoded`.

## Health and Public Catalog

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Application and main dependency health check. |
| `GET` | `/api/v1/products` | Public | List of active products; query `search`, `page`, `limit`. |
| `GET` | `/api/v1/products/:productCode` | Public | Product details along with active plans. |
| `GET` | `/api/v1/products/:productCode/plans` | Public | Available plans for the product. |

```json
{ "data": { "code": "NTO", "name": "NOTO", "plans": [{ "code": "free", "type": "free", "priceAmount": 0, "currency": "IDR" }] } }
```

## Auth and Accounts

| Method | Path | Auth | Important Request / Result |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | `{ fullName, email, password, passwordConfirmation }`; creates `unverified` account, `201`. |
| `POST` | `/api/v1/auth/login` | Public | `{ email, password }`; access token, refresh token, and profile, `200`. |
| `POST` | `/api/v1/auth/logout` | Member | Revokes refresh token/session, `204`. |
| `POST` | `/api/v1/auth/refresh` | Public | `{ refreshToken }`; rotates refresh token. |
| `POST` | `/api/v1/auth/verify-email` | Public | `{ token }`; activates account. |
| `POST` | `/api/v1/auth/resend-verification` | Public | `{ email }`; generic response, `202`. |
| `POST` | `/api/v1/auth/forgot-password` | Public | `{ email }`; generic response, `202`. |
| `POST` | `/api/v1/auth/reset-password` | Public | `{ token, password, passwordConfirmation }`, `204`. |
| `GET` | `/api/v1/me` | Member | Member profile and status summary. |
| `PATCH` | `/api/v1/me` | Member | `{ fullName, avatarUrl? }`. |
| `PATCH` | `/api/v1/me/password` | Member | `{ currentPassword, newPassword, passwordConfirmation }`, `204`. |
| `PATCH` | `/api/v1/me/notification-preferences` | Member | Notification preferences. |

Login/registration/reset must use a rate limiter. Forgot-password and resend email must not disclose whether an email is registered.

## Member Dashboard and Licenses

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/dashboard` | Member | Subscription summary, alerts, and latest payments. |
| `GET` | `/api/v1/licenses` | Member | Own licenses; filter `status`, `productCode`, `page`, `limit`. |
| `GET` | `/api/v1/licenses/:licenseId` | Member | Details of own license. |
| `POST` | `/api/v1/licenses/activate-free` | Member | `{ productCode, planCode }`; creates `active_free`, `201`. |
| `POST` | `/api/v1/licenses/:licenseId/renew` | Member | `{ planCode, gateway }`; creates a paid renewal order, `201`. |
| `GET` | `/api/v1/licenses/:licenseId/sso-link` | Member | SSO authorization URL for the license product. |

Free activation rejects unverified accounts, inactive products/plans, and existing valid licenses. License-ID is created upon first activation and does not change during renewal.

## Checkout and Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/orders` | Member | Creates a paid checkout; `Idempotency-Key` header is mandatory. |
| `GET` | `/api/v1/orders` | Member | Own order history; filter `status`, `page`, `limit`. |
| `GET` | `/api/v1/orders/:orderId` | Member | Order details and payment instructions. |
| `GET` | `/api/v1/payments` | Member | Payment history; filter `status`, `page`, `limit`. |
| `GET` | `/api/v1/payments/:paymentId/invoice` | Member | Invoice settlement metadata/download. |

Order body:

```json
{ "productCode": "NTO", "planCode": "pro-monthly", "gateway": "midtrans" }
```

The `201` response contains `id`, `orderNumber`, `status: "pending_payment"`, `amount`, `currency`, `paymentUrl`, and `expiresAt`.

## Payment Gateway Webhook

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/webhooks/midtrans` | Signature Midtrans | Processes notification/Snap callback. |
| `POST` | `/webhooks/xendit` | Callback token Xendit | Processes invoice callback. |

The Webhook must validate the signature/token and amount, store the event, check idempotency, then within a single transaction update the payment, order, license, and audit log. Invalid events return `400`; retrying a successful event returns `200` without re-activation. This endpoint must not be called by the frontend.

## Admin API

All the following endpoints require a bearer token with the `super_admin` role.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | Member, license, order, and payment metrics. |
| `GET` | `/api/v1/admin/members` | List of members; filter `search`, `status`, `page`, `limit`. |
| `GET` | `/api/v1/admin/members/:memberId` | Member, license, and order details. |
| `PATCH` | `/api/v1/admin/members/:memberId/status` | `{ status: "active" | "suspended" }`; audit log mandatory. |
| `GET` | `/api/v1/admin/products` | All products/plans, including inactive ones. |
| `POST` | `/api/v1/admin/products` | Creates a new product. |
| `PATCH` | `/api/v1/admin/products/:productId` | Changes product metadata/status. |
| `POST` | `/api/v1/admin/products/:productId/plans` | Creates a plan. |
| `PATCH` | `/api/v1/admin/plans/:planId` | Changes a plan without altering old orders. |
| `GET` | `/api/v1/admin/orders` | Global order filter. |
| `GET` | `/api/v1/admin/payments` | Global payment filter. |
| `POST` | `/api/v1/admin/orders/:orderId/confirm-payment` | Verified manual fallback; audit mandatory. |
| `GET` | `/api/v1/admin/audit-logs` | Filter `actorId`, `action`, `objectType`, `from`, `to`. |
| `POST` | `/api/v1/admin/oauth-clients` | Registers SaaS client; secret is returned only once. |
| `PATCH` | `/api/v1/admin/oauth-clients/:clientId` | Changes redirect URI, scope, or status. |
| `POST` | `/api/v1/admin/oauth-clients/:clientId/rotate-secret` | Rotates client secret. |

## OAuth2 and Metadata

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/oauth/authorize` | Hub Session | Authorization Code Flow + PKCE. |
| `POST` | `/oauth/token` | Client + code/refresh token | Exchanges authorization code or refresh token. |
| `GET` | `/oauth/userinfo` | OAuth access token | Claims according to scope. |
| `POST` | `/oauth/revoke` | Client + token | Revokes refresh token. |
| `GET` | `/oauth/logout` | Hub Session | SSO logout and revokes associated tokens. |
| `GET` | `/.well-known/jwks.json` | Public | Active/retired JWT public keys. |
| `GET` | `/.well-known/oauth-authorization-server` | Public | Authorization server metadata. |

Scopes: `openid`, `profile:read`, and `license:read`. Tokens are only issued for active accounts with `active`, `active_free`, or `grace_period` licenses.

## NestJS Module Mapping

| Module | Controller |
|---|---|
| `AuthModule` | `AuthController`, `MeController` |
| `ProductsModule` | `ProductsController`, `PlansController` |
| `LicensesModule` | `LicensesController`, `DashboardController` |
| `OrdersModule` | `OrdersController` |
| `PaymentsModule` | `PaymentsController`, `WebhooksController` |
| `AdminModule` | `AdminMembersController`, `AdminProductsController`, `AdminOrdersController`, `AuditLogsController` |
| `OAuthModule` | `OAuthController`, `WellKnownController` |