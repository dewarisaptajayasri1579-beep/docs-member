# API Overview — Central Membership & SSO Hub

## Purpose

This document is the HTTP API contract for the backend Central Membership & SSO Hub based on **NestJS**. The API covers member accounts, catalogs, licenses, checkout, payments, admin, and OAuth2/SSO.

## Base URL and versioning

| Environment | Base URL |
|---|---|
| Local | `http://localhost:3001` |
| Staging | `https://api-staging.hub.domain.com` |
| Production | `https://api.hub.domain.com` |

REST endpoints use the prefix `/api/v1`, for example `GET /api/v1/products`. OAuth2 and webhook endpoints do not use a prefix as they follow external standard/provider: `/oauth/token` and `/webhooks/midtrans`.

## NestJS Convention

| Area | Implementation Standard |
|---|---|
| Controller | One controller per resource; only handles HTTP. |
| Service | Stores business rules, transaction boundaries, and external integrations. |
| DTO | Use `class-validator` and `class-transformer`; global `ValidationPipe` uses `whitelist`, `forbidNonWhitelisted`, and `transform`. |
| Database | Prisma Service; settlement payment uses `prisma.$transaction`. |
| Auth | `JwtAuthGuard` for members, `RolesGuard` for admins, and a special OAuth2/webhook guard. |
| Documentation | Swagger/OpenAPI at `/api/docs`; DTO and responses are decorated with Swagger. |
| Queue | BullMQ for emails, reminder expiries, and non-critical tasks. |

## Authentication and Authorization

Member/admin endpoints receive `Authorization: Bearer <access_token>`. Guards validate RS256 signature, `exp`, and account status. Admin endpoints also require the `super_admin` role.

OAuth2 uses the Authorization Code Flow with PKCE. Midtrans/Xendit webhooks do not use bearer tokens: validate signature/callback token, amount, and idempotence must be completed before orders or licenses are modified.

## Response Format

### Success

```json
{
  "data": { "id": "0d1c1b9e-4d61-4d60-8e34-1f7cc4f1a5f9" },
  "meta": { "requestId": "req_01J..." }
}
```

Collections use `meta.page`, `meta.limit`, `meta.total`, and `meta.totalPages`.

### Failure

```json
{
  "statusCode": 409,
  "code": "LICENSE_ALREADY_EXISTS",
  "message": "You already have an active license for this product.",
  "details": [],
  "requestId": "req_01J..."
}
```

Use a global NestJS exception filter. Safe messages are displayed to users; stack traces, passwords, tokens, and secrets are never returned.

## HTTP Status and Application Codes

| Status | Usage |
|---:|---|
| `200` / `201` / `204` | Request successful, resource created, or successful without a body. |
| `202` | Asynchronous task accepted. |
| `400` | Invalid DTO/request. |
| `401` | Invalid token/credentials or expired. |
| `403` | Role, license, or scope does not allow access. |
| `404` | Resource not found/inactive. |
| `409` | Email, order, or license conflict. |
| `422` | Request valid in form but violates process rules. |
| `429` | Rate limit exceeded. |
| `503` | Dependency unavailable. |

Main application codes: `EMAIL_ALREADY_REGISTERED`, `EMAIL_NOT_VERIFIED`, `INVALID_CREDENTIALS`, `LICENSE_ALREADY_EXISTS`, `NO_LICENSE`, `LICENSE_SUSPENDED`, `ORDER_EXPIRED`, `DUPLICATE_ORDER`, `INVALID_WEBHOOK_SIGNATURE`, and `PAYMENT_AMOUNT_MISMATCH`.

## Pagination and Idempotence

- Collections receive `page` (default `1`) and `limit` (default `20`, maximum `100`).
- Order creation endpoints require the `Idempotency-Key` header with a UUID. The same key with identical bodies returns the initial result; different bodies return a `409`.
- Webhooks are idempotent with gateway event ID and `order_number`.

## Operational Security

1. Implement HTTPS, CORS allowlist, Helmet, and rate-limit on NestJS.
2. Implement stricter limits for login, registration, password reset, and email resend.
3. Create audit logs for authentication, license changes, payments, and admin actions.
4. Webhook endpoints use raw bodies when needed for provider signature verification.
5. API gateway keys, OAuth secrets, and JWT private keys are only stored on servers/secret managers.