# Billing Plans — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the subscription plan structure for each SaaS product within the ecosystem, plan management rules, and product-specific terms.

## 2. Plan Principles

1.  Each SaaS product defines its own plans independently.
2.  A member can subscribe to different plans for different products.
3.  Free Plans do not require payment and have no expiration date.
4.  Paid Plans have a duration (monthly or annually) and will expire if not renewed.
5.  Prices and features per plan are managed by the Super Admin.

---

# 3. Product: NOTO

## 3.1 Plan Status

NOTO currently offers one plan:

| Plan | Price | Duration | Status |
|---|---|---|---|
| Free Forever | Rp0 | Unlimited | Active |

## 3.2 NOTO Free Forever Plan Terms

-   No expiration date.
-   Full access to all NOTO features (Early Access).
-   No quota limits (number of financial accounts, financial posts, transactions).
-   Available from the first day of registration.

> **Note**: Feature or quota limitations will be defined in a separate NOTO document when NOTO paid plans are introduced in the future.

---

# 4. Plan Structure for Paid Products (Template)

When new paid products are added to the ecosystem, their plans follow the structure below.

## 4.1 Standard Plan Types

| Plan | Purpose |
|---|---|
| Free / Trial | New users who want to try |
| Starter | Individual users or basic needs |
| Pro | Active users with moderate needs |
| Business | Small teams or advanced needs |

## 4.2 Billing Cycle

| Cycle | Description |
|---|---|
| Monthly | Billed monthly |
| Annually | Billed annually (usually more cost-effective) |

## 4.3 Example Plan Data Structure

```json
{
  "product_code": "APP",
  "plan_name": "Pro",
  "billing_cycle": "monthly",
  "price": 99000,
  "currency": "IDR",
  "duration_days": 30,
  "features": [
    "Fitur A",
    "Fitur B",
    "Fitur C"
  ],
  "is_active": true
}
```

---

# 5. License Comparison by Status

| License Status | Application Access | Description |
|---|---|---|
| `active` | Yes, full | License is active and has not expired |
| `grace_period` | Yes, with warning | License expired, in Grace Period |
| `suspended` | No | Grace Period ended, access blocked |
| `cancelled` | No | License cancelled by member or admin |
| `free` | Yes, full | Forever free plan (like NOTO) |

---

# 6. Grace Period

## 6.1 Grace Period Terms

-   Grace Period applies only to **paid** plans.
-   **Free** plans do not have a Grace Period because there is no expiration date.
-   Grace Period length is determined per product in the system configuration.
-   Default Grace Period: **7 days**.

## 6.2 Grace Period Notification Schedule

| Time | Notification |
|---|---|
| D-7 before expiration | Email: Your subscription will expire soon |
| D-3 before expiration | Email: Renew your subscription immediately |
| D-1 before expiration | Email: Subscription expires tomorrow |
| D+0 (Grace Period begins) | Email: Subscription expired, 7 days remaining to renew |
| D+3 (Grace Period ongoing) | Email: 4 days remaining before access is blocked |
| D+6 (Grace Period almost over) | Email: Access will be blocked tomorrow |
| D+7 (Grace Period ends) | Email: Access has been blocked |

## 6.3 Renewal During Grace Period

-   Members can renew anytime during the Grace Period.
-   After successful renewal, `expired_at` is calculated from the original expiration date:
    ```
    expired_at_baru = expired_at_lama + durasi_paket
    ```

---

# 7. Plan Updates (Upgrade / Downgrade)

-   **Upgrade**: Members can move to a higher plan at any time. Remaining active period is calculated proportionally.
-   **Downgrade**: Members can move to a lower plan at the end of the active billing cycle.

> Prorated upgrade/downgrade calculation rules will be further defined in the business rules document.

---

# 8. Acceptance Criteria Billing Plans

-   NOTO Free Plan can be activated without payment.
-   Paid plans are only active after payment is confirmed.
-   Grace Period runs according to configuration.
-   Email notifications are sent according to schedule.
-   License is suspended immediately after Grace Period ends.
-   Member data is not deleted even if the license is suspended.