# Exception Flow — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan semua kondisi pengecualian (exception) yang dapat terjadi dalam sistem, cara sistem merespons, dan tindakan yang harus diambil oleh pengguna atau sistem.

## 2. Kategori Exception

1. Registrasi & Verifikasi Akun
2. Login & Autentikasi
3. Aktivasi Lisensi
4. Checkout & Pembayaran
5. Webhook Payment Gateway
6. SSO & Token
7. Grace Period & Suspend
8. Sistem & Infrastruktur

---

# 3. Exception: Registrasi & Verifikasi Akun

## EX-REG-01: Email Sudah Terdaftar

| Atribut | Detail |
|---|---|
| Kondisi | Member mencoba mendaftar dengan email yang sudah ada di sistem |
| Sistem | Menolak registrasi |
| Respons HTTP | `422 Unprocessable Entity` |
| Pesan ke User | "Email ini sudah terdaftar. Silakan login atau gunakan email lain." |
| Tindakan User | Login menggunakan email yang sama, atau gunakan fitur lupa kata sandi |
| Catatan | Pesan tidak boleh mengkonfirmasi apakah email terdaftar untuk alasan privasi; namun untuk UX membership, boleh informatif |

## EX-REG-02: Format Email Tidak Valid

| Atribut | Detail |
|---|---|
| Kondisi | Email yang dimasukkan tidak sesuai format |
| Sistem | Menolak di level validasi (frontend dan backend) |
| Respons HTTP | `422 Unprocessable Entity` |
| Pesan ke User | "Format email tidak valid." |
| Tindakan User | Perbaiki format email |

## EX-REG-03: Kata Sandi Tidak Memenuhi Syarat

| Atribut | Detail |
|---|---|
| Kondisi | Kata sandi terlalu pendek, tidak mengandung angka/huruf kapital, dsb |
| Sistem | Menolak di level validasi |
| Respons HTTP | `422 Unprocessable Entity` |
| Pesan ke User | "Kata sandi minimal 8 karakter dan harus mengandung huruf dan angka." |
| Tindakan User | Buat kata sandi yang memenuhi syarat |

## EX-REG-04: Tautan Verifikasi Email Kedaluwarsa

| Atribut | Detail |
|---|---|
| Kondisi | Member mengklik tautan verifikasi setelah melewati batas waktu (misal: 24 jam) |
| Sistem | Menolak verifikasi, tautan tidak valid lagi |
| Respons HTTP | `410 Gone` |
| Pesan ke User | "Tautan verifikasi sudah kedaluwarsa. Klik tombol di bawah untuk kirim ulang." |
| Tindakan User | Minta kirim ulang email verifikasi |
| Tindakan Sistem | Kirim email verifikasi baru dengan tautan baru |

## EX-REG-05: Tautan Verifikasi Sudah Digunakan

| Atribut | Detail |
|---|---|
| Kondisi | Member mengklik tautan verifikasi yang sudah pernah digunakan |
| Sistem | Cek apakah akun sudah aktif |
| Pesan ke User | "Akun Anda sudah terverifikasi. Silakan login." |
| Tindakan User | Login |

---

# 4. Exception: Login & Autentikasi

## EX-LOGIN-01: Kredensial Salah

| Atribut | Detail |
|---|---|
| Kondisi | Email atau kata sandi yang dimasukkan salah |
| Sistem | Menolak login |
| Respons HTTP | `401 Unauthorized` |
| Pesan ke User | "Email atau kata sandi salah." |
| Tindakan User | Coba lagi atau gunakan fitur lupa kata sandi |
| Catatan | Tidak boleh membedakan apakah email tidak ada atau password salah (security) |

## EX-LOGIN-02: Akun Belum Diverifikasi

| Atribut | Detail |
|---|---|
| Kondisi | Member login dengan akun yang belum verifikasi email |
| Sistem | Menolak login, tawarkan kirim ulang email |
| Respons HTTP | `403 Forbidden` |
| Pesan ke User | "Akun belum diverifikasi. Cek email Anda atau klik tombol untuk kirim ulang." |
| Tindakan User | Cek email dan klik tautan verifikasi |

## EX-LOGIN-03: Akun Ditangguhkan

| Atribut | Detail |
|---|---|
| Kondisi | Akun member dinonaktifkan oleh Super Admin |
| Sistem | Menolak login |
| Respons HTTP | `403 Forbidden` |
| Pesan ke User | "Akun Anda ditangguhkan. Hubungi dukungan untuk informasi lebih lanjut." |
| Tindakan User | Hubungi support |

## EX-LOGIN-04: Terlalu Banyak Percobaan Login Gagal

| Atribut | Detail |
|---|---|
| Kondisi | Member melakukan lebih dari batas percobaan login gagal (misal: 5x dalam 10 menit) |
| Sistem | Mengunci sementara endpoint login untuk IP / akun tersebut |
| Respons HTTP | `429 Too Many Requests` |
| Pesan ke User | "Terlalu banyak percobaan gagal. Coba lagi dalam 10 menit." |
| Tindakan User | Tunggu dan coba lagi |

---

# 5. Exception: Aktivasi Lisensi

## EX-LIC-01: Akun Belum Terverifikasi Saat Aktivasi

| Atribut | Detail |
|---|---|
| Kondisi | Member mencoba mengaktifkan paket namun akun belum diverifikasi |
| Sistem | Menolak aktivasi |
| Respons HTTP | `403 Forbidden` |
| Pesan ke User | "Verifikasi email Anda terlebih dahulu sebelum mengaktifkan produk." |
| Tindakan User | Verifikasi email |

## EX-LIC-02: Sudah Memiliki Lisensi Aktif untuk Produk yang Sama

| Atribut | Detail |
|---|---|
| Kondisi | Member mencoba mengaktifkan paket gratis, tapi sudah punya lisensi aktif untuk produk tersebut |
| Sistem | Menolak duplikasi, arahkan ke detail lisensi yang sudah ada |
| Respons HTTP | `409 Conflict` |
| Pesan ke User | "Anda sudah memiliki lisensi aktif untuk produk ini." |
| Tindakan User | Lihat lisensi aktif di dashboard atau pilih untuk upgrade |

## EX-LIC-03: Produk Tidak Tersedia

| Atribut | Detail |
|---|---|
| Kondisi | Member mencoba mengaktifkan produk yang sudah dihapus/dinonaktifkan |
| Sistem | Menolak aktivasi |
| Respons HTTP | `404 Not Found` |
| Pesan ke User | "Produk tidak tersedia saat ini." |
| Tindakan User | Pilih produk lain |

---

# 6. Exception: Checkout & Pembayaran

## EX-PAY-01: Order Kedaluwarsa Sebelum Pembayaran

| Atribut | Detail |
|---|---|
| Kondisi | Member tidak menyelesaikan pembayaran dalam batas waktu order |
| Sistem | Order ditandai `expired`, lisensi tidak diaktifkan |
| Pesan ke User | "Sesi pembayaran Anda telah kedaluwarsa. Silakan mulai ulang proses pembelian." |
| Tindakan User | Kembali ke katalog dan buat order baru |

## EX-PAY-02: Pembayaran Ditolak oleh Payment Gateway

| Atribut | Detail |
|---|---|
| Kondisi | Pembayaran ditolak (saldo tidak cukup, kartu ditolak, dsb) |
| Sistem | Order ditandai `failed`, lisensi tidak diaktifkan |
| Pesan ke User | "Pembayaran tidak berhasil. Coba metode lain atau hubungi bank Anda." |
| Tindakan User | Coba ulang dengan metode pembayaran berbeda |

## EX-PAY-03: Jumlah Pembayaran Tidak Sesuai

| Atribut | Detail |
|---|---|
| Kondisi | Webhook diterima tetapi jumlah yang dibayar tidak sesuai dengan harga order |
| Sistem | Tolak aktivasi, catat di audit log, notifikasi Super Admin |
| Tindakan Sistem | Tidak mengaktifkan lisensi, simpan bukti ke log |
| Tindakan Super Admin | Verifikasi manual dan ambil tindakan sesuai kebijakan |

## EX-PAY-04: Double Checkout (Order Duplikat)

| Atribut | Detail |
|---|---|
| Kondisi | Member membuat order lebih dari satu kali untuk produk yang sama dalam waktu berdekatan |
| Sistem | Hanya memproses satu order; order duplikat ditandai sebagai `duplicate` |
| Pesan ke User | "Anda sudah memiliki order aktif untuk produk ini. Selesaikan pembayaran yang sedang berjalan." |
| Tindakan User | Selesaikan order yang sudah ada |

---

# 7. Exception: Webhook Payment Gateway

## EX-WH-01: Webhook Tidak Dapat Diverifikasi

| Atribut | Detail |
|---|---|
| Kondisi | Signature webhook tidak cocok atau tidak valid |
| Sistem | Abaikan webhook, catat di error log |
| Respons HTTP ke Gateway | `400 Bad Request` |
| Lisensi | Tidak diaktifkan |
| Tindakan | Super Admin memeriksa log dan melakukan verifikasi manual jika perlu |

## EX-WH-02: Webhook Diterima Lebih dari Satu Kali (Retry)

| Atribut | Detail |
|---|---|
| Kondisi | Payment gateway mengirim ulang webhook yang sama karena tidak mendapat respons sukses |
| Sistem | Cek `order_id` sudah pernah diproses → abaikan (idempotency) |
| Respons HTTP ke Gateway | `200 OK` (supaya gateway berhenti retry) |
| Lisensi | Tidak diaktifkan dua kali |

## EX-WH-03: Webhook Diterima tapi Server Sedang Down

| Atribut | Detail |
|---|---|
| Kondisi | Server Hub tidak tersedia saat payment gateway mengirim webhook |
| Sistem | Payment gateway akan retry otomatis beberapa kali |
| Tindakan | Pastikan endpoint webhook dapat merespons dalam waktu singkat setelah server pulih |
| Fallback | Super Admin melakukan aktivasi manual berdasarkan log pembayaran di dashboard payment gateway |

---

# 8. Exception: SSO & Token

## EX-SSO-01: Tidak Memiliki Lisensi untuk Produk yang Diminta

| Atribut | Detail |
|---|---|
| Kondisi | Member mencoba login ke aplikasi SaaS tetapi tidak punya lisensi aktif untuk produk tersebut |
| Sistem | Menolak penerbitan token, redirect ke halaman pilih paket |
| Respons | `403 no_license` |
| Pesan ke User | "Anda belum berlangganan produk ini. Pilih paket untuk mulai menggunakannya." |

## EX-SSO-02: Lisensi Suspended

| Atribut | Detail |
|---|---|
| Kondisi | Member mencoba login ke aplikasi dengan lisensi yang sudah suspend |
| Sistem | Menolak penerbitan token, redirect ke halaman perpanjangan |
| Respons | `403 license_suspended` |
| Pesan ke User | "Akses Anda ke produk ini telah diblokir. Perpanjang langganan untuk melanjutkan." |

## EX-SSO-03: Access Token Kedaluwarsa

| Atribut | Detail |
|---|---|
| Kondisi | Aplikasi SaaS menerima request dengan Access Token yang sudah expired |
| Sistem | Menolak request |
| Respons HTTP | `401 Unauthorized` |
| Tindakan Aplikasi | Gunakan Refresh Token untuk mendapatkan Access Token baru |

## EX-SSO-04: Refresh Token Tidak Valid atau Kedaluwarsa

| Atribut | Detail |
|---|---|
| Kondisi | Refresh Token sudah expired atau dicabut |
| Sistem | Menolak penerbitan Access Token baru |
| Respons | `401 invalid_refresh_token` |
| Tindakan Aplikasi | Redirect member ke halaman login Hub |

## EX-SSO-05: State Parameter Tidak Cocok (CSRF)

| Atribut | Detail |
|---|---|
| Kondisi | Nilai `state` yang dikembalikan oleh Hub tidak cocok dengan yang disimpan aplikasi |
| Sistem | Aplikasi SaaS menolak proses SSO |
| Tindakan Aplikasi | Tampilkan pesan error, minta member mulai ulang proses login |
| Catatan | Ini adalah perlindungan terhadap serangan CSRF |

## EX-SSO-06: Signature JWT Tidak Valid

| Atribut | Detail |
|---|---|
| Kondisi | Aplikasi SaaS menerima JWT yang signature-nya tidak dapat diverifikasi menggunakan public key Hub |
| Sistem | Aplikasi menolak JWT |
| Tindakan Aplikasi | Tolak akses, redirect ke login |
| Catatan | Kemungkinan terjadi jika token dipalsukan atau public key belum diperbarui |

---

# 9. Exception: Grace Period & Suspend

## EX-GP-01: Notifikasi Grace Period Gagal Terkirim

| Atribut | Detail |
|---|---|
| Kondisi | Email reminder Grace Period gagal terkirim karena error layanan email |
| Sistem | Catat kegagalan di log, coba kirim ulang sesuai retry policy |
| Tindakan | Notifikasi in-app tetap ditampilkan di dashboard |
| Catatan | Kegagalan email tidak menghentikan proses Grace Period |

## EX-GP-02: Member Membayar Setelah Suspend

| Atribut | Detail |
|---|---|
| Kondisi | Lisensi sudah berstatus `suspended` dan member baru membayar |
| Sistem | Aktifkan kembali lisensi setelah konfirmasi pembayaran |
| `expired_at` Baru | Dihitung dari tanggal pembayaran + durasi paket |
| Pesan ke User | "Akses Anda telah dipulihkan. Terima kasih telah memperpanjang." |

---

# 10. Exception: Sistem & Infrastruktur

## EX-SYS-01: Database Tidak Tersedia

| Atribut | Detail |
|---|---|
| Kondisi | Database tidak dapat dijangkau oleh server |
| Sistem | Kembalikan error generik ke pengguna |
| Respons HTTP | `503 Service Unavailable` |
| Pesan ke User | "Layanan sedang tidak tersedia. Coba lagi beberapa saat." |
| Tindakan | Tim teknis diberitahu melalui monitoring alert |

## EX-SYS-02: Layanan Email Tidak Tersedia

| Atribut | Detail |
|---|---|
| Kondisi | Layanan pengiriman email tidak dapat dihubungi |
| Sistem | Operasi utama tetap berjalan, email masuk ke antrian retry |
| Tindakan | Sistem mencoba kirim ulang email setelah layanan pulih |
| Catatan | Kegagalan email tidak boleh memblokir proses aktivasi lisensi atau login |

## EX-SYS-03: Payment Gateway Tidak Tersedia

| Atribut | Detail |
|---|---|
| Kondisi | Endpoint payment gateway tidak dapat dijangkau saat membuat sesi pembayaran |
| Sistem | Tampilkan pesan error kepada member |
| Respons HTTP | `503 Service Unavailable` |
| Pesan ke User | "Layanan pembayaran sedang tidak tersedia. Coba beberapa saat lagi atau pilih metode lain." |
| Tindakan User | Coba lagi atau pilih payment gateway yang berbeda |

---

# 11. Ringkasan Kode Error

| Kode Exception | Area | Kondisi Singkat |
|---|---|---|
| EX-REG-01 | Registrasi | Email sudah terdaftar |
| EX-REG-02 | Registrasi | Format email tidak valid |
| EX-REG-03 | Registrasi | Kata sandi tidak memenuhi syarat |
| EX-REG-04 | Registrasi | Tautan verifikasi expired |
| EX-REG-05 | Registrasi | Tautan verifikasi sudah digunakan |
| EX-LOGIN-01 | Login | Kredensial salah |
| EX-LOGIN-02 | Login | Akun belum diverifikasi |
| EX-LOGIN-03 | Login | Akun ditangguhkan |
| EX-LOGIN-04 | Login | Rate limit login |
| EX-LIC-01 | Lisensi | Akun belum terverifikasi |
| EX-LIC-02 | Lisensi | Lisensi aktif sudah ada |
| EX-LIC-03 | Lisensi | Produk tidak tersedia |
| EX-PAY-01 | Pembayaran | Order expired |
| EX-PAY-02 | Pembayaran | Pembayaran ditolak |
| EX-PAY-03 | Pembayaran | Jumlah tidak sesuai |
| EX-PAY-04 | Pembayaran | Order duplikat |
| EX-WH-01 | Webhook | Verifikasi signature gagal |
| EX-WH-02 | Webhook | Webhook duplikat (retry) |
| EX-WH-03 | Webhook | Server down saat webhook datang |
| EX-SSO-01 | SSO | Tidak punya lisensi produk |
| EX-SSO-02 | SSO | Lisensi suspended |
| EX-SSO-03 | SSO | Access token expired |
| EX-SSO-04 | SSO | Refresh token tidak valid |
| EX-SSO-05 | SSO | State parameter tidak cocok |
| EX-SSO-06 | SSO | Signature JWT tidak valid |
| EX-GP-01 | Grace Period | Email notifikasi gagal |
| EX-GP-02 | Grace Period | Bayar setelah suspend |
| EX-SYS-01 | Sistem | Database tidak tersedia |
| EX-SYS-02 | Sistem | Layanan email tidak tersedia |
| EX-SYS-03 | Sistem | Payment gateway tidak tersedia |

---

# 12. Prinsip Penanganan Exception

1. Setiap exception harus memiliki pesan yang **informatif** kepada user, bukan pesan teknis mentah.
2. Kode error internal dicatat di log, bukan ditampilkan ke user.
3. Kegagalan email atau notifikasi **tidak boleh menghentikan** proses utama (lisensi, login).
4. Proses pembayaran harus **atomic**: lisensi tidak aktif sebagian.
5. Semua exception dicatat di **audit log** dengan konteks yang cukup untuk debugging.
6. Endpoint penting harus mengembalikan respons HTTP yang tepat sesuai kondisi.
7. Sistem harus **fail gracefully**: error infra tidak menampilkan stack trace ke pengguna.
