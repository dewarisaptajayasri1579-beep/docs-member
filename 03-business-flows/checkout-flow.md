# Checkout and Payment Flow — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan alur lengkap dari registrasi member hingga lisensi aktif, mencakup proses aktivasi gratis dan proses checkout berbayar.

## 2. Aktor

- Member
- System
- Payment Gateway (Midtrans / Xendit)

---

# 3. Alur Registrasi Member Baru

1. Member membuka halaman registrasi Membership Hub.
2. Member mengisi:
   - nama lengkap,
   - email,
   - kata sandi,
   - konfirmasi kata sandi.
3. System memvalidasi:
   - format email,
   - keunikan email (lowercase, ditrim),
   - kekuatan kata sandi.
4. System membuat akun dengan status `unverified`.
5. System mengirim email verifikasi.
6. Member membuka email dan mengklik tautan verifikasi.
7. System mengubah status akun menjadi `active`.
8. Member diarahkan ke dashboard.

---

# 4. Alur Memilih dan Mengaktifkan Produk

## 4.1 Melihat Katalog Produk

1. Member membuka halaman katalog produk.
2. System menampilkan daftar produk SaaS yang tersedia.
3. Member memilih produk (misalnya: NOTO).
4. System menampilkan daftar paket produk tersebut.

## 4.2 Aktivasi Paket Gratis

1. Member memilih paket **Free**.
2. System memvalidasi:
   - akun member aktif,
   - belum memiliki lisensi aktif untuk produk yang sama.
3. System membuat lisensi baru dengan:
   - status: `active_free`,
   - tier: `free`,
   - expired_at: `null` (tidak berakhir).
4. System menghasilkan License-ID dengan format:
   ```
   [PREFIX_PRODUK]-[XXXX]-[XXXX]-[XXXX]
   ```
   Contoh: `NTO-A1B2-C3D4-E5F6`
5. System menampilkan License-ID di dashboard.
6. System mengirim email konfirmasi berisi License-ID.
7. Member dapat langsung mengakses produk melalui SSO.

## 4.3 Checkout Paket Berbayar

1. Member memilih paket berbayar (misal: Pro Bulanan).
2. System menampilkan ringkasan order:
   - nama produk,
   - nama paket,
   - harga,
   - durasi,
   - dan pilihan payment gateway (Midtrans / Xendit).
3. Member memilih payment gateway.
4. System membuat **order** dengan status `pending_payment`.
5. System menghubungi payment gateway untuk membuat sesi pembayaran.
6. Member diarahkan ke halaman pembayaran payment gateway.
7. Member menyelesaikan pembayaran.

---

# 5. Alur Setelah Pembayaran

## 5.1 Pembayaran Berhasil

1. Payment gateway mengirim webhook ke System.
2. System memverifikasi webhook (signature dan amount).
3. System mengubah status order menjadi `paid`.
4. System membuat atau memperbarui lisensi:
   - status: `active`,
   - tier: sesuai paket yang dibeli,
   - started_at: waktu pembayaran,
   - expired_at: started_at + durasi paket.
5. System menghasilkan License-ID jika belum ada.
6. System mencatat transaksi pembayaran.
7. System mengirim email berisi:
   - konfirmasi pembayaran,
   - invoice,
   - License-ID,
   - dan tautan untuk masuk ke produk.
8. Lisensi tampil di dashboard member.

## 5.2 Pembayaran Gagal atau Kedaluwarsa

1. Payment gateway mengirim webhook kegagalan atau tidak ada respons dalam batas waktu.
2. System mengubah status order menjadi `failed` atau `expired`.
3. Lisensi tidak diaktifkan.
4. System mengirim notifikasi kepada member.
5. Member dapat mencoba checkout ulang.

---

# 6. Alur Perpanjangan Langganan

## 6.1 Perpanjangan Sebelum Expired

1. Member membuka detail lisensi di dashboard.
2. Member memilih **Perpanjang**.
3. Alur mengikuti proses Checkout Paket Berbayar (Bagian 4.3).
4. Setelah pembayaran berhasil, `expired_at` diperbarui:
   ```
   expired_at_baru = expired_at_lama + durasi_paket
   ```
   (atau dari tanggal bayar jika sudah melewati batas).

## 6.2 Perpanjangan Selama Grace Period

1. Lisensi berstatus `grace_period`.
2. Member mendapatkan notifikasi mendesak di dashboard dan email.
3. Member dapat memperpanjang mengikuti alur checkout.
4. Setelah pembayaran berhasil, lisensi diaktifkan kembali.

---

# 7. Alur Grace Period dan Suspend

```
Lisensi aktif
    │
    ▼ (expired_at tercapai)
Grace Period dimulai
    │── Notifikasi email H+0
    │── Notifikasi email H+3
    │── Notifikasi email H+6
    │
    ▼ (Grace Period habis, tidak ada perpanjangan)
Lisensi ditangguhkan (Suspended)
    │── Email notifikasi suspend
    │── Akses ke produk diblokir
    │── Data tetap aman
    │
    ▼ (jika member membayar setelah suspend)
Lisensi diaktifkan kembali
```

Panjang Grace Period ditentukan oleh konfigurasi sistem (default: 7 hari).

---

# 8. Aturan Duplikasi Lisensi

- Satu member hanya boleh memiliki **satu lisensi aktif** per produk pada satu waktu.
- Jika member sudah memiliki lisensi aktif untuk suatu produk, pembelian baru akan memperpanjang lisensi yang ada.
- Member tidak dapat memiliki dua lisensi aktif dengan produk yang sama secara bersamaan.

---

# 9. Idempotency Pembayaran

- Setiap order memiliki `order_id` unik.
- Webhook dari payment gateway yang sama tidak boleh memicu aktivasi lisensi lebih dari satu kali.
- System memeriksa status order sebelum memproses webhook.

---

# 10. Acceptance Criteria

- Member dapat mengaktifkan paket gratis tanpa pembayaran.
- License-ID digenerate dan ditampilkan setelah aktivasi.
- Email konfirmasi terkirim setelah aktivasi.
- Pembayaran berhasil mengaktifkan lisensi secara otomatis.
- Webhook payment gateway gagal tidak mengaktifkan lisensi.
- Grace Period berjalan sesuai konfigurasi.
- Lisensi ditangguhkan setelah Grace Period berakhir.
- Perpanjangan memperbarui masa aktif dengan benar.
- Tidak ada duplikasi lisensi aktif untuk produk yang sama.
