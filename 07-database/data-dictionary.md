# Data Dictionary

## Domain / enum

| Domain | Nilai | Arti |
|---|---|---|
| `member_status` | `unverified`, `active`, `suspended`, `deleted` | Lifecycle akun; `deleted` adalah soft delete. |
| `member_role` | `member`, `super_admin` | Otorisasi tingkat aplikasi. |
| `plan_type` | `free`, `trial`, `paid` | Model komersial paket. |
| `license_status` | `active`, `active_free`, `grace_period`, `suspended`, `cancelled` | Status lisensi dan claim JWT. |
| `order_status` | `pending_payment`, `paid`, `failed`, `expired`, `cancelled`, `duplicate` | Status sesi checkout. |
| `payment_status` | `pending`, `settlement`, `failed`, `expired`, `cancelled`, `refunded` | Status canonical pembayaran. |
| `payment_gateway` | `midtrans`, `xendit` | Gateway pada versi awal. |

## Definisi data lintas tabel

| Elemen | Tipe/format | Definisi dan aturan |
|---|---|---|
| `id` | UUID v4 | Identifier internal. |
| `created_at`, `updated_at` | UTC `timestamptz` | `updated_at` berubah saat entitas dimutasi. |
| `email` | maks. 320 karakter | Ditim/lowercase sebelum penyimpanan; unik global. |
| `*_hash` | string hash | Hash satu arah; nilai asli tidak disimpan atau dilog. |
| `amount` / `price_amount` | `bigint` | Unit minor sesuai `currency`; tidak memakai floating point. |
| `currency` | ISO 4217, 3 karakter | Default saat ini `IDR`. |
| `metadata`, `payload`, `features` | `jsonb` | Data fleksibel yang tetap divalidasi aplikasi; tanpa secret. |
| `expires_at` | UTC `timestamptz` | Batas token, order, atau akses; null hanya untuk konsep tanpa expiry. |

## Definisi entitas

| Entitas | Identitas bisnis | Data penting | Retensi / catatan |
|---|---|---|---|
| Member | `members.email` | Nama, password hash, status, role. | Soft-delete agar jejak transaksi/audit tetap ada. |
| Product | `products.code` | Nama, redirect SSO, status aktif, grace period. | Nonaktifkan, jangan hapus bila punya lisensi. |
| Plan | `product_id + code` | Harga, durasi, interval, tipe, fitur. | Harga dapat berubah; order menyimpan snapshot. |
| License | `licenses.license_key` | Pemilik, produk, tier, status, masa aktif. | ID tidak berubah saat renew; baru dibuat ulang setelah `cancelled`. |
| Order | `orders.order_number` | Member, plan, nominal, gateway, expiry. | Nilai komersial setelah dibuat tidak dimutasi. |
| Payment | `gateway + gateway_transaction_id` | Order, status gateway, nominal, waktu bayar. | Response mentah disanitasi dari data sensitif. |
| Webhook Event | `gateway + external_event_id` | Payload, validasi signature, waktu proses. | Bukti idempotensi dan troubleshooting. |
| OAuth Client | `oauth_clients.client_id` | Redirect URI, scope, secret hash. | Secret ditampilkan sekali saat pendaftaran client. |
| Authorization Code | `code_hash` | Member, client, produk/lisensi, PKCE, expiry. | Sekali pakai dan berumur sangat singkat. |
| Refresh Token | `token_hash` | Client, member, lisensi, scope, revoke/rotation. | Direvoke saat logout, insiden, atau lisensi suspended. |
| JWT Signing Key | `kid` | Public JWK, RS256, lifecycle key. | Private key hanya direferensikan ke secret manager. |
| Audit Log | `id` | Aktor, aksi, objek, hasil, IP, metadata aman. | Append-only; tidak diedit oleh aplikasi biasa. |

## Aturan kualitas dan keamanan data

1. Foreign key memakai `RESTRICT` untuk data keuangan/audit dan `CASCADE` hanya untuk
   token sementara yang tidak bermakna tanpa pemiliknya.
2. Webhook dengan signature invalid tidak boleh mengubah `orders`, `payments`, atau
   `licenses`; event tetap dicatat.
3. Settlement mengubah `payments`, `orders`, `licenses`, dan `audit_logs` dalam satu
   transaksi database.
4. Akses webhook payload, audit log, dan data OAuth dibatasi untuk Super Admin atau
   service backend yang berwenang.
5. Unique constraint dan idempotency key menangani checkout/webhook ganda; frontend
   bukan satu-satunya kontrol.
