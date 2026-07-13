# Test Scenarios — Central Membership & SSO Hub

## 1. Panduan eksekusi

| Level | Tool | Ruang lingkup |
|---|---|---|
| Unit | Jest | Service, DTO validation, guard, license/payment state machine. |
| Integration | Jest + Supertest + PostgreSQL test DB | Controller, Prisma, guard, transaction, dan format error. |
| E2E | Playwright | Journey browser member/admin. |
| External sandbox | Midtrans/Xendit sandbox | Hosted payment dan webhook asli/simulasi. |
| Queue | BullMQ + Redis test instance | Retry, delayed job, lifecycle scheduler. |

Setiap scenario memakai database terisolasi dan data dibersihkan setelah test. Waktu scheduler harus dapat diinjeksi/fake agar test tidak bergantung pada jam nyata.

## 2. Scenario fungsional

| ID | Jenis | Prekondisi | Langkah singkat | Expected result |
|---|---|---|---|---|
| TS-AUTH-01 | E2E | Email belum terdaftar | Register → buka link verifikasi → login | Akun aktif, dashboard dapat diakses, email terkirim via queue. |
| TS-AUTH-02 | Integration | Email telah terdaftar | Kirim register dengan email sama, beda kapital | `409 EMAIL_ALREADY_REGISTERED`; tidak ada akun kedua. |
| TS-AUTH-03 | Integration | Akun unverified | Login dan aktivasi free | Ditolak sesuai error akun belum verified. |
| TS-AUTH-04 | Integration | Akun aktif | Login salah berulang hingga limit | `429` setelah batas; password tidak muncul di respons/log. |
| TS-AUTH-05 | E2E | Akun aktif | Forgot password → reset dengan token → login password baru | Password lama ditolak, baru diterima, token lama tidak dapat diulang. |
| TS-LIC-01 | Integration | Member aktif, NOTO free aktif | Activate-free dua kali | Pertama `201 active_free`; kedua `409`; satu License-ID saja. |
| TS-LIC-02 | Unit + integration | Paid license expired | Jalankan lifecycle pada expiry lalu grace end | `active → grace_period → suspended`; notifikasi dijadwalkan. |
| TS-LIC-03 | Integration | Dua member | Member A baca license B | `404`/`403` tanpa bocor detail license B. |
| TS-ORD-01 | Integration | Member aktif, plan paid | Buat order dengan idempotency key sama dua kali | Order/payment URL sama; satu order `pending_payment`. |
| TS-ORD-02 | Integration | Order pending | Kirim key sama dengan body berbeda | `409` dan order awal tidak berubah. |
| TS-PAY-01 | Integration | Order pending | Kirim webhook Midtrans valid settlement | Order paid, payment settlement, license aktif, audit log dibuat atomik. |
| TS-PAY-02 | Integration | Order pending | Webhook amount/signature invalid | `400`; tidak ada perubahan order/license; event tercatat. |
| TS-PAY-03 | Integration | Settlement sudah sukses | Kirim webhook identik ulang | `200`; jumlah license/payment/email tidak bertambah. |
| TS-PAY-04 | Sandbox | Kredensial sandbox | Checkout Midtrans dan Xendit lalu selesaikan/cancel | Status internal sesuai callback masing-masing gateway. |
| TS-SSO-01 | Integration | OAuth client/redirect URI valid | Authorize dengan PKCE → token exchange | Code sekali pakai, JWT RS256 valid via JWKS. |
| TS-SSO-02 | Integration | Member lisensi suspended | Authorize dan refresh token | Ditolak `license_suspended`/`license_inactive`. |
| TS-ADM-01 | Integration | Member non-admin | Panggil endpoint admin | `403`; audit tidak memuat secret. |
| TS-ADM-02 | Integration | Super admin | Suspend member lalu cek token/akses | Aksi dicatat; akses baru ditolak sesuai aturan. |
| TS-JOB-01 | Queue | Email provider disimulasikan gagal | Proses job email | Job retry dengan backoff; transaksi register/payment tetap sukses. |
| TS-JOB-02 | Queue | Dua worker/scheduler | Jalankan lifecycle bersamaan | Satu transisi efektif; tidak ada email/status ganda. |

## 3. Security dan reliability regression

| ID | Pengujian | Expected result |
|---|---|---|
| TS-SEC-01 | Akses endpoint tanpa/expired/malformed bearer token | `401` dengan format error standar. |
| TS-SEC-02 | OAuth redirect URI, state, atau PKCE invalid | Authorization ditolak; tidak ada code/token diterbitkan. |
| TS-SEC-03 | Field DTO tidak dikenal, payload terlalu besar, atau query pagination tidak valid | `400`; field tidak diteruskan ke service/database. |
| TS-SEC-04 | CORS dari origin tidak diizinkan | Browser tidak mendapat akses API. |
| TS-REL-01 | PostgreSQL/Redis/email sementara tidak tersedia | API fail gracefully; tidak ada partial settlement; job dapat dipulihkan/retry. |
| TS-REL-02 | Jalankan Prisma migration pada data lama | Migration sukses, data penting tetap valid, dan rollback plan tersedia. |

## 4. Smoke test staging/production

1. `GET /health` sehat dan frontend dapat memuat halaman publik.
2. Register/login sandbox berhasil; email queue worker memproses job.
3. Katalog, aktivasi free, dan dashboard menampilkan lisensi yang benar.
4. Midtrans/Xendit sandbox mengirim webhook valid dan retry tanpa duplikasi.
5. OAuth authorize/token/JWKS untuk client staging berhasil.
6. Queue failed jobs, log API/worker, disk VPS, PostgreSQL, dan Redis dipantau setelah deploy.
