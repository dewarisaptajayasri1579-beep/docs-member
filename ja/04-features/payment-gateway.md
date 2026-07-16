# 支払いゲートウェイ統合 — 中央会員管理システム & SSO ヒブ

## 1. ドキュメントの目的

このドキュメントは、2 つの支払いゲートウェイをサポートするシステムの統合を説明します:**Midtrans** と **Xendit**。ドキュメントには、統合アーキテクチャ、支払いフロー、ウェブフックの処理、セキュリティ規則が含まれます。

## 2. サポートされる支払いゲートウェイ

| ゲートウェイ | 主な支払い方法 |
|---|---|
| **Midtrans** | 伝票 (VA)、GoPay、OVO、QRIS、クレジットカード、Alfamart/Indomaret |
| **Xendit** | 伝票 (VA)、OVO、DANA、ShopeePay、LinkAja、QRIS、クレジットカード |

会員はチェックアウト時に支払いゲートウェイを選択できます。

---

# 3. 統合アーキテクチャ

```
会員         → 会員管理システム  → 支払いゲートウェイ
                      │                  │
                      │← ← ← ← ← ← ← ← │ (ウェブフックコールバック)
                      │
                      ▼
               ライセンスの有効化
```

- 会員管理システムは直接クレジットカードのデータを保存しません。
- 支払いプロセスはすべて支払いゲートウェイによって処理されます。
- 会員管理システムと支払いゲートウェイの間の通信は、サーバーに保存されている **API Key** を使用して行われます。

---

# 4. Midtrans 統合

## 4.1 統合方法

**Midtrans Snap** (ホストされた支払いページ) を使用して、統合を容易にしセキュリティを高めます。

## 4.2 Midtrans 支払いフロー

1. 会員は Midtrans を支払いゲートウェイとして選択します。
2. 会員管理システムは Midtrans API を使用して **Snap Token** を作成します:
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
3. 会員管理システムは `snap_token` を取得します。
4. 会員は Midtrans の支払いページにリダイレクトされます。
5. 会員は支払いを完了します。
6. Midtrans は **Webhook URL** に通知を送信します。

## 4.3 Midtrans Webhook の設定

Webhook URL:
```
POST https://hub.domain.com/webhooks/midtrans
```

会員管理システムは Midtrans の通知を検証するために使用します:
```
signature_key = SHA512(order_id + status_code + gross_amount + server_key)
```

## 4.4 Midtrans の処理可能なトランザクション ステータス

| Midtrans ステータス | 会員管理システムの処理 |
|---|---|
| `settlement` | ライセンスを有効化 |
| `capture` (クレジットカード) | ライセンスを有効化 |
| `pending` | 待機、処理なし |
| `deny` | オーダーを失敗とし、会員に通知 |
| `cancel` | オーダーをキャンセル |
| `expire` | オーダーが期限切れ |
| `refund` | 退款処理 (許可されたポリシーに従う) |

---

# 5. Xendit 統合

## 5.1 統合方法

**Xendit Invoice** を使用して、ホストされた支払いページをサポートし、多くの支払い方法をサポートします。

## 5.2 Xendit 支払いフロー

1. 会員は Xendit を支払いゲートウェイとして選択します。
2. 会員管理システムは Xendit API を使用して **Invoice** を作成します:
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
3. 会員管理システムは `invoice_url` を取得します。
4. 会員は Xendit の支払いページにリダイレクトされます。
5. 会員は支払いを完了します。
6. Xendit は **Callback URL** に通知を送信します。

## 5.3 Xendit の Callback 設定

Callback URL:
```
POST https://hub.domain.com/webhooks/xendit
```

会員管理システムは Xendit の Callback を検証するために使用します:
```
x-callback-token: [XENDIT_CALLBACK_TOKEN]
```

## 5.4 Xendit の処理可能なインボイス ステータス

| Xendit ステータス | 会員管理システムの処理 |
|---|---|
| `PAID` | ライセンスを有効化 |
| `SETTLED` | ライセンスを有効化 |
| `PENDING` | 待機、処理なし |
| `EXPIRED` | オーダーが期限切れ |

---

# 6. 支払いゲートウェイのセキュリティ規則

1. **API Key & Secret Key** はフロントエンドまたはパブリック リポジトリに保存してはなりません。
2. すべての API Key はサーバーに保存されている環境変数として保存されます。
3. Webhook/Callback は支払いゲートウェイの公式 IP からのみアクセスできます (IP ホワイトリストを使用することを推奨します)。
4. すべての Webhook は支払いゲートウェイが提供する署名メカニズムを使用して検証する必要があります。
5. 同じオーダーは複数回処理してはなりません (idempotency を使用して `order_id` を使用します)。
6. すべての通信は HTTPS を使用します。
7. クレジットカードのデータはサーバー上で保存してはなりません。

---

# 7. Webhook の失敗処理

Webhook が処理できなかった場合 (例: 会員管理システムがサーバーでない場合):

- 支払いゲートウェイは自動的に複数回リトライします。
- 会員管理システムはリトライを安全に処理するために idempotency `order_id` を使用する必要があります。
- ライセンスの有効化は複数回実行してはなりません。

---

# 8. 手動ライセンス有効化 (フォールバック)

Webhook が失敗し、ライセンスが有効になっていない場合 (支払いが成功している場合):

1. 会員はサポートに連絡し、トランザクションの証拠を提示します。
2. スーパーアドミンは支払いゲートウェイのダッシュボードでオーダーを確認します。
3. スーパーアドミンは手動でライセンスを有効化します。
4. 処理はアクセス ログに記録されます。

---

# 9. 収入の返金 (Refund)

- 収入は支払いゲートウェイのダッシュボードでスーパーアドミンによって処理されます。
- 収入が処理された後、関連するライセンスは手動でキャンセルされます。
- 収入ポリシーはビジネス規則ドキュメントで詳細に説明されています。

---

# 10. 受容基準

- Midtrans を使用した支払いが完了し、ライセンスが有効になります。
- Xendit を使用した支払いが完了し、ライセンスが有効になります。
- Webhook は処理される前に検証されます。
- 同じ Webhook は複数回処理してはなりません