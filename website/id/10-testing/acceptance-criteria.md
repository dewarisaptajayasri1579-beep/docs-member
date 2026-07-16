# Acceptance Criteria — Central Membership & SSO Hub

## 1. Aturan umum selesai

Sebuah fitur diterima bila seluruh kriteria berikut terpenuhi: implementasi sesuai dokumen, test otomatis relevan lulus, error aman bagi pengguna, data sensitif tidak bocor, dan aktivitas penting tercatat pada audit log. Pengujian harus mencakup happy path, validasi, otorisasi, serta kegagalan dependency bila relevan.

## 2. Akun dan autentikasi

| ID | Kriteria penerimaan |
|---|---|
| AC-AUTH-01 | Registrasi dengan data valid membuat akun `unverified`, menormalisasi email, dan mengantrekan email verifikasi. |
| AC-AUTH-02 | Email duplikat mengembalikan `409 EMAIL_ALREADY_REGISTERED`; password tidak pernah ada di respons/log. |
| AC-AUTH-03 | Token verifikasi valid mengubah akun menjadi `active`; token expired/terpakai ditolak. Token baru membatalkan token lama. |
| AC-AUTH-04 | Login hanya berhasil untuk akun aktif dengan kredensial valid; respons memberi access/refresh token sesuai kontrak API. |
| AC-AUTH-05 | Akun unverified atau suspended tidak memperoleh sesi/token yang dapat digunakan. |
| AC-AUTH-06 | Forgot password/resend verification selalu memberi respons generik dan memiliki rate limit. |
| AC-AUTH-07 | Refresh token dirotasi; token dicabut/expired tidak dapat dipakai ulang. |

## 3. Produk, lisensi, dan lifecycle

| ID | Kriteria penerimaan |
|---|---|
| AC-LIC-01 | Katalog publik hanya menampilkan product/plan aktif. |
| AC-LIC-02 | Aktivasi paket free oleh member aktif membuat satu lisensi `active_free`, License-ID unik, dan notifikasi aktivasi. |
| AC-LIC-03 | Member tidak dapat memiliki dua lisensi berlaku untuk product yang sama; API memberi `409 LICENSE_ALREADY_EXISTS`. |
| AC-LIC-04 | License-ID tidak berubah saat renewal dan hanya dibuat ulang setelah lisensi sebelumnya `cancelled`. |
| AC-LIC-05 | Job lifecycle memindahkan paid license `active → grace_period → suspended` pada waktu tepat, tanpa memengaruhi Free Forever. |
| AC-LIC-06 | Renewal saat grace period mengembalikan lisensi ke `active` dan menghitung expiry sesuai aturan bisnis. |
| AC-LIC-07 | Endpoint member tidak dapat membaca/memodifikasi lisensi milik member lain. |

## 4. Checkout dan pembayaran

| ID | Kriteria penerimaan |
|---|---|
| AC-PAY-01 | Order paid memerlukan member aktif, plan aktif, gateway valid, dan header `Idempotency-Key`. |
| AC-PAY-02 | Request identik dengan idempotency key yang sama mengembalikan order awal; body berbeda menghasilkan `409`. |
| AC-PAY-03 | Order sukses membuat status `pending_payment`, snapshot amount/currency, dan payment URL gateway. |
| AC-PAY-04 | Webhook hanya melakukan settlement setelah signature/callback token dan amount tervalidasi. |
| AC-PAY-05 | Settlement atomik: payment, order, license, dan audit log berhasil bersama atau tidak satu pun berubah. |
| AC-PAY-06 | Webhook retry tidak membuat payment, lisensi, atau email aktivasi kedua kali; respons tetap `200`. |
| AC-PAY-07 | Payment gagal/expired tidak mengaktifkan lisensi; user dapat membuat checkout baru sesuai aturan duplikasi. |
| AC-PAY-08 | Invoice/activation email diproses queue setelah settlement tanpa menghambat respons webhook. |

## 5. OAuth2 dan SSO

| ID | Kriteria penerimaan |
|---|---|
| AC-SSO-01 | `/oauth/authorize` memvalidasi client, redirect URI terdaftar, state, scope, dan PKCE. |
| AC-SSO-02 | Authorization code sekali pakai, terikat pada client/redirect URI, dan expired sesuai konfigurasi. |
| AC-SSO-03 | Access token RS256 memuat claim member dan lisensi yang disetujui; JWKS menyediakan public key yang sesuai `kid`. |
| AC-SSO-04 | Token hanya diterbitkan untuk akun aktif dengan lisensi `active`, `active_free`, atau `grace_period`. |
| AC-SSO-05 | Lisensi tidak ada/suspended/cancelled ditolak dengan kode yang tepat; refresh token tidak dapat memulihkan akses suspended. |
| AC-SSO-06 | Logout/revoke mencabut refresh token; access token expired ditolak. |

## 6. Admin, queue, dan operasi

| ID | Kriteria penerimaan |
|---|---|
| AC-ADM-01 | Hanya `super_admin` dapat memakai endpoint admin; semua aksi sensitif menghasilkan audit log. |
| AC-ADM-02 | Perubahan produk/plan tidak mengubah snapshot harga order yang telah dibuat. |
| AC-JOB-01 | Kegagalan email/job dicatat dan dicoba ulang dengan backoff tanpa membatalkan transaksi utama. |
| AC-JOB-02 | Hanya satu scheduler lifecycle efektif per environment; job aman saat dijalankan ulang. |
| AC-OPS-01 | API health check, API/worker, PostgreSQL, dan Redis sehat sebelum deployment dinyatakan berhasil. |

## 7. Definition of done release

- Unit, integration, dan E2E yang relevan lulus di CI.
- Midtrans dan Xendit sandbox lulus untuk success, failed/expired, invalid signature, dan webhook retry.
- Migration Prisma diuji pada database kosong dan database upgrade.
- Tidak ada secret pada repository, respons API, frontend bundle, atau audit log.
- Staging memiliki hasil smoke test deployment dan rollback yang terdokumentasi.
