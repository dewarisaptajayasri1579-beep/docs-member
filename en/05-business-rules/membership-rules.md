# Membership and Billing Rules — Central Membership & SSO Hub

## 1. Document Purpose

This document outlines all key business rules that must be implemented in the Central Membership & SSO Hub system.

This document serves as a guide for:

- product owner,
- programmer,
- UI/UX designer,
- tester,
- and operations team.

Programmers must not make assumptions about rules not defined herein.

---

# 2. General Principles

1. A single member account can subscribe to multiple SaaS products simultaneously.
2. Each product has independent packages and pricing.
3. Licenses are only active after valid activation (free or confirmed payment).
4. Member data is private and can only be accessed by the owning member and Super Admin for legitimate reasons.
5. The payment process is atomic: a license must not be active if payment has not been confirmed.
6. Member data is not permanently deleted due to a change in license status.
7. All critical actions must be auditable.

---

# 3. Member Account Rules

## 3.1 Registration

1. Email must be unique across the entire system.
2. Email is normalized to lowercase and trimmed of spaces before storage.
3. Passwords must not be stored in plain text (must be hashed).
4. Accounts are `unverified` until the email is verified.
5. `unverified` accounts cannot activate licenses or log in to SaaS applications.
6. Email verification links have an expiration period (e.g., 24 hours).
7. Members can request a resend of the verification link.

## 3.2 Login

1. Login uses email and password.
2. Email is normalized before the validation process.
3. Repeated failed login attempts must be rate limited.
4. Accounts with `suspended` status cannot log in.
5. Accounts with `unverified` status cannot log in to SaaS applications via SSO.

## 3.3 Profile

1. Members can only change their own profile data.
2. Email changes require re-verification to the new email.
3. Password changes terminate all other active sessions.

---

# 4. Product and Package Rules

1. Each SaaS product is identified by a unique product code (e.g., `NTO`).
2. Each product defines its own packages independently.
3. Package prices are stored in IDR currency.
4. Free packages have no duration and will not expire.
5. Paid packages have a duration in days.
6. Super Admin can add, modify, or deactivate packages.
7. Package price changes do not affect active subscriptions.
8. Deactivated packages cannot be selected by new members, but existing subscriptions continue until completion.

---

# 5. License Rules

## 5.1 License Creation

1. A single member may only have one active license per product at a time.
2. The License-ID is created once when the product is first activated.
3. Renewals do not change the License-ID.
4. A License-ID is only regenerated if the previous license was `cancelled`.
5. License-ID must be globally unique across the entire system.

## 5.2 License Activation

1. Free package activation immediately results in an `active` license.
2. Paid package activation only occurs after a successful payment confirmation webhook is received and verified.
3. The system must not activate a paid license without valid payment confirmation.

## 5.3 License-ID Format

```
[PREFIX_PRODUK]-[XXXX]-[XXXX]-[XXXX]
```

- Prefix: 2–4 uppercase letters corresponding to the product code.
- Segment: 4 uppercase alphanumeric characters, randomly generated.
- Example: `NTO-A1B2-C3D4-E5F6`

## 5.4 License Status

- `active`: License is active.
- `grace_period`: Paid, expired, within the grace period.
- `suspended`: Grace Period ended, access blocked.
- `cancelled`: Canceled.

Status transitions:

```
active → grace_period (paid packages only, when expired_at is reached)
grace_period → active (if renewal is successful)
grace_period → suspended (if Grace Period ends)
suspended → active (if member pays again)
```

---

# 6. Payment Rules

## 6.1 Order

1. Each checkout session creates one `order` with `pending_payment` status.
2. An Order has a unique `order_id` used as a reference to the payment gateway.
3. Orders not completed within a certain time limit automatically expire.

## 6.2 Payment Confirmation via Webhook

1. The system only activates a license after receiving a successful confirmation webhook from the payment gateway.
2. The Webhook must be verified using the signature mechanism provided by the payment gateway.
3. A single `order_id` must not trigger activation more than once (idempotency).
4. Webhooks from the payment gateway that cannot be verified must be ignored and logged.

## 6.3 Payment Failure

1. Failed payments do not activate licenses.
2. Members can attempt to checkout again for a new order.

## 6.4 Transaction History

1. Each payment transaction is stored permanently.
2. Invoices are available for download by members.
3. Transaction history cannot be altered or deleted.

---

# 7. Grace Period Rules

1. Grace Period only applies to paid packages.
2. Grace Period length is configured per product (default: 7 days).
3. Grace Period begins immediately after `expired_at` is reached.
4. During Grace Period:
   - members can still access the application,
   - the system displays a warning banner on the member dashboard,
   - and the system displays a warning banner within the SaaS application (via JWT that includes `grace_period` status).
5. Email notifications are sent according to the defined schedule.
6. After the Grace Period ends, the license changes to `suspended` status.
7. Renewals during Grace Period update `expired_at` from the original expiration date.

---

# 8. SSO and Token Rules

1. JWTs are issued only for members with active accounts and licenses with `active`, `active_free`, or `grace_period` status.
2. JWTs are not issued for members with `unverified`, `suspended` status, or `cancelled` licenses.
3. JWTs have a short validity period (e.g., 1 hour).
4. Refresh Tokens have a longer validity period (e.g., 30 days).
5. JWT contains information: `sub`, `name`, `email`, `product`, `license_id`, `tier`, `license_status`, `expires_at`.
6. SaaS applications must verify JWTs using the Hub's public key.
7. SaaS applications must not trust claims in a JWT without verifying its signature.
8. When a license is `suspended`, Refresh Tokens cannot be used to generate new Access Tokens.

---

# 9. Notification Rules

1. Activation confirmation emails must be sent after a license is active.
2. Invoice emails must be sent after successful payment.
3. The schedule for expired and Grace Period reminder notifications must be followed.
4. Email delivery failures must be logged.
5. Members can manage notification preferences (enable/disable specific notification types).

---

# 10. Security Rules

1. Passwords are stored using secure hashing algorithms (bcrypt or Argon2).
2. Payment gateway API Keys must not be stored in the frontend or public repositories.
3. Payment gateway Webhooks must be verified before processing.
4. JWTs are signed using RS256 (asymmetric).
5. The JWT private key is only stored on the Hub server.
6. All communication uses HTTPS.
7. Rate limiting is applied to login and registration endpoints.
8. Sensitive data must not be written to logs in its entirety.

---

# 11. Audit Log Rules

The following activities must be logged:

- new account registration,
- successful and failed logins,
- email verification,
- license activation,
- successful payments,
- failed payments,
- Grace Period initiation,
- license suspension,
- license restoration,
- account status changes by Super Admin,
- JWT issuance,
- and sensitive administrative actions.

The audit log must minimally store:

- actor_id,
- actor_role,
- action,
- object_type,
- object_id,
- timestamp,
- ip_address,
- and result (success / failure).

---

# 12. New Product Addition Rules

When a new SaaS product joins the ecosystem:

1. The product is registered in the system with a unique product code.
2. Product packages are configured by the Super Admin.
3. `client_id` and `client_secret` OAuth2 are issued for the product.
4. The License-ID prefix format is defined (e.g., `APB` for Application B).
5. The product implements SSO integration according to the sso-auth-flow document.

---

# 13. Definition of Done

Implementation is considered complete if:

- members can register, verify email, and activate a free package in a single session,
- License-ID is generated, displayed, and sent to email,
- SSO issues JWTs that can be verified by SaaS applications,
- payments automatically activate licenses via webhook,
- Grace Period runs and notifications are sent according to schedule,
- licenses are `suspended` after Grace Period ends,
- member data is not lost even if the license is `suspended`,
- the same webhook does not trigger activation twice,
- all critical actions are recorded in the audit log,
- and all security rules are implemented.