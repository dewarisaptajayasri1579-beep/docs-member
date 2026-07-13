# Glossary — Central Membership & SSO Hub

Dokumen ini berisi istilah teknis dan bisnis yang digunakan dalam sistem Central Membership & SSO Hub.

## A

### Akun Member

Identitas utama pengguna dalam ekosistem SaaS. Satu akun member dapat memiliki beberapa lisensi untuk produk yang berbeda.

### Aktivasi Lisensi

Proses mengaktifkan hak akses pengguna terhadap suatu produk SaaS. Aktivasi dapat terjadi secara otomatis (paket gratis) atau setelah pembayaran berhasil (paket berbayar).

### Audit Log

Catatan setiap tindakan penting yang terjadi dalam sistem, mencakup siapa pelakunya, kapan, dan apa yang dilakukan.

## C

### Callback / Webhook

Notifikasi otomatis yang dikirim oleh payment gateway ke sistem setelah transaksi selesai (berhasil atau gagal). Callback digunakan untuk memicu aktivasi lisensi secara otomatis.

### Checkout

Proses pemilihan paket dan penyelesaian pembayaran oleh pengguna.

## G

### Grace Period

Masa tenggang setelah langganan berbayar berakhir namun pengguna belum memperpanjang. Selama Grace Period, pengguna masih dapat mengakses aplikasi dengan peringatan, namun setelah masa ini berakhir akses akan ditangguhkan.

## I

### Invoice

Bukti transaksi pembayaran yang dikirimkan ke email pengguna setelah pembayaran berhasil.

## J

### JWT (JSON Web Token)

Token keamanan standar industri yang diterbitkan oleh Membership Hub setelah pengguna berhasil login. Token ini berisi informasi terenkripsi mengenai identitas pengguna, produk yang dilisensikan, dan masa berlakunya.

Token JWT diverifikasi oleh setiap aplikasi SaaS untuk memastikan pengguna memiliki akses yang sah.

## L

### License-ID

Kode unik yang dihasilkan sistem untuk setiap langganan aktif milik seorang pengguna pada satu produk tertentu.

Format:

```
[PREFIX_PRODUK]-[XXXX]-[XXXX]-[XXXX]
```

Contoh:

```
NTO-A1B2-C3D4-E5F6
```

Satu pengguna dapat memiliki beberapa License-ID jika berlangganan beberapa produk.

### Lisensi

Hak akses resmi yang diberikan kepada pengguna untuk menggunakan suatu produk SaaS berdasarkan paket yang dipilih.

## M

### Member

Pengguna yang telah memiliki akun di Membership Hub. Member dapat berlangganan satu atau lebih produk SaaS.

### Midtrans

Payment gateway Indonesia yang mendukung berbagai metode pembayaran, termasuk transfer bank, kartu kredit, dan dompet digital.

## O

### OAuth2

Protokol otorisasi standar industri yang digunakan sebagai dasar implementasi SSO. Memungkinkan aplikasi pihak ketiga (SaaS app) mendapatkan akses atas nama pengguna tanpa mengetahui kata sandi mereka.

## P

### Paket (Plan)

Tingkatan layanan yang ditawarkan untuk suatu produk SaaS. Setiap produk mendefinisikan paketnya sendiri.

Contoh jenis paket:

- **Free / Gratis**: Aktif tanpa pembayaran.
- **Pro**: Berbayar bulanan atau tahunan.
- **Business**: Berbayar dengan fitur lebih lengkap.

### Payment Gateway

Layanan pihak ketiga yang memproses transaksi pembayaran antara pengguna dan sistem.

### Product (Produk)

Setiap aplikasi SaaS yang terdaftar dalam ekosistem dan dapat diakses melalui Membership Hub.

### Product Code

Kode singkat yang mengidentifikasi setiap produk SaaS.

Contoh:

- `NTO` untuk NOTO.

Kode ini digunakan sebagai prefix pada License-ID.

## R

### Renewal (Perpanjangan)

Proses memperpanjang langganan berbayar setelah masa aktif habis. Dapat dilakukan sebelum atau selama Grace Period.

## S

### SSO (Single Sign-On)

Mekanisme yang memungkinkan pengguna login satu kali di Membership Hub dan mendapatkan akses ke semua aplikasi yang memiliki lisensi aktif tanpa harus login ulang secara terpisah.

### Subscription

Langganan aktif yang dimiliki pengguna untuk suatu produk. Setiap subscription memiliki status, paket, masa aktif, dan License-ID.

### Suspend

Status akun atau lisensi yang ditangguhkan karena langganan berbayar berakhir dan Grace Period telah habis. Pengguna tidak dapat mengakses aplikasi selama berstatus suspend.

## T

### Tier / Level Paket

Tingkatan paket yang menentukan fitur dan batasan yang tersedia bagi pengguna.

### Token

Lihat **JWT**.

## V

### Verifikasi Email

Proses konfirmasi bahwa email yang digunakan saat registrasi valid dan dimiliki oleh pengguna, melalui tautan yang dikirimkan ke email tersebut.

## W

### Webhook

Lihat **Callback**.

### Xendit

Payment gateway Indonesia yang mendukung berbagai metode pembayaran, termasuk transfer bank, e-wallet, kartu kredit, dan QRIS.

## Istilah yang Tidak Boleh Disamakan

### License-ID dan Password

- License-ID adalah kode pengenal lisensi produk, bukan pengganti password.
- Password adalah kredensial login akun member.

### Paket dan Produk

- Produk adalah aplikasi SaaS yang dilisensikan.
- Paket adalah tingkatan layanan dalam satu produk.

### Suspend dan Hapus Akun

- Suspend menangguhkan akses sementara.
- Hapus akun menghapus seluruh data secara permanen (jika diizinkan).

### Grace Period dan Trial

- Grace Period adalah masa tenggang setelah langganan berbayar berakhir.
- Trial adalah masa percobaan sebelum pengguna memutuskan untuk berlangganan.
