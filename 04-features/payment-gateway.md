# Payment Gateway Integration — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan integrasi sistem dengan dua payment gateway yang didukung: **Midtrans** dan **Xendit**. Dokumen mencakup arsitektur integrasi, alur pembayaran, penanganan webhook, dan aturan keamanan.

## 2. Payment Gateway yang Didukung

| Gateway | Metode Pembayaran Utama |
|---|---|
| **Midtrans** | Transfer bank (VA), GoPay, OVO, QRIS, Kartu Kredit, Alfamart/Indomaret |
| **Xendit** | Transfer bank (VA), OVO, DANA, ShopeePay, LinkAja, QRIS, Kartu Kredit |

Member dapat memilih salah satu payment gateway pada saat checkout.

---

# 3. Arsitektur Integrasi

```
Member         → Membership Hub  → Payment Gateway
                      │                  │
                      │← ← ← ← ← ← ← ← │ (Webhook Callback)
                      │
                      ▼
               Aktivasi Lisensi
```

- Membership Hub **tidak menyimpan data kartu kredit** member secara langsung.
- Seluruh proses pembayaran sensitif ditangani oleh payment gateway.
- Komunikasi antara Hub dan payment gateway menggunakan **API Key** yang tersimpan di server (bukan di frontend).

---

# 4. Integrasi Midtrans

## 4.1 Metode Integrasi

Menggunakan **Midtrans Snap** (hosted payment page) untuk kemudahan integrasi dan keamanan.

## 4.2 Alur Pembayaran Midtrans

1. Member memilih Midtrans sebagai payment gateway.
2. Hub membuat **Snap Token** melalui Midtrans API:
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
3. Hub menerima `snap_token` dari Midtrans.
4. Member diarahkan ke halaman pembayaran Midtrans menggunakan Snap Token.
5. Member menyelesaikan pembayaran.
6. Midtrans mengirim notifikasi ke **Webhook URL** Hub.

## 4.3 Konfigurasi Webhook Midtrans

URL Webhook:
```
POST https://hub.domain.com/webhooks/midtrans
```

Hub memverifikasi notifikasi Midtrans menggunakan:
```
signature_key = SHA512(order_id + status_code + gross_amount + server_key)
```

## 4.4 Status Transaksi Midtrans yang Ditangani

| Status Midtrans | Tindakan Hub |
|---|---|
| `settlement` | Aktifkan lisensi |
| `capture` (kartu kredit) | Aktifkan lisensi |
| `pending` | Tunggu, tidak ada tindakan |
| `deny` | Tandai order gagal, notifikasi member |
| `cancel` | Tandai order dibatalkan |
| `expire` | Tandai order kedaluwarsa |
| `refund` | Proses refund (jika kebijakan memperbolehkan) |

---

# 5. Integrasi Xendit

## 5.1 Metode Integrasi

Menggunakan **Xendit Invoice** untuk halaman pembayaran yang di-host Xendit, mendukung berbagai metode pembayaran.

## 5.2 Alur Pembayaran Xendit

1. Member memilih Xendit sebagai payment gateway.
2. Hub membuat **Invoice** melalui Xendit API:
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
3. Hub menerima `invoice_url` dari Xendit.
4. Member diarahkan ke halaman pembayaran Xendit.
5. Member menyelesaikan pembayaran.
6. Xendit mengirim notifikasi ke **Callback URL** Hub.

## 5.3 Konfigurasi Callback Xendit

URL Callback:
```
POST https://hub.domain.com/webhooks/xendit
```

Hub memverifikasi callback Xendit menggunakan header:
```
x-callback-token: [XENDIT_CALLBACK_TOKEN]
```

## 5.4 Status Invoice Xendit yang Ditangani

| Status Xendit | Tindakan Hub |
|---|---|
| `PAID` | Aktifkan lisensi |
| `SETTLED` | Aktifkan lisensi |
| `PENDING` | Tunggu, tidak ada tindakan |
| `EXPIRED` | Tandai order kedaluwarsa |

---

# 6. Aturan Keamanan Payment Gateway

1. **API Key & Secret Key** tidak boleh disimpan di frontend atau repository publik.
2. Semua API Key tersimpan sebagai environment variable di server.
3. Webhook/Callback hanya dapat diakses dari IP resmi payment gateway (gunakan IP whitelist jika memungkinkan).
4. Setiap webhook harus diverifikasi menggunakan mekanisme signature yang disediakan payment gateway.
5. Order yang sama tidak boleh diproses lebih dari satu kali (idempotency menggunakan `order_id`).
6. Seluruh komunikasi menggunakan HTTPS.
7. Data kartu kredit tidak boleh melintas atau disimpan di server Hub.

---

# 7. Penanganan Kegagalan Webhook

Jika webhook gagal diproses (misal: server Hub tidak tersedia):

- Payment gateway akan melakukan **retry** secara otomatis beberapa kali.
- Hub harus menangani retry dengan aman menggunakan idempotency `order_id`.
- Aktivasi lisensi tidak boleh terjadi lebih dari satu kali meskipun webhook diterima berulang.

---

# 8. Alur Manual Aktivasi (Fallback)

Jika webhook gagal total dan lisensi tidak aktif meski pembayaran berhasil:

1. Member menghubungi dukungan dengan bukti transfer.
2. Super Admin memverifikasi pembayaran di dashboard payment gateway.
3. Super Admin mengaktifkan lisensi secara manual melalui panel admin.
4. Tindakan dicatat pada audit log.

---

# 9. Pengembalian Dana (Refund)

- Refund diproses melalui dashboard payment gateway oleh Super Admin.
- Setelah refund diproses, lisensi terkait dibatalkan secara manual.
- Kebijakan refund akan didefinisikan lebih lanjut di dokumen aturan bisnis.

---

# 10. Acceptance Criteria

- Pembayaran melalui Midtrans dapat diselesaikan dan lisensi aktif.
- Pembayaran melalui Xendit dapat diselesaikan dan lisensi aktif.
- Webhook diverifikasi sebelum memproses aktivasi.
- Webhook yang sama tidak memicu aktivasi dua kali.
- Kegagalan pembayaran tidak mengaktifkan lisensi.
- Pembayaran pending tidak mengaktifkan lisensi.
- API Key tidak terekspos ke frontend atau log publik.
