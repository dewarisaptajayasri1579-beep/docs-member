# API Endpoints Reference — Central Membership & SSO Hub

Prefix REST: `/api/v1`. The request body uses `application/json`, except for `/oauth/token` which uses `application/x-www-form-urlencoded`.

## Health and Public Catalog

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Health check of the application and main dependencies. |
| `GET` | `/api/v1/products` | Public | List of active products; query `search`, `page`, `limit`. |
| `GET` | `/api/v1/products/:productCode` | Public | Product details along with active plans. |
| `GET` | `/api/v1/products/:productCode/plans` | Public | Plans available for the product. |

```json
{ "data": { "code": "NTO", "name": "NOTO", "plans": [{ "code": "free", "type": "free", "priceAmount": 0, "currency": "IDR" }] } }
```

## Auth and Account

| Method | Path | Auth | Request / Result |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | `{ fullName, email, password, passwordConfirmation }`; creates an `unverified` account, `201`. |
| `POST` | `/api/v1/auth/login` | Public | `{ email, password }`; access token, refresh token, and profile, `200`. |
| `POST` | `/api/v1/auth/logout` | Member | Revokes refresh token/session, `204`. |
| `POST` | `/api/v1/auth/refresh` | Public | `{ refreshToken }`; rotates refresh token. |
| `POST` | `/api/v1/auth/verify-email` | Public | `{ token }`; activates account. |
| `POST` | `/api/v1/auth/resend-verification` | Public | `{ email }`; generic response, `202`. |
| `POST` | `/api/v1/auth/forgot-password` | Public | `{ email }`; generic response, `202`. |
| `POST` | `/api/v1/auth/reset-password` | Public | `{ token, password, passwordConfirmation }`, `204`. |
| `GET` | `/api/v1/me` | Member | Profile and member status summary. |
| `PATCH` | `/api/v1/me` | Member | `{ fullName, avatarUrl? }`. |
| `PATCH` | `/api/v1/me/password` | Member | `{ currentPassword, newPassword, passwordConfirmation }`, `204`. |
| `PATCH` | `/api/v1/me/notification-preferences` | Member | Notification preferences. |

Registration/login/reset must use rate limiter. Forgot-password and resend email must not disclose whether the email is registered.

## Dashboard and Member License

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/dashboard` | Member | Subscription summary, warnings, and latest payments. |
| `GET` | `/api/v1/licenses` | Member | Member's licenses; filter `status`, `productCode`, `page`, `limit`. |
| `GET` | `/api/v1/licenses/:licenseId` | Member | Detail of member's license. |
| `POST` | `/api/v1/licenses/activate-free` | Member | `{ productCode, planCode }`; creates `active_free`, `201`. |
| `POST` | `/api/v1/licenses/:licenseId/renew` | Member | `{ planCode, gateway }`; creates order renewal paid, `201`. |
| `GET` | `/api/v1/licenses/:licenseId/sso-link` | Member | SSO authorization URL for product license. |

Free activation rejects unverified accounts, inactive products/plans, and existing valid licenses. License-ID is created on the first activation and does not change upon renewal.

## Checkout and Payment

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/orders` | Member | Creates paid checkout; header `Idempotency-Key` is required. |
| `GET` | `/api/v1/orders` | Member | Member's order history; filter `status`, `page`, `limit`. |
| `GET` | `/api/v1/orders/:orderId` | Member | Order details and payment instructions. |
| `GET` | `/api/v1/payments` | Member | Payment history; filter `status`, `page`, `limit`. |
| `GET` | `/api/v1/payments/:paymentId/invoice` | Member | Metadata/download invoice settlement. |

Order body:

```json
{ "productCode": "NTO", "planCode": "pro-monthly", "gateway": "midtrans" }
```

Response `201` contains `id`, `orderNumber`, `status: "pending_payment"`, `amount`, `currency`, `paymentUrl`, and `expiresAt`.

## Webhook Payment Gateway

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/webhooks/midtrans` | Midtrans Signature | Processes notification/Snap callback. |
| `POST` | `/webhooks/xendit` | Xendit Callback Token | Processes invoice callback. |

Webhook must validate signature/token and amount, save event, check idempotency, then in one transaction update payment, order, license, and audit log. Invalid event gives `400`; retry successful event gives `200` without reactivation. This endpoint should not be called by frontend.

## Admin API

All endpoints below require a bearer token with role `super_admin`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | Member metrics, licenses, orders, and payments. |
| `GET` | `/api/v1/admin/members` | List of members; filter `search`, `status`, `page`, `limit`. |
| `GET` | `/api/v1/admin/members/:memberId` | Member details, licenses, and orders. |
| `PATCH` | `/api/v1/admin/members/:memberId/status` | `{ status: "active" | "suspended" }`; audit log is required. |
| `GET` | `/api/v1/admin/products` | All products/plans, including inactive. |
| `POST` | `/api/v1/admin/products` | Creates a new product. |
| `PATCH` | `/api/v1/admin/products/:productId` | Updates product metadata/status. |
| `POST` | `/api/v1/admin/products/:productId/plans` | Creates a plan. |
| `PATCH` | `/api/v1/admin/plans/:planId` | Updates plan without changing old orders. |
| `GET` | `/api/v1/admin/orders` | Filters global orders. |
| `GET` | `/api/v1/admin/payments` | Filters global payments. |
| `POST` | `/api/v1/admin/orders/:orderId/confirm-payment` | Fallback manual verification; audit is required. |
| `GET` | `/api/v1/admin/audit-logs` | Filters `actorId`, `action`, `objectType`, `from`, `to`. |
| `POST` | `/api/v1/admin/oauth-clients` | Registers SaaS client; secret is only returned once. |
| `PATCH` | `/api/v1/admin/oauth-clients/:clientId` | Updates redirect URI, scope, or status. |
| `POST` | `/api/v1/admin/oauth-clients/:clientId/rotate-secret` | Rotates client secret. |

## OAuth2 and Metadata

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/oauth/authorize` | Hub Session | Authorization Code Flow + PKCE. |
| `POST` | `/oauth/token` | Client + code/refresh token | Exchanges authorization code or refresh token. |
| `GET` | `/oauth/userinfo` | OAuth access token | Claims according to scope. |
| `POST` | `/oauth/revoke` | Client + token | Revokes refresh token. |
| `GET` | `/oauth/logout` | Hub Session | Logs out SSO and revokes related token. |
| `GET` | `/.well-known/jwks.json` | Public | Public key JWT active/retired. |
| `GET` | `/.well-known/oauth-authorization-server` | Public | Metadata authorization server. |

Scope: `openid`, `profile:read`, and `license:read`. Token is only issued for active accounts with licenses `active`, `active_free`, or `grace_period`.

## Mapping NestJS Modules

| Module | Controller |
|---|---|
| `AuthModule` | `AuthController`, `MeController` |
| `ProductsModule` | `ProductsController`, `PlansController` |
| `LicensesModule` | `LicensesController`, `DashboardController` |
| `OrdersModule` | `OrdersController` |
| `PaymentsModule` | `PaymentsController`, `WebhooksController` |
| `AdminModule` | `AdminMembersController`, `AdminProductsController`, `AdminOrdersController`, `AuditLogsController` |
| `OAuthModule` | `OAuthController`, `WellKnownController` |