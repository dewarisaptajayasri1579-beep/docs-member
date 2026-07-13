# Membership and Billing Rules — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan seluruh aturan bisnis utama yang harus diterapkan dalam sistem Central Membership & SSO Hub.

Dokumen ini menjadi pedoman bagi:

- product owner,
- programmer,
- UI/UX designer,
- tester,
- dan tim operasional.

Programmer tidak boleh membuat asumsi tentang aturan yang belum didefinisikan di sini.

---

# 2. Prinsip Umum

1. Satu akun member dapat berlangganan beberapa produk SaaS secara bersamaan.
2. Setiap produk memiliki paket dan harga yang independen.
3. Lisensi hanya aktif setelah aktivasi yang sah (gratis atau pembayaran dikonfirmasi).
4. Data member bersifat privat dan hanya dapat diakses oleh member pemilik dan Super Admin dengan alasan yang sah.
5. Proses pembayaran bersifat atomic: lisensi tidak boleh aktif jika pembayaran belum dikonfirmasi.
6. Data member tidak dihapus permanen karena status lisensi berubah.
7. Semua tindakan penting harus dapat diaudit.

---

# 3. Aturan Akun Member

## 3.1 Registrasi

1. Email wajib unik di seluruh sistem.
2. Email dinormalisasi menjadi huruf kecil (lowercase) dan ditrim spasi sebelum disimpan.
3. Kata sandi tidak boleh disimpan dalam bentuk teks asli (harus di-hash).
4. Akun berstatus `unverified` hingga email diverifikasi.
5. Akun `unverified` tidak dapat mengaktifkan lisensi atau login ke aplikasi SaaS.
6. Tautan verifikasi email memiliki masa berlaku (misal: 24 jam).
7. Member dapat meminta kirim ulang tautan verifikasi.

## 3.2 Login

1. Login menggunakan email dan kata sandi.
2. Email dinormalisasi sebelum proses validasi.
3. Percobaan login gagal berulang harus dibatasi (rate limiting).
4. Akun dengan status `suspended` tidak dapat login.
5. Akun dengan status `unverified` tidak dapat login ke aplikasi SaaS melalui SSO.

## 3.3 Profil

1. Member hanya dapat mengubah data profilnya sendiri.
2. Perubahan email memerlukan verifikasi ulang ke email baru.
3. Perubahan kata sandi mengakhiri semua sesi aktif lainnya.

---

# 4. Aturan Produk dan Paket

1. Setiap produk SaaS diidentifikasi dengan kode produk unik (contoh: `NTO`).
2. Setiap produk mendefinisikan paketnya sendiri secara independen.
3. Harga paket disimpan dalam mata uang IDR.
4. Paket gratis tidak memiliki durasi dan tidak akan kedaluwarsa.
5. Paket berbayar memiliki durasi dalam satuan hari.
6. Super Admin dapat menambah, mengubah, atau menonaktifkan paket.
7. Perubahan harga paket tidak memengaruhi langganan yang sudah aktif.
8. Paket yang dinonaktifkan tidak dapat dipilih oleh member baru, tetapi langganan lama tetap berjalan hingga selesai.

---

# 5. Aturan Lisensi

## 5.1 Pembuatan Lisensi

1. Satu member hanya boleh memiliki satu lisensi aktif per produk pada satu waktu.
2. License-ID dibuat satu kali saat pertama kali mengaktifkan produk tersebut.
3. Perpanjangan tidak mengubah License-ID.
4. License-ID hanya dibuat ulang jika lisensi sebelumnya berstatus `cancelled`.
5. License-ID harus unik secara global di seluruh sistem.

## 5.2 Aktivasi Lisensi

1. Aktivasi paket gratis langsung menghasilkan lisensi berstatus `active`.
2. Aktivasi paket berbayar hanya terjadi setelah webhook konfirmasi pembayaran sukses diterima dan diverifikasi.
3. Sistem tidak boleh mengaktifkan lisensi berbayar tanpa konfirmasi pembayaran yang valid.

## 5.3 Format License-ID

```
[PREFIX_PRODUK]-[XXXX]-[XXXX]-[XXXX]
```

- Prefix: 2–4 huruf kapital sesuai kode produk.
- Segmen: 4 karakter alfanumerik kapital, digenerate secara acak.
- Contoh: `NTO-A1B2-C3D4-E5F6`

## 5.4 Status Lisensi

- `active`: Lisensi aktif.
- `grace_period`: Berbayar, sudah expired, dalam masa tenggang.
- `suspended`: Grace Period habis, akses diblokir.
- `cancelled`: Dibatalkan.

Perpindahan status:

```
active → grace_period (hanya paket berbayar, ketika expired_at tercapai)
grace_period → active (jika perpanjangan berhasil)
grace_period → suspended (jika Grace Period habis)
suspended → active (jika member membayar kembali)
```

---

# 6. Aturan Pembayaran

## 6.1 Order

1. Setiap sesi checkout membuat satu `order` dengan status `pending_payment`.
2. Order memiliki `order_id` unik yang digunakan sebagai referensi ke payment gateway.
3. Order yang tidak diselesaikan dalam batas waktu tertentu otomatis kedaluwarsa.

## 6.2 Konfirmasi Pembayaran via Webhook

1. Sistem hanya mengaktifkan lisensi setelah menerima webhook konfirmasi sukses dari payment gateway.
2. Webhook harus diverifikasi menggunakan mekanisme signature yang disediakan payment gateway.
3. Satu order_id tidak boleh memicu aktivasi lebih dari satu kali (idempotency).
4. Webhook dari payment gateway yang tidak dapat diverifikasi harus diabaikan dan dicatat di log.

## 6.3 Kegagalan Pembayaran

1. Pembayaran gagal tidak mengaktifkan lisensi.
2. Member dapat mencoba checkout ulang untuk order baru.

## 6.4 Riwayat Transaksi

1. Setiap transaksi pembayaran disimpan secara permanen.
2. Invoice tersedia untuk diunduh oleh member.
3. Riwayat transaksi tidak dapat diubah atau dihapus.

---

# 7. Aturan Grace Period

1. Grace Period hanya berlaku untuk paket berbayar.
2. Panjang Grace Period dikonfigurasi per produk (default: 7 hari).
3. Grace Period dimulai tepat setelah `expired_at` tercapai.
4. Selama Grace Period:
   - member masih dapat mengakses aplikasi,
   - sistem menampilkan banner peringatan di dashboard member,
   - dan sistem menampilkan banner peringatan di dalam aplikasi SaaS (melalui JWT yang menyertakan status `grace_period`).
5. Notifikasi email dikirim sesuai jadwal yang telah ditetapkan.
6. Setelah Grace Period habis, lisensi berubah ke status `suspended`.
7. Perpanjangan selama Grace Period memperbarui `expired_at` dari tanggal expired asli.

---

# 8. Aturan SSO dan Token

1. JWT diterbitkan hanya untuk member dengan akun aktif dan lisensi berstatus `active`, `active_free`, atau `grace_period`.
2. JWT tidak diterbitkan untuk member dengan status `unverified`, `suspended`, atau lisensi `cancelled`.
3. JWT memiliki masa berlaku singkat (misal: 1 jam).
4. Refresh Token memiliki masa berlaku lebih panjang (misal: 30 hari).
5. JWT berisi informasi: `sub`, `name`, `email`, `product`, `license_id`, `tier`, `license_status`, `expires_at`.
6. Aplikasi SaaS wajib memverifikasi JWT menggunakan public key Hub.
7. Aplikasi SaaS tidak boleh mempercayai klaim dalam JWT tanpa memverifikasi signature-nya.
8. Saat lisensi suspend, Refresh Token tidak dapat digunakan untuk menghasilkan Access Token baru.

---

# 9. Aturan Notifikasi

1. Email konfirmasi aktivasi wajib terkirim setelah lisensi aktif.
2. Email invoice wajib terkirim setelah pembayaran berhasil.
3. Jadwal notifikasi reminder expired dan Grace Period wajib diikuti.
4. Kegagalan pengiriman email harus dicatat di log.
5. Member dapat mengatur preferensi notifikasi (aktifkan/nonaktifkan jenis notifikasi tertentu).

---

# 10. Aturan Keamanan

1. Kata sandi disimpan menggunakan algoritma hashing yang aman (bcrypt atau Argon2).
2. API Key payment gateway tidak boleh disimpan di frontend atau repository publik.
3. Webhook payment gateway harus diverifikasi sebelum diproses.
4. JWT ditandatangani menggunakan RS256 (asymmetric).
5. Private key JWT hanya tersimpan di server Hub.
6. Seluruh komunikasi menggunakan HTTPS.
7. Rate limiting diterapkan pada endpoint login dan registrasi.
8. Data sensitif tidak boleh ditulis ke log secara utuh.

---

# 11. Aturan Audit Log

Aktivitas berikut wajib dicatat:

- registrasi akun baru,
- login berhasil dan gagal,
- verifikasi email,
- aktivasi lisensi,
- pembayaran berhasil,
- pembayaran gagal,
- Grace Period dimulai,
- lisensi suspend,
- lisensi dipulihkan,
- perubahan status akun oleh Super Admin,
- penerbitan JWT,
- dan tindakan administratif sensitif.

Audit log minimal menyimpan:

- actor_id,
- actor_role,
- action,
- object_type,
- object_id,
- timestamp,
- ip_address,
- dan hasil (berhasil / gagal).

---

# 12. Aturan Penambahan Produk Baru

Ketika produk SaaS baru bergabung ke ekosistem:

1. Produk didaftarkan ke sistem dengan kode produk unik.
2. Paket-paket produk dikonfigurasi oleh Super Admin.
3. `client_id` dan `client_secret` OAuth2 diterbitkan untuk produk.
4. Format License-ID prefix ditetapkan (contoh: `APB` untuk Aplikasi B).
5. Produk mengimplementasikan integrasi SSO sesuai dokumen sso-auth-flow.

---

# 13. Definition of Done

Implementasi dianggap sesuai jika:

- member dapat mendaftar, verifikasi email, dan mengaktifkan paket gratis dalam satu sesi,
- License-ID digenerate, ditampilkan, dan dikirim ke email,
- SSO menerbitkan JWT yang dapat diverifikasi oleh aplikasi SaaS,
- pembayaran mengaktifkan lisensi secara otomatis melalui webhook,
- Grace Period berjalan dan notifikasi terkirim sesuai jadwal,
- lisensi suspend setelah Grace Period habis,
- data member tidak hilang meskipun lisensi suspend,
- webhook yang sama tidak memicu aktivasi dua kali,
- seluruh tindakan penting tercatat di audit log,
- dan seluruh aturan keamanan diterapkan.
