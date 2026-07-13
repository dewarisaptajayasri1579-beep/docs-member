# API Overview — Central Membership & SSO Hub

## Purpose

This document is the HTTP API contract for the **NestJS**-based Central Membership & SSO Hub backend. The API covers member accounts, catalog, licenses, checkout, payments, admin, and OAuth2/SSO.

## Base URL and Versioning

| Environment | Base URL |
|---|---|
| Local | `http://localhost:3001` |
| Staging | `https://api-staging.hub.domain.com` |
| Production | `https://api.hub.domain.com` |

REST endpoints use the `/api/v1` prefix, for example `GET /api/v1/products`. OAuth2 and webhook endpoints do not use a prefix as they follow external standards/providers: `/oauth/token` and `/webhooks/midtrans`.

## NestJS Conventions

| Area | Implementation Standard |
|---|---|
| Controller | One controller per resource; only handles HTTP. |
| Service | Stores business rules, transaction boundaries, and external integrations. |
| DTO | Uses `class-validator` and `class-transformer`; global `ValidationPipe` uses `whitelist`, `forbidNonWhitelisted`, and `transform`. |
| Database | Prisma Service; settlement payment uses `prisma.$transaction`. |
| Auth | `JwtAuthGuard` for members, `RolesGuard` for admins, and specific guards for OAuth2/webhook. |
| Documentation | Swagger/OpenAPI at `/api/docs`; DTOs and responses are decorated with Swagger. |
| Queue | BullMQ for emails, expiry reminders, and non-critical jobs. |

## Authentication and Authorization

Member/admin endpoints accept `Authorization: Bearer <access_token>`. Guards validate the RS256 signature, `exp`, and account status. Admin endpoints also require the `super_admin` role.

OAuth2 uses the Authorization Code Flow with PKCE. Midtrans/Xendit webhooks do not use bearer tokens: signature/callback token validation, amount, and idempotency must be completed before an order or license is mutated.

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
  "message": "Anda sudah memiliki lisensi aktif untuk produk ini.",
  "details": [],
  "requestId": "req_01J..."
}
```

Uses NestJS's global exception filter. Messages are safe to display to users; stack traces, passwords, tokens, and secrets are never returned.

## HTTP Status and Application Codes

| Status | Usage |
|---:|---|
| `200` / `201` / `204` | Request successful, resource created, or success without body. |
| `202` | Asynchronous job accepted. |
| `400` | DTO/request invalid. |
| `401` | Token/credentials invalid or expired. |
| `403` | Role, license, or scope does not permit access. |
| `404` | Resource not found/inactive. |
| `409` | Email, order, or license conflict. |
| `422` | Request syntactically valid but violates business rules. |
| `429` | Rate limit exceeded. |
| `503` | Dependency unavailable. |

Main application codes: `EMAIL_ALREADY_REGISTERED`, `EMAIL_NOT_VERIFIED`, `INVALID_CREDENTIALS`, `LICENSE_ALREADY_EXISTS`, `NO_LICENSE`, `LICENSE_SUSPENDED`, `ORDER_EXPIRED`, `DUPLICATE_ORDER`, `INVALID_WEBHOOK_SIGNATURE`, and `PAYMENT_AMOUNT_MISMATCH`.

## Pagination and Idempotency

- Collections accept `page` (default `1`) and `limit` (default `20`, maximum `100`).
- Order creation endpoints require an `Idempotency-Key` UUID header. The same key with an identical body returns the initial result; a different body results in `409`.
- Webhooks are idempotent using the event gateway ID and `order_number`.

## Operational Security

1.  Implement HTTPS, CORS allowlist, Helmet, and rate-limit on NestJS.
2.  Apply stricter limits for login, registration, reset password, and resend email.
3.  Create audit logs for authentication, license changes, payments, and admin actions.
4.  Webhook endpoints use raw body when necessary for provider signature verification.
5.  API key gateway, OAuth secret, and JWT private key are only stored on the server/secret manager.