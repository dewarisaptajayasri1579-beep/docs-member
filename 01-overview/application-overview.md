# Application Overview — Central Membership & SSO Hub

## 1. Nama Sistem

**Central Membership & SSO Hub**

Tagline:

> **Satu Akun, Semua Aplikasi.**

## 2. Ringkasan Sistem

Central Membership & SSO Hub adalah sistem terpusat yang berfungsi sebagai:

- **Pusat Identitas**: Satu akun untuk mengakses semua produk SaaS dalam ekosistem.
- **Pusat Lisensi**: Mengelola lisensi setiap produk per pengguna.
- **Pusat Billing**: Menangani pemilihan paket dan pembayaran langganan.
- **SSO Provider**: Menerbitkan token autentikasi (JWT) yang diterima oleh setiap aplikasi SaaS.

## 3. Latar Belakang

Setiap produk SaaS dalam ekosistem memiliki fungsi yang berbeda-beda. Tanpa sistem identitas terpusat, pengguna harus mendaftar, mengelola kata sandi, dan membayar secara terpisah untuk setiap aplikasi.

Central Membership Hub hadir untuk menyederhanakan pengalaman ini dengan:

- satu kali registrasi untuk semua produk,
- satu dashboard untuk melihat semua langganan,
- satu proses login (SSO) untuk masuk ke semua aplikasi,
- dan satu tempat untuk mengelola pembayaran.

## 4. Produk SaaS yang Terdaftar

Setiap produk SaaS yang bergabung ke ekosistem ini akan terdaftar sebagai **Product** di dalam sistem.

Produk pertama yang terdaftar:

| Kode Produk | Nama Aplikasi | Model Paket | Status |
|---|---|---|---|
| NTO | NOTO | Gratis Selamanya (Free Forever) | Aktif |

Produk berikutnya akan ditambahkan sesuai roadmap.

## 5. Konsep Utama

### 5.1 Akun Member

Akun Member adalah identitas utama pengguna dalam ekosistem.

Satu Akun Member dapat memiliki:

- beberapa langganan produk yang berbeda,
- masing-masing dengan License-ID yang unik,
- dan status paket yang berbeda-beda per produk.

### 5.2 License-ID

License-ID adalah kode unik yang dihasilkan sistem setiap kali pengguna mengaktifkan langganan untuk satu produk.

Format:

```
[PREFIX_PRODUK]-[XXXX]-[XXXX]-[XXXX]
```

Contoh untuk NOTO:

```
NTO-A1B2-C3D4-E5F6
```

License-ID:

- bersifat unik per pengguna per produk,
- ditampilkan di dashboard member,
- dikirim ke email,
- dan digunakan untuk referensi dukungan.

### 5.3 Paket Langganan (Per Produk)

Setiap produk memiliki daftar paketnya sendiri.

Jenis paket yang tersedia:

- **Free / Gratis**: Aktif tanpa pembayaran. Tidak ada masa kedaluwarsa.
- **Trial**: Akses penuh selama periode terbatas.
- **Paid**: Berlangganan bulanan atau tahunan.

Saat ini, **NOTO** menawarkan paket **Gratis Selamanya** dengan akses fitur penuh.

### 5.4 Single Sign-On (SSO)

Pengguna cukup login satu kali di Membership Hub untuk mengakses semua aplikasi yang memiliki lisensi aktif.

Mekanisme SSO menggunakan JWT (JSON Web Token) yang diterbitkan oleh Hub dan diverifikasi oleh masing-masing aplikasi.

### 5.5 Grace Period

Ketika langganan berbayar berakhir dan pengguna belum memperpanjang, sistem memberikan **Grace Period** sebelum akses ditangguhkan.

Selama Grace Period:

- pengguna masih dapat mengakses aplikasi,
- sistem menampilkan notifikasi mendesak untuk memperpanjang,
- dan data pengguna tetap aman.

Setelah Grace Period berakhir tanpa perpanjangan, akses ditangguhkan.

## 6. Payment Gateway

Sistem mendukung dua payment gateway:

- **Midtrans**
- **Xendit**

Pengguna dapat memilih metode pembayaran yang tersedia pada saat checkout.

## 7. Modul Utama

Modul utama sistem:

1. Registrasi & Verifikasi Akun
2. Manajemen Profil Member
3. Katalog Produk & Paket
4. Checkout & Pembayaran
5. Manajemen Lisensi
6. SSO / OAuth2 Server
7. Notifikasi & Email
8. Dashboard Super Admin
9. Audit Log

## 8. Prinsip Pengembangan

- Data keuangan dan identitas pengguna harus diproteksi dengan standar keamanan tertinggi.
- Setiap aplikasi SaaS tidak boleh menyimpan data password pengguna (didelegasikan ke Hub).
- Proses pembayaran tidak boleh tersimpan sebagian jika terjadi kegagalan.
- Sistem harus dapat menambahkan produk baru tanpa mengubah arsitektur utama.
- License-ID harus dapat diverifikasi oleh aplikasi secara independen menggunakan JWT.
- Grace Period harus dikomunikasikan dengan jelas kepada pengguna sebelum akses ditangguhkan.
