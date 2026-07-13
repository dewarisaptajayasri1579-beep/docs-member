# System Architecture — Central Membership & SSO Hub

## 1. Ringkasan

Sistem memakai **modular monolith**: frontend Next.js dan backend NestJS dideploy sebagai service terpisah, tetapi seluruh domain bisnis Hub berada pada satu aplikasi NestJS. Ini menjaga deployment awal sederhana tanpa mengorbankan pemisahan modul atau kemampuan ekstraksi service di masa depan.

```text
Browser
  │ HTTPS
  ├── Frontend (Next.js) ──────────────┐
  │                                    │ REST / OAuth2
  └────────────────────────────────────┤
                                       ▼
                            Backend (NestJS API)
                     auth · products · licenses · orders
                    payments · oauth · notifications · admin
                         │          │          │
                         ▼          ▼          ▼
                    PostgreSQL    Redis      Email provider
                    (Prisma)     (BullMQ)   
                         │
              Midtrans / Xendit webhook
```

## 2. Komponen dan tanggung jawab

| Komponen | Tanggung jawab |
|---|---|
| Next.js frontend | UI publik, member, dan admin; mengonsumsi REST API; tidak menyimpan secret gateway atau private key JWT. |
| NestJS API | Validasi DTO, auth, aturan bisnis, OAuth2/SSO, payment orchestration, audit, dan OpenAPI. |
| PostgreSQL | Source of truth akun, lisensi, order, payment, OAuth client/token, dan audit log. |
| Prisma | Schema type-safe, migration, dan database transaction. |
| Redis | Penyimpanan cepat untuk queue BullMQ dan rate-limit/distributed lock bila diperlukan. Bukan source of truth bisnis. |
| BullMQ worker | Menjalankan pekerjaan background yang tahan retry dan terjadwal. |
| Midtrans/Xendit | Hosted payment page dan webhook konfirmasi pembayaran. |
| Email provider | Email verifikasi, reset password, aktivasi lisensi, invoice, dan reminder. |
| Coolify di VPS | Menjalankan container, routing domain/HTTPS, environment, deploy, dan observability dasar. |

## 3. Modul NestJS

```text
src/
├── auth/             register, login, session, verify email, reset password
├── members/          profile dan notification preferences
├── products/         product dan plan catalog
├── licenses/         License-ID, activation, renewal, grace/suspension
├── orders/           checkout dan idempotency key
├── payments/         Midtrans, Xendit, webhook verification
├── oauth/            authorize, token, revoke, userinfo, JWKS
├── notifications/    producer BullMQ dan email delivery
├── jobs/              BullMQ processors dan scheduled jobs
├── admin/             protected administrative operations
├── audit/             append-only audit log
├── prisma/            PrismaService dan transaction helpers
├── common/            guards, decorators, filters, interceptors
└── config/            environment validation dan typed configuration
```

Controller hanya menangani HTTP. Service menyimpan aturan bisnis. Perubahan settlement payment dilakukan dalam satu `prisma.$transaction`: payment, order, license, dan audit log berhasil bersama atau gagal bersama.

## 4. Redis dan BullMQ

Redis menyimpan data queue sementara. **BullMQ bukan pengganti PostgreSQL**; status lisensi/order selalu dibaca dan ditulis ke PostgreSQL.

| Queue / job | Trigger | Fungsi | Retry |
|---|---|---|---|
| `email` | Event aplikasi | Mengirim verification, reset password, activation, dan invoice email setelah transaksi utama sukses. | Exponential backoff; error tercatat. |
| `license-reminder` | Scheduler harian | Mencari lisensi mendekati expiry atau dalam grace period lalu membuat notifikasi. | Aman dijalankan ulang karena memakai idempotency key. |
| `license-lifecycle` | Scheduler terjadwal | Mengubah `active` → `grace_period` dan `grace_period` → `suspended` sesuai waktu. | Service memeriksa status aktual di DB sebelum update. |
| `webhook-follow-up` | Webhook selesai | Pekerjaan non-kritis: kirim invoice/activation email dan sinkronisasi analytics. | Tidak boleh mengaktifkan lisensi kedua kali. |
| `cleanup` | Scheduler mingguan | Hapus token expired/event lama sesuai retensi. | Retry bila database sementara gagal. |

Webhook payment tidak menunggu queue untuk settlement: signature dan amount divalidasi, lalu perubahan payment/order/license dilakukan langsung secara atomik. Queue hanya menerima pekerjaan lanjutan setelah transaction berhasil.

## 5. Alur kritis

### Checkout paid

1. NestJS memvalidasi member, plan, dan `Idempotency-Key`.
2. Sistem membuat order `pending_payment` dan meminta payment session ke gateway.
3. Member membayar di hosted payment page gateway.
4. Gateway memanggil webhook ke NestJS.
5. NestJS memvalidasi signature + amount + idempotensi, lalu melakukan settlement dalam satu transaksi PostgreSQL.
6. Event email/invoice dimasukkan ke BullMQ.

### SSO

1. SaaS redirect ke `/oauth/authorize` menggunakan Authorization Code + PKCE.
2. Hub memvalidasi sesi member dan lisensi untuk produk peminta.
3. `/oauth/token` menerbitkan access token JWT RS256 dan refresh token terotasi.
4. SaaS memverifikasi JWT memakai public key dari `/.well-known/jwks.json`.

## 6. Batas keamanan

- Frontend hanya mengenal URL publik API dan client configuration yang aman.
- JWT private key, database URL, gateway secret, OAuth client secret, dan Redis URL hanya ada di backend/Coolify secrets.
- PostgreSQL dan Redis berada pada private network Coolify; tidak dipublikasikan ke internet.
- NestJS menggunakan Helmet, CORS allowlist, rate limit, global validation pipe, dan exception filter.
- Audit log merekam aksi security/billing tanpa menyimpan credential, token, atau payload rahasia.
