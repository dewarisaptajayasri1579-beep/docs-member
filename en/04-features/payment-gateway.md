# Payment Gateway Integration — Central Membership & SSO Hub

## 1. Document Purpose

This document explains system integration with two supported payment gateways: **Midtrans** and **Xendit**. The document covers integration architecture, payment flow, webhook handling, and security rules.

## 2. Supported Payment Gateways

| Gateway | Main Payment Methods |
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
               Aktivasi Lisensi
```

- Membership Hub **does not store member credit card data** directly.
- All sensitive payment processes are handled by the payment gateway.
- Communication between the Hub and the payment gateway uses an **API Key** stored on the server (not on the frontend).

---

# 4. Midtrans Integration

## 4.1 Integration Method

Uses **Midtrans Snap** (hosted payment page) for ease of integration and security.

## 4.2 Midtrans Payment Flow

1.  Member selects Midtrans as the payment gateway.
2.  The Hub creates a **Snap Token** via Midtrans API:
    ```
    POST https://app.midtrans.com/snap/v1/transactions
    Authorization: Basic [BASE64_SERVER_KEY]
    Body: {
      "transaction_details": {
        "order_id": "ORDER-20260712-001",
        "gross_amount": 99000
      },
      "customer_details": {
        "first_name": "Nama",
        "email": "email@member.com"
      },
      "item_details": [{
        "id": "NTO-PRO-MONTHLY",
        "price": 99000,
        "quantity": 1,
        "name": "NOTO Pro - Bulanan"
      }]
    }
    ```
3.  The Hub receives the `snap_token` from Midtrans.
4.  The member is redirected to the Midtrans payment page using the Snap Token.
5.  The member completes the payment.
6.  Midtrans sends a notification to the Hub's **Webhook URL**.

## 4.3 Midtrans Webhook Configuration

Webhook URL:
```
POST https://hub.domain.com/webhooks/midtrans
```

The Hub verifies Midtrans notifications using:
```
signature_key = SHA512(order_id + status_code + gross_amount + server_key)
```

## 4.4 Handled Midtrans Transaction Statuses

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

Uses **Xendit Invoice** for a Xendit-hosted payment page, supporting various payment methods.

## 5.2 Xendit Payment Flow

1.  Member selects Xendit as the payment gateway.
2.  The Hub creates an **Invoice** via Xendit API:
    ```
    POST https://api.xendit.co/v2/invoices
    Authorization: Basic [BASE64_SECRET_KEY]
    Body: {
      "external_id": "ORDER-20260712-001",
      "amount": 99000,
      "description": "NOTO Pro - Bulanan",
      "invoice_duration": 86400,
      "customer": {
        "given_names": "Nama",
        "email": "email@member.com"
      },
      "currency": "IDR",
      "reminder_time": 1
    }
    ```
3.  The Hub receives the `invoice_url` from Xendit.
4.  The member is redirected to the Xendit payment page.
5.  The member completes the payment.
6.  Xendit sends a notification to the Hub's **Callback URL**.

## 5.3 Xendit Callback Configuration

Callback URL:
```
POST https://hub.domain.com/webhooks/xendit
```

The Hub verifies Xendit callbacks using the header:
```
x-callback-token: [XENDIT_CALLBACK_TOKEN]
```

## 5.4 Handled Xendit Invoice Statuses

| Xendit Status | Hub Action |
|---|---|
| `PAID` | Activate license |
| `SETTLED` | Activate license |
| `PENDING` | Wait, no action |
| `EXPIRED` | Mark order as expired |

---

# 6. Payment Gateway Security Rules

1.  **API Key & Secret Key** must not be stored on the frontend or in public repositories.
2.  All API Keys are stored as environment variables on the server.
3.  Webhooks/Callbacks can only be accessed from official payment gateway IPs (use IP whitelist if possible).
4.  Each webhook must be verified using the signature mechanism provided by the payment gateway.
5.  The same order must not be processed more than once (idempotency using `order_id`).
6.  All communication uses HTTPS.
7.  Credit card data must not pass through or be stored on the Hub server.

---

# 7. Webhook Failure Handling

If a webhook fails to be processed (e.g., Hub server is unavailable):

-   The payment gateway will automatically **retry** several times.
-   The Hub must handle retries securely using `order_id` idempotency.
-   License activation must not occur more than once even if the webhook is received repeatedly.

---

# 8. Manual Activation Flow (Fallback)

If webhook fails completely and the license is not active despite successful payment:

1.  The member contacts support with proof of transfer.
2.  The Super Admin verifies the payment in the payment gateway dashboard.
3.  The Super Admin manually activates the license via the admin panel.
4.  The action is recorded in the audit log.

---

# 9. Refunds

-   Refunds are processed via the payment gateway dashboard by the Super Admin.
-   After a refund is processed, the associated license is manually canceled.
-   Refund policies will be further defined in the business rules document.

---

# 10. Acceptance Criteria

-   Payment via Midtrans can be completed and the license activated.
-   Payment via Xendit can be completed and the license activated.
-   Webhooks are verified before processing activation.
-   The same webhook does not trigger activation twice.
-   Payment failures do not activate licenses.
-   Pending payments do not activate licenses.
-   API Keys are not exposed to the frontend or public logs.