# Screen List — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini mendaftarkan seluruh halaman (screen) yang ada dalam aplikasi Membership Hub, termasuk deskripsi, komponen utama, dan kondisi yang perlu diperhatikan saat desain dan implementasi.

---

# 2. Area Publik (Tanpa Login)

## SCR-PUB-01: Landing Page

**Route**: `/`

**Deskripsi**: Halaman pertama yang dilihat calon pengguna. Menampilkan nilai produk dan CTA untuk mendaftar.

**Komponen**:
- Hero section: tagline "Satu Akun, Semua Aplikasi", deskripsi singkat, tombol CTA "Mulai Gratis" dan "Pelajari Lebih Lanjut"
- Bagian daftar produk yang tersedia
- Bagian keunggulan: SSO, multi-produk, keamanan
- Footer dengan link penting

**Kondisi**: Jika pengguna sudah login, redirect ke dashboard.

---

## SCR-PUB-02: Halaman Daftar (Registrasi)

**Route**: `/register`

**Deskripsi**: Formulir pendaftaran akun baru.

**Komponen**:
- Logo Hub
- Judul: "Buat Akun"
- Input: Nama Lengkap, Email, Kata Sandi, Konfirmasi Kata Sandi
- Password strength indicator
- Tombol: "Daftar" (primary, full-width)
- Link: "Sudah punya akun? Masuk"
- Pesan error per field (inline)

**Kondisi**:
- Email yang sudah terdaftar → error inline
- Validasi realtime saat member mengetik
- Loading state saat submit

---

## SCR-PUB-03: Halaman Login

**Route**: `/login`

**Deskripsi**: Formulir masuk ke akun yang sudah ada.

**Komponen**:
- Logo Hub
- Judul: "Masuk"
- Input: Email, Kata Sandi
- Tombol: "Masuk" (primary)
- Link: "Lupa kata sandi?"
- Divider "atau"
- Tombol: "Daftar Akun" (secondary outline)

**Kondisi**:
- Akun belum terverifikasi → banner + tombol kirim ulang email
- Akun suspended → pesan hubungi dukungan
- Rate limit → pesan tunggu beberapa menit

---

## SCR-PUB-04: Verifikasi Email

**Route**: `/verify-email`

**Deskripsi**: Halaman konfirmasi setelah registrasi, meminta pengguna cek email.

**Komponen**:
- Ilustrasi amplop
- Judul: "Cek Email Anda"
- Teks: "Kami telah mengirim tautan verifikasi ke [email]"
- Tombol: "Kirim Ulang Email"
- Link: "Ganti email?"
- Timer countdown kirim ulang (misal: 60 detik)

**State**: Loading saat kirim ulang, success state, error state

---

## SCR-PUB-05: Konfirmasi Verifikasi Email

**Route**: `/verify-email/confirm?token=...`

**Deskripsi**: Halaman yang terbuka saat member klik tautan di email.

**State**:
- **Sukses**: Animasi centang, "Akun berhasil diverifikasi!", CTA "Mulai Sekarang"
- **Expired**: "Tautan sudah kedaluwarsa", tombol "Kirim Ulang"
- **Sudah digunakan**: "Akun sudah aktif", tombol "Login"

---

## SCR-PUB-06: Lupa Kata Sandi

**Route**: `/forgot-password`

**Komponen**:
- Input email
- Tombol "Kirim Tautan Reset"
- Setelah submit: ilustrasi + "Cek email Anda untuk tautan reset"

**Kondisi**: Pesan selalu generik (tidak mengkonfirmasi ada/tidaknya email)

---

## SCR-PUB-07: Reset Kata Sandi

**Route**: `/reset-password?token=...`

**Komponen**:
- Input: Kata Sandi Baru, Konfirmasi Kata Sandi Baru
- Password strength indicator
- Tombol "Simpan Kata Sandi Baru"

**State**:
- Token valid: tampilkan form
- Token expired: "Tautan tidak valid atau kedaluwarsa", CTA "Minta Tautan Baru"
- Sukses: "Kata sandi berhasil diperbarui", CTA "Login Sekarang"

---

# 3. Area Member (Dengan Login)

## SCR-MEM-01: Dashboard Utama

**Route**: `/dashboard`

**Deskripsi**: Halaman utama setelah login. Menampilkan semua langganan aktif.

**Komponen**:
- Header: Salam ("Halo, [Nama]!"), avatar
- Subtitle: "Kelola semua langgananmu"
- Daftar kartu produk (Product Card) per langganan
- Tombol: "+ Tambah Produk" (jika belum punya semua produk)
- Banner Grace Period (jika ada lisensi grace_period)
- Bottom Navigation

**Empty State**: Ilustrasi + "Belum ada produk aktif" + CTA "Jelajahi Produk"

---

## SCR-MEM-02: Katalog Produk

**Route**: `/products`

**Deskripsi**: Daftar semua produk SaaS yang tersedia di ekosistem.

**Komponen**:
- Grid/list kartu produk:
  - Logo, nama, deskripsi singkat
  - Label paket tersedia (Free, Pro, dll.)
  - Status member untuk produk ini (Belum Aktif / Aktif)
  - CTA "Lihat Paket" atau "Sudah Aktif"

---

## SCR-MEM-03: Detail Produk & Pilih Paket

**Route**: `/products/[product-code]`

**Deskripsi**: Halaman detail produk dengan perbandingan paket.

**Komponen**:
- Hero produk: logo, nama, deskripsi
- Toggle Bulanan / Tahunan (untuk produk berbayar)
- Kartu paket: nama, harga, daftar fitur, CTA "Pilih Paket"
- Produk aktif yang sudah dimiliki member ditandai khusus

---

## SCR-MEM-04: Checkout

**Route**: `/checkout/[order-id]`

**Deskripsi**: Halaman konfirmasi order sebelum pembayaran.

**Komponen**:
- Progress: "Pilih Paket → Pembayaran → Konfirmasi"
- Ringkasan order: produk, paket, harga, durasi
- Pilihan payment gateway: kartu Midtrans / Xendit (radio button dengan logo)
- Tombol "Lanjutkan Bayar"

---

## SCR-MEM-05: Menunggu Pembayaran

**Route**: `/checkout/[order-id]/waiting`

**Deskripsi**: Halaman setelah diarahkan ke payment gateway, menunggu konfirmasi.

**Komponen**:
- Animasi loading / spinner
- Teks: "Menunggu konfirmasi pembayaran..."
- Instruksi singkat sesuai metode pembayaran
- Link: "Kembali ke Dashboard"

---

## SCR-MEM-06: Pembayaran Berhasil / Lisensi Aktif

**Route**: `/checkout/[order-id]/success`

**Deskripsi**: Halaman konfirmasi setelah pembayaran berhasil.

**Komponen**:
- Animasi: lingkaran hijau + centang
- Judul: "Lisensi Aktif!"
- Subjudul: "Selamat! [Nama Produk] sudah siap digunakan"
- Kartu License-ID (monospace + copy button)
- Keterangan: "Kami juga telah mengirim email konfirmasi"
- CTA: "Buka [Nama Produk] Sekarang →" (primary)
- Link: "Kembali ke Dashboard"

---

## SCR-MEM-07: Pembayaran Gagal

**Route**: `/checkout/[order-id]/failed`

**Komponen**:
- Ikon X merah
- Judul: "Pembayaran Tidak Berhasil"
- Keterangan singkat alasan
- CTA: "Coba Lagi" (primary)
- Link: "Kembali ke Dashboard"

---

## SCR-MEM-08: Detail Lisensi

**Route**: `/licenses/[license-id]`

**Deskripsi**: Halaman detail satu lisensi produk.

**Komponen**:
- Nama produk + logo
- Status badge
- License-ID (monospace, copy button)
- Paket aktif (tier)
- Tanggal aktivasi
- Masa aktif / tanggal berakhir
- Tombol aksi: "Buka Aplikasi", "Perpanjang" (jika berbayar), "Upgrade"
- Banner Grace Period (jika berstatus grace_period)

---

## SCR-MEM-09: Riwayat Pembayaran

**Route**: `/billing/history`

**Deskripsi**: Daftar semua transaksi pembayaran member.

**Komponen**:
- List/tabel transaksi: tanggal, produk, paket, jumlah, status
- Filter: semua / berhasil / gagal
- Tombol "Unduh Invoice" per transaksi
- Pagination

**Empty State**: "Belum ada riwayat transaksi"

---

## SCR-MEM-10: Profil Akun

**Route**: `/profile`

**Deskripsi**: Halaman pengelolaan profil member.

**Tab**:
- **Profil**: Nama, email, nomor telepon, foto, tombol simpan
- **Keamanan**: Ubah kata sandi, riwayat sesi aktif
- **Preferensi**: Toggle tema (Dark/Light), preferensi notifikasi

---

## SCR-MEM-11: Ubah Kata Sandi

**Route**: `/profile/change-password`

**Komponen**:
- Input: Kata Sandi Saat Ini, Kata Sandi Baru, Konfirmasi
- Password strength indicator
- Tombol "Simpan"

---

## SCR-MEM-12: Grace Period Warning

**Route**: Overlay/banner di semua halaman

**Deskripsi**: Banner mendesak yang tampil saat ada lisensi dalam status grace_period.

**Komponen**:
- Background: kuning/amber
- Ikon peringatan
- Teks: "Langganan [Produk] Anda akan berakhir dalam [X hari]"
- CTA: "Perpanjang Sekarang"
- Tombol tutup (X) — banner muncul lagi besok

---

# 4. Area Super Admin

## SCR-ADM-01: Login Admin

**Route**: `/admin/login`

**Komponen**: Form login admin (terpisah dari login member)

---

## SCR-ADM-02: Dashboard Admin

**Route**: `/admin`

**Komponen**:
- Statistik: total member, total lisensi aktif, pendapatan bulan ini
- Grafik: registrasi per hari, transaksi per minggu
- Alert: lisensi yang akan expire dalam 7 hari

---

## SCR-ADM-03: Manajemen Member

**Route**: `/admin/members`

**Komponen**: Tabel member, filter, search, aksi (lihat detail, suspend, aktifkan)

---

## SCR-ADM-04: Detail Member (Admin)

**Route**: `/admin/members/[member-id]`

**Komponen**: Profil, daftar lisensi, riwayat transaksi, log aktivitas, tombol aksi admin

---

## SCR-ADM-05: Manajemen Produk

**Route**: `/admin/products`

**Komponen**: Daftar produk, tambah produk, edit, nonaktifkan

---

## SCR-ADM-06: Manajemen Paket

**Route**: `/admin/products/[product-code]/plans`

**Komponen**: Daftar paket per produk, tambah paket, edit harga & fitur, nonaktifkan

---

## SCR-ADM-07: Laporan Transaksi

**Route**: `/admin/billing`

**Komponen**: Tabel transaksi, filter tanggal/produk/status, export CSV

---

## SCR-ADM-08: Konfigurasi OAuth2 Client

**Route**: `/admin/oauth-clients`

**Komponen**: Daftar aplikasi SaaS terdaftar, tambah client, regenerate secret

---

# 5. Halaman Sistem

## SCR-SYS-01: 404 Not Found

Ikon ilustrasi + pesan + CTA kembali ke dashboard.

## SCR-SYS-02: 403 Forbidden

Pesan akses ditolak + CTA sesuai konteks.

## SCR-SYS-03: 500 Server Error

Pesan generik "Sedang ada gangguan" + tombol coba lagi.

## SCR-SYS-04: Maintenance Mode

Ilustrasi + teks "Sedang dalam pemeliharaan" + estimasi waktu (jika ada).

---

# 6. Ringkasan Jumlah Screen

| Area | Jumlah Screen |
|---|---|
| Publik (tanpa login) | 7 |
| Member (dengan login) | 12 |
| Super Admin | 8 |
| Sistem | 4 |
| **Total** | **31** |
