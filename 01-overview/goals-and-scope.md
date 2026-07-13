# Goals and Scope — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan tujuan produk, sasaran pengembangan, dan ruang lingkup sistem Central Membership & SSO Hub.

## 2. Product Goal

Menjadi sistem identitas dan lisensi terpusat yang:

1. **Menyederhanakan** pengalaman registrasi dan login pengguna di seluruh ekosistem SaaS.
2. **Mengelola** siklus hidup langganan (aktivasi, perpanjangan, penangguhan) secara otomatis.
3. **Mengamankan** akses ke setiap aplikasi melalui mekanisme SSO berbasis JWT.
4. **Mendukung** pertumbuhan ekosistem dengan kemampuan menambah produk baru tanpa mengubah arsitektur inti.

## 3. Member Goal

Pengguna (Member) dapat:

- mendaftar satu kali dan mengakses semua produk yang tersedia,
- melihat semua langganan aktif dalam satu dashboard,
- mengaktifkan produk baru dengan mudah,
- melakukan pembayaran dengan metode yang beragam,
- mendapatkan License-ID untuk setiap produk yang diaktifkan,
- dan masuk ke setiap aplikasi tanpa harus login ulang secara terpisah.

## 4. Business Goal

- Membangun fondasi ekosistem multi-SaaS yang dapat berkembang secara modular.
- Memusatkan pengelolaan identitas, lisensi, dan billing dalam satu sistem.
- Memungkinkan setiap produk SaaS fokus pada fitur utamanya tanpa harus membangun sistem autentikasi dan billing sendiri.
- Membuka peluang model revenue berbasis langganan yang terukur.

## 5. Development Goal

- Sistem harus dapat menambahkan produk SaaS baru hanya dengan konfigurasi, tanpa perubahan kode inti.
- Integrasi SSO ke setiap aplikasi harus menggunakan standar yang didokumentasikan dengan jelas.
- Semua aturan bisnis harus terdokumentasi sebelum diimplementasikan.
- Programmer tidak boleh membuat asumsi tentang aturan lisensi atau billing yang belum didefinisikan.

## 6. Ruang Lingkup Versi Awal

### 6.1 Manajemen Akun Member

- registrasi dengan email dan password,
- verifikasi email,
- login dan logout,
- lupa kata sandi,
- pengelolaan profil dasar.

### 6.2 Katalog Produk & Paket

- menampilkan daftar produk SaaS yang tersedia,
- menampilkan paket per produk (Free, Paid),
- memberikan informasi fitur dan harga per paket.

### 6.3 Aktivasi Lisensi

- aktivasi paket gratis secara langsung tanpa pembayaran,
- pembuatan License-ID otomatis setelah aktivasi,
- tampilan License-ID di dashboard dan pengiriman ke email.

### 6.4 Pembayaran (Untuk Produk Berbayar)

- checkout menggunakan Midtrans atau Xendit,
- aktivasi lisensi otomatis setelah pembayaran sukses,
- penyimpanan riwayat transaksi pembayaran,
- pengiriman invoice ke email.

### 6.5 Manajemen Lisensi

- melihat daftar lisensi aktif,
- melihat status dan masa aktif per lisensi,
- melihat License-ID per produk,
- perpanjangan langganan,
- dan penanganan Grace Period.

### 6.6 SSO (Single Sign-On)

- login terpusat di Membership Hub,
- penerbitan JWT token berisi informasi pengguna dan lisensi,
- verifikasi token oleh aplikasi SaaS,
- dan penanganan token kedaluwarsa.

### 6.7 Dashboard Member

- ringkasan semua langganan,
- status setiap produk,
- riwayat pembayaran,
- dan akses cepat ke setiap aplikasi.

### 6.8 Notifikasi

- email verifikasi akun,
- email konfirmasi aktivasi lisensi,
- email invoice pembayaran,
- notifikasi mendekati masa kedaluwarsa,
- notifikasi Grace Period,
- dan notifikasi penangguhan akses.

## 7. Di Luar Ruang Lingkup Versi Awal

- manajemen tim atau multi-user dalam satu organisasi,
- billing berbasis penggunaan (usage-based),
- sistem referral atau kode promo,
- integrasi dengan marketplace pihak ketiga,
- manajemen reseller atau partner,
- laporan keuangan akuntansi bisnis lengkap,
- dan payment gateway selain Midtrans dan Xendit.

## 8. Produk Saat Ini

| Produk | Model | Status |
|---|---|---|
| NOTO | Gratis Selamanya (Free Forever) | Aktif |

## 9. Indikator Keberhasilan

Sistem dianggap berhasil jika:

- Member dapat mendaftar dan mengaktifkan NOTO dalam satu sesi,
- License-ID diterima melalui email dan tampil di dashboard,
- Member dapat login ke NOTO melalui SSO tanpa hambatan,
- Penambahan produk berbayar baru tidak memerlukan perubahan arsitektur inti,
- Seluruh proses payment gateway berjalan secara otomatis tanpa intervensi manual.

## 10. Definition of Done

Sebuah fitur dianggap selesai jika:

- sesuai dengan dokumentasi ini,
- alur utama berjalan tanpa error,
- alur pembayaran bersifat atomic (tidak tersimpan sebagian),
- SSO menghasilkan token yang dapat diverifikasi oleh aplikasi,
- notifikasi email terkirim,
- seluruh data sensitif terproteksi,
- dan telah diuji sesuai acceptance criteria.
