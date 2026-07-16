# Billing Plans — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the structure of subscription plans (plans) for each SaaS product in the ecosystem, plan management rules, and special terms per product.

## 2. Plan Principles

1. Each SaaS product defines its own plan independently.
2. One member can subscribe to different plans for different products.
3. The **Free / Gratis** plan does not require payment and has no expiration date.
4. The **Paid** plan has a duration (monthly or yearly) and will expire if not renewed.
5. Prices and features per plan are managed by the Super Admin.

---

# 3. Product: NOTO

## 3.1 Plan Status

NOTO currently offers one plan:

| Plan | Price | Duration | Status |
|---|---|---|---|
| Free Forever | IDR 0 | Unlimited | Active |

## 3.2 NOTO Free Forever Plan Terms

- No expiration date.
- Full access to all NOTO features (Early Access).
- No quota limits (number of financial accounts, financial posts, transactions).
- Available since the first day of registration.

> **Note**: Feature or quota limits will be defined in a separate NOTO document when the paid NOTO plan is introduced in the future.

---

# 4. Subscription Plan Structure for Paid Products (Template)

When a new paid product is added to the ecosystem, their plans follow the following structure.

## 4.1 Standard Plan Types

| Plan | Purpose |
|---|---|
| Free / Trial | New users who want to try |
| Starter | Individual users or basic needs |
| Pro | Active users with medium needs |
| Business | Small teams or extended needs |

## 4.2 Billing Cycle

| Cycle | Description |
|---|---|
| Monthly | Billed every month |
| Yearly | Billed every year (usually more cost-effective) |

## 4.3 Example Subscription Plan Data Structure

```json
{
  "product_code": "APP",
  "plan_name": "Pro",
  "billing_cycle": "monthly",
  "price": 99000,
  "currency": "IDR",
  "duration_days": 30,
  "features": [
    "Feature A",
    "Feature B",
    "Feature C"
  ],
  "is_active": true
}
```

---

# 5. License Comparison Based on Status

| License Status | Application Access | Description |
|---|---|---|
| `active` | Yes, full | Active license and not expired |
| `grace_period` | Yes, with warning | Expired license, in grace period |
| `suspended` | No | Grace period ended, access blocked |
| `cancelled` | No | License cancelled by member or admin |
| `free` | Yes, full | Free plan forever (like NOTO) |

---

# 6. Grace Period

## 6.1 Grace Period Terms

- The Grace Period only applies to **paid** plans.
- The **Free** plan has no Grace Period because it has no expiration date.
- The length of the Grace Period is determined per product in system configuration.
- Default Grace Period: **7 days**.

## 6.2 Grace Period Notification Schedule

| Time | Notification |
|---|---|
| 7 days before expired | Email: Your subscription will soon expire |
| 3 days before expired | Email: Renew your subscription soon |
| 1 day before expired | Email: Your subscription will expire tomorrow |
| H+0 (Grace Period starts) | Email: Your subscription has expired, still 7 days to renew |
| H+3 (Grace Period is running) | Email: 4 days left before access is blocked |
| H+6 (Grace Period is almost over) | Email: Access will be blocked tomorrow |
| H+7 (Grace Period ends) | Email: Access has been blocked |

## 6.3 Renewal During Grace Period

- Members can renew at any time during the Grace Period.
- After successful renewal, `expired_at` is calculated from the original expiration date:
  ```
  expired_at_baru = expired_at_lama + duration_paket
  ```

---

# 7. Plan Updates (Upgrade / Downgrade)

- **Upgrade**: Members can move to a higher plan at any time. Remaining active time is calculated proportionally.
- **Downgrade**: Members can move to a lower plan at the end of the active billing cycle.

> Business rules for prorated upgrade/downgrade calculations will be defined further in the business rules document.

---

# 8. Acceptance Criteria for Billing Plans

- The NOTO Free plan can be activated without payment.
- Paid plans are only active after payment confirmation.
- The Grace Period runs according to configuration.
- Notification emails are sent according to schedule.
- Licenses are suspended precisely after the Grace Period ends.
- Member data is not deleted even if the license is suspended.