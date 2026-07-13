# User Roles — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan role yang berinteraksi dengan sistem Central Membership & SSO Hub, tanggung jawab masing-masing role, dan batasannya.

## 2. Daftar Role

Sistem memiliki tiga role utama:

1. Member
2. System
3. Super Admin

---

# 3. Role: Member

## 3.1 Definisi

Member adalah pengguna akhir yang mendaftar dan menggunakan layanan Membership Hub untuk mengakses satu atau lebih produk SaaS dalam ekosistem.

## 3.2 Tujuan

Member menggunakan sistem untuk:

- mendaftarkan akun,
- mengaktifkan lisensi produk,
- melakukan pembayaran langganan,
- melihat License-ID,
- dan masuk ke aplikasi melalui SSO.

## 3.3 Hak Utama Member

Member dapat:

- registrasi dan login,
- memverifikasi email,
- melihat dan mengubah profil,
- melihat daftar produk yang tersedia,
- melihat paket per produk,
- mengaktifkan paket gratis,
- melakukan checkout paket berbayar,
- melihat semua lisensi aktif miliknya,
- melihat License-ID per produk,
- melihat masa aktif lisensi,
- memperpanjang langganan,
- melihat riwayat pembayaran,
- mengunduh invoice,
- dan masuk ke aplikasi melalui SSO.

## 3.4 Batasan Member

Member tidak dapat:

- melihat data member lain,
- mengelola konfigurasi sistem,
- mengelola daftar produk dan paket,
- mengubah harga paket,
- mengakses panel Super Admin,
- dan memverifikasi JWT token secara langsung.

## 3.5 Kepemilikan Data

Semua data berikut terhubung ke member pemiliknya:

- profil,
- lisensi,
- transaksi pembayaran,
- invoice,
- dan preferensi notifikasi.

---

# 4. Role: System

## 4.1 Definisi

System adalah proses otomatis yang menjalankan fungsi-fungsi backend, termasuk integrasi payment gateway, penerbitan token, dan pengiriman notifikasi.

## 4.2 Tanggung Jawab System

System bertanggung jawab untuk:

- menerima callback dari payment gateway,
- memverifikasi status pembayaran,
- mengaktifkan atau menangguhkan lisensi secara otomatis,
- menghasilkan License-ID,
- menerbitkan JWT token saat SSO,
- menghitung masa kedaluwarsa lisensi,
- memantau Grace Period dan mengirim notifikasi,
- menangguhkan akses setelah Grace Period habis,
- dan mencatat seluruh proses ke audit log.

## 4.3 Batasan System

System tidak boleh:

- mengaktifkan lisensi berbayar tanpa konfirmasi pembayaran yang valid,
- mengirim token kepada pengguna yang lisensinya tidak aktif,
- mengubah data member tanpa proses yang terdefinisi,
- dan menghapus data transaksi pembayaran.

---

# 5. Role: Super Admin

## 5.1 Definisi

Super Admin adalah role internal untuk mengelola platform Membership Hub secara keseluruhan.

## 5.2 Tanggung Jawab Super Admin

Super Admin bertanggung jawab untuk:

- mengelola daftar produk SaaS yang terdaftar,
- mengelola paket per produk (nama, harga, durasi, fitur),
- memantau status member dan lisensi,
- mengelola konfigurasi payment gateway,
- melihat laporan transaksi,
- melihat error log,
- dan menangani kasus eskalasi (suspend, refund manual, dsb).

## 5.3 Hak Super Admin

Super Admin dapat:

- melihat daftar seluruh member,
- melihat status akun dan lisensi member,
- mengaktifkan atau menangguhkan akun member secara manual,
- mengelola produk dan paket,
- mengelola konfigurasi sistem,
- melihat statistik transaksi agregat,
- melihat laporan pendapatan,
- melihat error log dan audit log,
- dan melakukan tindakan administratif manual dalam kondisi tertentu.

## 5.4 Batasan Super Admin

Super Admin secara default tidak boleh:

- melihat kata sandi member,
- mengubah data keuangan pribadi dalam aplikasi SaaS (misal: transaksi di NOTO),
- mengakses data sensitif tanpa alasan dan prosedur yang terdokumentasi.

---

# 6. Ringkasan Peran

| Role | Fungsi Utama | Pemilik Data Member |
|---|---|---|
| Member | Mengakses produk dan mengelola langganan | Ya |
| System | Menjalankan proses otomatis backend | Tidak |
| Super Admin | Mengelola platform dan operasional | Tidak |

## 7. Prinsip Keamanan Role

- **Least Privilege**: Setiap role hanya mendapatkan akses sesuai kebutuhan tugasnya.
- **Data Ownership**: Data member hanya dapat diakses oleh member pemilik dan Super Admin dengan alasan yang sah.
- **Audit Trail**: Seluruh tindakan administratif penting dicatat.
- **Separation of Concerns**: Proses autentikasi, billing, dan lisensi dipisahkan secara logis.
