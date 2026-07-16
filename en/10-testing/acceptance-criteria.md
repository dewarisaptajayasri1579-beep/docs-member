# Acceptance Criteria — Central Membership & SSO Hub

## 1. General Completion Criteria

A feature is considered accepted if all the following criteria are met: implementation conforms to the document, relevant automated tests pass, errors are safe for users, sensitive data is not leaked, and important activities are recorded in audit logs. Testing must include happy path, validation, authorization, and relevant dependency failure.

## 2. Accounts and Authentication

| ID | Acceptance Criteria |
|---|---|
| AC-AUTH-01 | Registration with valid data creates an `unverified` account, normalizes email, and enqueues email verification. |
| AC-AUTH-02 | Duplicate email returns `409 EMAIL_ALREADY_REGISTERED`; password is never present in response/log. |
| AC-AUTH-03 | Valid verification token changes account to `active`; expired/used token is rejected. New token cancels old token. |
| AC-AUTH-04 | Login only succeeds for active accounts with valid credentials; response provides access/refresh token according to API contract. |
| AC-AUTH-05 | Unverified or suspended accounts do not obtain sessions/tokens that can be used. |
| AC-AUTH-06 | Forgot password/resend verification always provides generic response and has a rate limit. |
| AC-AUTH-07 | Refresh token is rotated; expired token cannot be reused. |

## 3. Products, Licenses, and Lifecycle

| ID | Acceptance Criteria |
|---|---|
| AC-LIC-01 | Public catalog only displays active products/plans. |
| AC-LIC-02 | Activation of free package by active member creates one `active_free` license, unique License-ID, and activation notification. |
| AC-LIC-03 | Member cannot have two active licenses for the same product; API returns `409 LICENSE_ALREADY_EXISTS`. |
| AC-LIC-04 | License-ID does not change upon renewal and is only recreated after the previous license is `cancelled`. |
| AC-LIC-05 | Job lifecycle moves paid license `active → grace_period → suspended` at the correct time, without affecting Free Forever. |
| AC-LIC-06 | Renewal during grace period returns license to `active` and calculates expiry according to business rules. |
| AC-LIC-07 | Member endpoint cannot read/modifiy licenses belonging to other members. |

## 4. Checkout and Payment

| ID | Acceptance Criteria |
|---|---|
| AC-PAY-01 | Paid order requires active member, active plan, valid gateway, and `Idempotency-Key` header. |
| AC-PAY-02 | Identical request with the same idempotency key returns the original order; different body returns `409`. |
| AC-PAY-03 | Successful order creates status `pending_payment`, snapshot amount/currency, and payment URL gateway. |
| AC-PAY-04 | Webhook only performs settlement after signature/callback token and amount are validated. |
| AC-PAY-05 | Atomic settlement: payment, order, license, and audit log are successful together or none are changed. |
| AC-PAY-06 | Webhook retry does not create payment, license, or activation email twice; response remains `200`. |
| AC-PAY-07 | Failed/expired payment does not activate license; user can create new checkout according to duplication rules. |
| AC-PAY-08 | Invoice/activation email is processed in queue after settlement without hindering webhook response. |

## 5. OAuth2 and SSO

| ID | Acceptance Criteria |
|---|---|
| AC-SSO-01 | `/oauth/authorize` validates client, registered redirect URI, state, scope, and PKCE. |
| AC-SSO-02 | One-time authorization code is tied to client/redirect URI and expires according to configuration. |
| AC-SSO-03 | Access token RS256 contains member and approved license claims; JWKS provides matching public key with `kid`. |
| AC-SSO-04 | Token is only issued for active accounts with `active`, `active_free`, or `grace_period` licenses. |
| AC-SSO-05 | Suspended/cancelled license is rejected with the correct code; refresh token cannot recover suspended access. |
| AC-SSO-06 | Logout/revoke revokes refresh token; expired access token is rejected. |

## 6. Admin, Queue, and Operations

| ID | Acceptance Criteria |
|---|---|
| AC-ADM-01 | Only `super_admin` can use admin endpoint; all sensitive actions produce audit logs. |
| AC-ADM-02 | Product/plan changes do not affect snapshot order prices that have already been created. |
| AC-JOB-01 | Job failure is recorded and retried with backoff without canceling the main transaction. |
| AC-JOB-02 | Only one scheduler lifecycle is effective per environment; job is safe when retried. |
| AC-OPS-01 | API health check, API/worker, PostgreSQL, and Redis are healthy before deployment is considered successful. |

## 7. Definition of Done Release

- Relevant unit, integration, and E2E tests pass in CI.
- Midtrans and Xendit sandbox pass for success, failed/expired, invalid signature, and webhook retry.
- Prisma migration is tested on an empty database and database upgrade.
- No secrets are present in the repository, API response, frontend bundle, or audit log.
- Staging has documented smoke test deployment and rollback results.