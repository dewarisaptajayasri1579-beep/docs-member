# Central Membership & SSO Hub Test Scenarios

## 1. Execution Guide

| Level | Tool | Scope |
|---|---|---|
| Unit | Jest | Service, DTO validation, guard, license/payment state machine. |
| Integration | Jest + Supertest + PostgreSQL test DB | Controller, Prisma, guard, transaction, and error format. |
| E2E | Playwright | Member/admin browser journey. |
| External sandbox | Midtrans/Xendit sandbox | Hosted payment and original/simulated webhook. |
| Queue | BullMQ + Redis test instance | Retry, delayed job, lifecycle scheduler. |

Each scenario uses an isolated database and data is cleaned up after testing. The scheduler time must be injectible/fake so that the test does not depend on real time.

## 2. Functional Scenarios

| ID | Type | Precondition | Short Steps | Expected Result |
|---|---|---|---|---|
| TS-AUTH-01 | E2E | Email not registered | Register → open verification link → login | Account active, dashboard accessible, email sent via queue. |
| TS-AUTH-02 | Integration | Email already registered | Send register with same email, different capital | `409 EMAIL_ALREADY_REGISTERED`; no second account. |
| TS-AUTH-03 | Integration | Unverified account | Login and activate free | Rejected according to unverified account error. |
| TS-AUTH-04 | Integration | Active account | Login multiple times until limit | `429` after limit; password not shown in response/log. |
| TS-AUTH-05 | E2E | Active account | Forgot password → reset with token → login new password | Old password rejected, new password accepted, old token cannot be reused. |
| TS-LIC-01 | Integration | Active member, NOTO free active | Activate-free twice | First `201 active_free`; second `409`; one License-ID only. |
| TS-LIC-02 | Unit + integration | Paid license expired | Run lifecycle on expiry then grace end | `active → grace_period → suspended`; notification scheduled. |
| TS-LIC-03 | Integration | Two members | Member A reads license B | `404`/`403` without leaking license B details. |
| TS-ORD-01 | Integration | Active member, paid plan | Create order with same idempotency key twice | Order/payment URL same; one order `pending_payment`. |
| TS-ORD-02 | Integration | Order pending | Send same key with different body | `409` and original order unchanged. |
| TS-PAY-01 | Integration | Order pending | Send valid Midtrans webhook settlement | Order paid, payment settlement, license active, audit log created atomically. |
| TS-PAY-02 | Integration | Order pending | Webhook amount/signature invalid | `400`; no order/license change; event recorded. |
| TS-PAY-03 | Integration | Settlement already successful | Send identical webhook again | `200`; no increase in license/payment/email. |
| TS-PAY-04 | Sandbox | Sandbox credentials | Checkout Midtrans and Xendit then complete/cancel | Internal status matches callback for each gateway. |
| TS-SSO-01 | Integration | OAuth client/redirect URI valid | Authorize with PKCE → token exchange | One-time code, JWT RS256 valid via JWKS. |
| TS-SSO-02 | Integration | Member license suspended | Authorize and refresh token | Rejected `license_suspended`/`license_inactive`. |
| TS-ADM-01 | Integration | Non-admin member | Call admin endpoint | `403`; audit does not contain secret. |
| TS-ADM-02 | Integration | Super admin | Suspend member then check token/access | Action recorded; new access rejected according to rules. |
| TS-JOB-01 | Queue | Simulated email provider failure | Process email job | Job retried with backoff; registration/payment transaction still successful. |
| TS-JOB-02 | Queue | Two workers/schedulers | Run lifecycle concurrently | One transition effective; no duplicate email/status. |

## 3. Security and Reliability Regression

| ID | Testing | Expected Result |
|---|---|---|
| TS-SEC-01 | Access endpoint without/expired/malformed bearer token | `401` with standard error format. |
| TS-SEC-02 | OAuth redirect URI, state, or PKCE invalid | Authorization rejected; no code/token issued. |
| TS-SEC-03 | Unknown DTO field, payload too large, or invalid query pagination | `400`; field not passed to service/database. |
| TS-SEC-04 | CORS from unauthorized origin | Browser cannot access API. |
| TS-REL-01 | PostgreSQL/Redis/email temporarily unavailable | API fails gracefully; no partial settlement; job can be recovered/retried. |
| TS-REL-02 | Run Prisma migration on old data | Migration successful, important data remains valid, and rollback plan available. |

## 4. Smoke Test Staging/Production

1. `GET /health` is healthy and frontend can load public pages.
2. Sandbox registration/login is successful; email queue worker processes job.
3. Catalog, free activation, and dashboard display correct licenses.
4. Midtrans/Xendit sandbox sends valid webhook and retries without duplication.
5. OAuth authorize/token/JWKS for staging client is successful.
6. Failed queue jobs, API/worker logs, disk VPS, PostgreSQL, and Redis are monitored after deployment.