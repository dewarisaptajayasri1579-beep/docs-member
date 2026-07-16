# Checkout and Payment Flow — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the complete flow from member registration to active license, including the free activation process and paid checkout process.

## 2. Actors

- Member
- System
- Payment Gateway (Midtrans / Xendit)

---

# 3. New Member Registration Flow

1. The member opens the Membership Hub registration page.
2. The member fills in:
   - full name,
   - email,
   - password,
   - password confirmation.
3. The system validates:
   - email format,
   - email uniqueness (lowercase, trimmed),
   - password strength.
4. The system creates an account with a status of `unverified`.
5. The system sends a verification email.
6. The member opens the email and clicks the verification link.
7. The system changes the account status to `active`.
8. The member is redirected to the dashboard.

---

# 4. Product Selection and Activation Flow

## 4.1 Viewing Product Catalog

1. The member opens the product catalog page.
2. The system displays a list of available SaaS products.
3. The member selects a product (e.g., NOTO).
4. The system displays a list of product packages.

## 4.2 Activating a Free Package

1. The member selects the **Free** package.
2. The system validates:
   - active member account,
   - no active license for the same product.
3. The system creates a new license with:
   - status: `active_free`,
   - tier: `free`,
   - expired_at: `null` (no expiration).
4. The system generates a License-ID with the format:
   ```
   [PREFIX_PRODUK]-[XXXX]-[XXXX]-[XXXX]
   ```
   Example: `NTO-A1B2-C3D4-E5F6`
5. The system displays the License-ID on the dashboard.
6. The system sends a confirmation email containing the License-ID.
7. The member can immediately access the product through SSO.

## 4.3 Paid Package Checkout

1. The member selects a paid package (e.g., Pro Monthly).
2. The system displays an order summary:
   - product name,
   - package name,
   - price,
   - duration,
   - and payment gateway options (Midtrans / Xendit).
3. The member selects a payment gateway.
4. The system creates an **order** with a status of `pending_payment`.
5. The system contacts the payment gateway to create a payment session.
6. The member is redirected to the payment gateway's payment page.
7. The member completes the payment.

---

# 5. Payment Flow

## 5.1 Successful Payment

1. The payment gateway sends a webhook to the System.
2. The System verifies the webhook (signature and amount).
3. The System changes the order status to `paid`.
4. The System creates or updates a license:
   - status: `active`,
   - tier: matching the purchased package,
   - started_at: payment time,
   - expired_at: started_at + package duration.
5. The System generates a License-ID if not already generated.
6. The System records the payment transaction.
7. The System sends an email containing:
   - payment confirmation,
   - invoice,
   - License-ID,
   - and a link to access the product.
8. The license is displayed on the member's dashboard.

## 5.2 Failed or Expired Payment

1. The payment gateway sends a webhook failure or no response within the time limit.
2. The System changes the order status to `failed` or `expired`.
3. The license is not activated.
4. The System sends a notification to the member.
5. The member can attempt checkout again.

---

# 6. Subscription Renewal Flow

## 6.1 Renewal Before Expiration

1. The member opens the license details on the dashboard.
2. The member selects **Renew**.
3. The flow follows the Paid Package Checkout process (Section 4.3).
4. After successful payment, `expired_at` is updated:
   ```
   expired_at_baru = expired_at_lama + durasi_paket
   ```
   (or from the payment date if already past due).

## 6.2 Renewal During Grace Period

1. The license is in the `grace_period` status.
2. The member receives an urgent notification on the dashboard and email.
3. The member can renew by following the checkout process.
4. After successful payment, the license is reactivated.

---

# 7. Grace Period and Suspension Flow

```
Active License
    │
    ▼ (expired_at reached)
Grace Period starts
    │── Urgent email notification H+0
    │── Urgent email notification H+3
    │── Urgent email notification H+6
    │
    ▼ (Grace Period ends, no renewal)
License suspended (Suspended)
    │── Suspend email notification
    │── Product access blocked
    │── Data remains safe
    │
    ▼ (if member pays after suspend)
License reactivated
```

The Grace Period duration is determined by system configuration (default: 7 days).

---

# 8. Duplicate License Rule

- A member can only have **one active license** per product at a time.
- If a member already has an active license for a product, a new purchase will extend the existing license.
- A member cannot have two active licenses for the same product simultaneously.

---

# 9. Idempotency Payment

- Each order has a unique `order_id`.
- Webhooks from the same payment gateway should not trigger license activation more than once.
- The System checks the order status before processing the webhook.

---

# 10. Acceptance Criteria

- The member can activate a free package without payment.
- A License-ID is generated and displayed after activation.
- A confirmation email is sent after activation.
- Successful payment automatically activates the license.
- Failed or expired payment does not activate the license.
- The Grace Period runs according to configuration.
- The license is suspended after the Grace Period ends.
- Renewal updates the active period correctly.
- There are no duplicate active licenses for the same product.