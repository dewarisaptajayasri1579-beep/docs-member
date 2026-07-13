# Checkout and Payment Flow — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the complete flow from member registration to active license, covering both free activation and paid checkout processes.

## 2. Actors

- Member
- System
- Payment Gateway (Midtrans / Xendit)

---

# 3. New Member Registration Flow

1.  Member opens the Membership Hub registration page.
2.  Member fills in:
    -   full name,
    -   email,
    -   password,
    -   password confirmation.
3.  System validates:
    -   email format,
    -   email uniqueness (lowercase, trimmed),
    -   password strength.
4.  System creates an account with `unverified` status.
5.  System sends a verification email.
6.  Member opens the email and clicks the verification link.
7.  System changes account status to `active`.
8.  Member is redirected to the dashboard.

---

# 4. Product Selection and Activation Flow

## 4.1 Viewing Product Catalog

1.  Member opens the product catalog page.
2.  System displays a list of available SaaS products.
3.  Member selects a product (e.g., NOTO).
4.  System displays a list of packages for that product.

## 4.2 Free Package Activation

1.  Member selects the **Free** package.
2.  System validates:
    -   member account is active,
    -   does not yet have an active license for the same product.
3.  System creates a new license with:
    -   status: `active_free`,
    -   tier: `free`,
    -   expired_at: `null` (does not expire).
4.  System generates a License-ID with the format:
    ```
    [PREFIX_PRODUK]-[XXXX]-[XXXX]-[XXXX]
    ```
    Example: `NTO-A1B2-C3D4-E5F6`
5.  System displays the License-ID on the dashboard.
6.  System sends a confirmation email containing the License-ID.
7.  Member can directly access the product via SSO.

## 4.3 Paid Package Checkout

1.  Member selects a paid package (e.g., Monthly Pro).
2.  System displays an order summary:
    -   product name,
    -   package name,
    -   price,
    -   duration,
    -   and payment gateway options (Midtrans / Xendit).
3.  Member selects a payment gateway.
4.  System creates an **order** with `pending_payment` status.
5.  System contacts the payment gateway to create a payment session.
6.  Member is redirected to the payment gateway's payment page.
7.  Member completes the payment.

---

# 5. Post-Payment Flow

## 5.1 Successful Payment

1.  Payment gateway sends a Webhook to the System.
2.  System verifies the Webhook (signature and amount).
3.  System changes the order status to `paid`.
4.  System creates or updates the license:
    -   status: `active`,
    -   tier: according to the purchased package,
    -   started_at: payment time,
    -   expired_at: started_at + package duration.
5.  System generates a License-ID if one does not already exist.
6.  System records the payment transaction.
7.  System sends an email containing:
    -   payment confirmation,
    -   invoice,
    -   License-ID,
    -   and a link to log in to the product.
8.  The license appears on the member's dashboard.

## 5.2 Failed or Expired Payment

1.  Payment gateway sends a failure Webhook or no response within the time limit.
2.  System changes the order status to `failed` or `expired`.
3.  License is not activated.
4.  System sends a notification to the member.
5.  Member can try checking out again.

---

# 6. Subscription Renewal Flow

## 6.1 Renewal Before Expired

1.  Member opens license details on the dashboard.
2.  Member selects **Perpanjang** (Renew).
3.  The flow follows the Paid Package Checkout process (Section 4.3).
4.  After successful payment, `expired_at` is updated:
    ```
    expired_at_baru = expired_at_lama + durasi_paket
    ```
    (or from the payment date if the limit has passed).

## 6.2 Renewal During Grace Period

1.  License status is `grace_period`.
2.  Member receives urgent notifications on the dashboard and via email.
3.  Member can renew by following the checkout flow.
4.  After successful payment, the license is reactivated.

---

# 7. Grace Period and Suspend Flow

```
Active license
    │
    ▼ (expired_at reached)
Grace Period begins
    │── Email notification D+0
    │── Email notification D+3
    │── Email notification D+6
    │
    ▼ (Grace Period ends, no renewal)
License suspended (Suspended)
    │── Suspend notification email
    │── Access to product blocked
    │── Data remains secure
    │
    ▼ (if member pays after suspend)
License reactivated
```

The length of the Grace Period is determined by system configuration (default: 7 days).

---

# 8. License Duplication Rules

-   One member can only have **one active license** per product at a time.
-   If a member already has an active license for a product, a new purchase will extend the existing license.
-   Members cannot have two active licenses for the same product simultaneously.

---

# 9. Payment Idempotency

-   Each order has a unique `order_id`.
-   Webhooks from the same payment gateway should not trigger license activation more than once.
-   System checks order status before processing the Webhook.

---

# 10. Acceptance Criteria

-   Members can activate free packages without payment.
-   License-ID is generated and displayed after activation.
-   Confirmation email is sent after activation.
-   Successful payment automatically activates the license.
-   Payment gateway Webhook failure does not activate the license.
-   Grace Period runs according to configuration.
-   License is suspended after the Grace Period ends.
-   Renewal correctly updates the active period.
-   No duplication of active licenses for the same product.