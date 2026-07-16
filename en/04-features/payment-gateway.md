# Payment Gateway Integration — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the integration of the system with two supported payment gateways: **Midtrans** and **Xendit**. The document covers integration architecture, payment flow, webhook handling, and security rules.

## 2. Supported Payment Gateways

| Gateway | Primary Payment Method |
|---|---|
| **Midtrans** | Bank transfer (VA), GoPay, OVO, QRIS, Credit Card, Alfamart/Indomaret |
| **Xendit** | Bank transfer (VA), OVO, DANA, ShopeePay, LinkAja, QRIS, Credit Card |

Members can choose one of the payment gateways during checkout.

---

# 3. Integration Architecture

```
Member         → Membership Hub  → Payment Gateway
                      │                  │
                      │← ← ← ← ← ← ← ← │ (Webhook Callback)
                      │
                      ▼
               License Activation
```

- Membership Hub **does not store member credit card data** directly.
- All sensitive payment processes are handled by the payment gateway.
- Communication between the Hub and payment gateway uses an **API Key** stored on the server (not on the frontend).

---

# 4. Midtrans Integration

## 4.1 Integration Method

Using **Midtrans Snap** (hosted payment page) for easy integration and security.

## 4.2 Midtrans Payment Flow

1. Member selects Midtrans as the payment gateway.
2. Hub creates a **Snap Token** via Midtrans API:
   ```
   POST https://app.midtrans.com/snap/v1/transactions
   Authorization: Basic [BASE64_SERVER_KEY]
   Body: {
     "transaction_details": {
       "order_id": "ORDER-20260712-001",
       "gross_amount": 99000
     },
     "customer_details": {
       "first_name": "Name",
       "email": "email@member.com"
     },
     "item_details": [{
       "id": "NTO-PRO-MONTHLY",
       "price": 99000,
       "quantity": 1,
       "name": "NOTO Pro - Monthly"
     }]
   }
   ```
3. Hub receives the `snap_token` from Midtrans.
4. Member is directed to the Midtrans payment page using the Snap Token.
5. Member completes the payment.
6. Midtrans sends a notification to the **Webhook URL** of the Hub.

## 4.3 Midtrans Webhook Configuration

Webhook URL:
```
POST https://hub.domain.com/webhooks/midtrans
```

Hub verifies the Midtrans notification using:
```
signature_key = SHA512(order_id + status_code + gross_amount + server_key)
```

## 4.4 Handled Midtrans Transaction Status

| Midtrans Status | Hub Action |
|---|---|
| `settlement` | Activate license |
| `capture` (credit card) | Activate license |
| `pending` | Wait, no action |
| `deny` | Mark order as failed, notify member |
| `cancel` | Mark order as canceled |
| `expire` | Mark order as expired |
| `refund` | Process refund (if policy allows) |

---

# 5. Xendit Integration

## 5.1 Integration Method

Using **Xendit Invoice** for a hosted payment page, supporting various payment methods.

## 5.2 Xendit Payment Flow

1. Member selects Xendit as the payment gateway.
2. Hub creates an **Invoice** via Xendit API:
   ```
   POST https://api.xendit.co/v2/invoices
   Authorization: Basic [BASE64_SECRET_KEY]
   Body: {
     "external_id": "ORDER-20260712-001",
     "amount": 99000,
     "description": "NOTO Pro - Monthly",
     "invoice_duration": 86400,
     "customer": {
       "given_names": "Name",
       "email": "email@member.com"
     },
     "currency": "IDR",
     "reminder_time": 1
   }
   ```
3. Hub receives the `invoice_url` from Xendit.
4. Member is directed to the Xendit payment page.
5. Member completes the payment.
6. Xendit sends a notification to the **Callback URL** of the Hub.

## 5.3 Xendit Callback Configuration

Callback URL:
```
POST https://hub.domain.com/webhooks/xendit
```

Hub verifies the Xendit callback using the header:
```
x-callback-token: [XENDIT_CALLBACK_TOKEN]
```

## 5.4 Handled Xendit Invoice Status

| Xendit Status | Hub Action |
|---|---|
| `PAID` | Activate license |
| `SETTLED` | Activate license |
| `PENDING` | Wait, no action |
| `EXPIRED` | Mark order as expired |

---

# 6. Payment Gateway Security Rules

1. **API Key & Secret Key** must not be stored in the frontend or public repository.
2. All API Keys are stored as environment variables on the server.
3. Webhooks/Callbacks can only be accessed from the official payment gateway IP (use IP whitelist if possible).
4. Each webhook must be verified using the payment gateway's provided signature mechanism.
5. The same order must not be processed more than once (idempotency using `order_id`).
6. All communication uses HTTPS.
7. Credit card data must not pass through or be stored on the Hub server.

---

# 7. Webhook Failure Handling

If a webhook fails to process (e.g., Hub server is unavailable):

- The payment gateway will **retry** several times automatically.
- The Hub must handle retries securely using idempotency `order_id`.
- License activation must not occur more than once even if the webhook is received repeatedly.

---

# 8. Manual Activation Flow (Fallback)

If the webhook fails completely and the license is not activated despite successful payment:

1. Member contacts support with transfer proof.
2. Super Admin verifies the payment on the payment gateway dashboard.
3. Super Admin activates the license manually through the admin panel.
4. The action is recorded in the audit log.

---

# 9. Refund Processing

- Refunds are processed through the payment gateway dashboard by the Super Admin.
- After the refund is processed, the related license is canceled manually.
- The refund policy will be defined further in the business rules document.

---

# 10. Acceptance Criteria

- Payment through Midtrans can be completed and the license is activated.
- Payment through Xendit can be completed and the license is activated.
- Webhooks are verified before processing activation.
- The same webhook does not trigger activation twice.
- Failed payments do not activate the license.
- Pending payments do not activate the license.
- API Keys are not exposed to the frontend or public log.