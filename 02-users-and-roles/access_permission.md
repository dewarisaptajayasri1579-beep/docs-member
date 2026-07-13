# Access and Permissions — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan hak akses setiap role terhadap modul, data, dan tindakan di dalam sistem Central Membership & SSO Hub.

Dokumen ini menjadi dasar implementasi:

- authorization,
- middleware backend,
- API permission,
- route protection,
- dan pengujian akses.

## 2. Role yang Digunakan

- **Member**: Pengguna akhir pemilik akun.
- **System**: Proses otomatis backend (webhook, scheduler, notifikasi).
- **Super Admin**: Tim internal pengelola platform.

## 3. Prinsip Permission

1. Semua akses ditolak secara default.
2. Akses diberikan hanya jika didefinisikan secara eksplisit.
3. Member hanya dapat mengakses data miliknya sendiri.
4. System hanya dapat memproses data dalam konteks proses yang sah.
5. Super Admin tidak dapat melihat kata sandi member.
6. Frontend tidak boleh menjadi satu-satunya lapisan pengamanan.
7. Backend wajib memvalidasi role dan kepemilikan data pada setiap request.

## 4. Definisi Jenis Akses

| Kode | Arti |
|---|---|
| `View` | Melihat data |
| `Create` | Membuat data baru |
| `Update` | Mengubah data |
| `Delete` | Menghapus atau membatalkan data |
| `Process` | Menjalankan proses otomatis |
| `Manage` | Mengelola keseluruhan (CRUD penuh) |
| `None` | Tidak memiliki akses |

---

# 5. Matriks Akses Utama

| Modul / Aktivitas | Member | System | Super Admin |
|---|---|---|---|
| **Akun & Autentikasi** | | | |
| Registrasi akun | `Create` | `Process` | `None` |
| Verifikasi email | `Process` | `Process` | `None` |
| Login ke Hub | `Process` | `None` | `Process` |
| Logout | `Process` | `None` | `Process` |
| Lupa & reset kata sandi | `Process` | `Process` | `None` |
| Melihat profil sendiri | `View` | `None` | `None` |
| Mengubah profil sendiri | `Update` | `None` | `None` |
| Melihat profil member lain | `None` | `None` | `View` (terbatas) |
| Menonaktifkan akun sendiri | `Update` | `None` | `None` |
| Menonaktifkan akun member | `None` | `None` | `Update` |
| **Produk & Paket** | | | |
| Melihat katalog produk | `View` | `None` | `View` |
| Melihat daftar paket produk | `View` | `None` | `View` |
| Mengelola produk (tambah/ubah) | `None` | `None` | `Manage` |
| Mengelola paket (tambah/ubah/harga) | `None` | `None` | `Manage` |
| Menonaktifkan paket | `None` | `None` | `Update` |
| **Lisensi** | | | |
| Mengaktifkan paket gratis | `Create` | `None` | `None` |
| Melihat lisensi sendiri | `View` | `Process` | `None` |
| Melihat License-ID sendiri | `View` | `Process` | `None` |
| Mengaktifkan lisensi (setelah bayar) | `None` | `Process` | `None` |
| Menangguhkan lisensi (suspend) | `None` | `Process` | `Update` |
| Memulihkan lisensi (setelah bayar) | `None` | `Process` | `Update` |
| Membatalkan lisensi | `None` | `None` | `Update` |
| Melihat semua lisensi member | `None` | `None` | `View` |
| **Checkout & Pembayaran** | | | |
| Membuat order checkout | `Create` | `None` | `None` |
| Memilih payment gateway | `Update` | `None` | `None` |
| Menerima webhook pembayaran | `None` | `Process` | `None` |
| Memverifikasi webhook | `None` | `Process` | `None` |
| Melihat riwayat pembayaran sendiri | `View` | `None` | `None` |
| Mengunduh invoice sendiri | `View` | `None` | `None` |
| Melihat semua transaksi | `None` | `None` | `View` |
| Memproses refund manual | `None` | `None` | `Update` |
| **SSO & Token** | | | |
| Login via SSO (meminta auth code) | `Process` | `None` | `None` |
| Menukar auth code dengan token | `None` | `Process` | `None` |
| Menerbitkan JWT | `None` | `Process` | `None` |
| Refresh access token | `Process` | `Process` | `None` |
| Logout SSO | `Process` | `None` | `None` |
| Mencabut refresh token | `None` | `Process` | `Update` |
| **Notifikasi & Email** | | | |
| Mengatur preferensi notifikasi | `Update` | `None` | `None` |
| Mengirim email otomatis | `None` | `Process` | `None` |
| Melihat log pengiriman email | `None` | `None` | `View` |
| **Super Admin Panel** | | | |
| Mengakses panel admin | `None` | `None` | `View` |
| Melihat statistik agregat | `None` | `Process` | `View` |
| Melihat daftar member | `None` | `None` | `View` |
| Melihat detail akun member | `None` | `None` | `View` (terbatas) |
| Melihat error log | `None` | `Process` | `View` |
| Melihat audit log | `None` | `None` | `View` |
| Mengelola konfigurasi sistem | `None` | `None` | `Manage` |
| Mendaftarkan OAuth2 client baru | `None` | `None` | `Manage` |

---

# 6. Permission Berdasarkan Modul

## 6.1 Autentikasi & Profil

### Member
- Dapat mendaftar, login, logout, dan reset kata sandi.
- Dapat melihat dan mengubah profil sendiri.
- Tidak dapat melihat atau mengubah data member lain.

### System
- Dapat memvalidasi kredensial saat login.
- Dapat mengirim email verifikasi dan reset kata sandi.
- Dapat membuat dan mengakhiri sesi.

### Super Admin
- Dapat melihat data administratif member (nama, email, status akun, tanggal daftar).
- Tidak dapat melihat kata sandi member dalam bentuk apapun.
- Dapat mengaktifkan atau menonaktifkan akun member.

---

## 6.2 Produk & Paket

### Member
- Dapat melihat katalog produk dan daftar paket yang tersedia.
- Tidak dapat mengubah produk atau paket.

### System
- Tidak memiliki akses langsung ke pengelolaan produk.

### Super Admin
- Dapat menambah produk baru ke ekosistem.
- Dapat mengelola paket per produk (nama, harga, durasi, fitur).
- Dapat menonaktifkan paket yang tidak lagi ditawarkan.

---

## 6.3 Lisensi

### Member
- Dapat mengaktifkan paket gratis secara langsung.
- Dapat melihat semua lisensi miliknya.
- Dapat melihat License-ID dan status lisensi.
- Tidak dapat mengaktifkan, menangguhkan, atau membatalkan lisensi secara langsung (kecuali melalui proses yang sah).

### System
- Mengaktifkan lisensi setelah konfirmasi webhook pembayaran sukses.
- Memperbarui status lisensi secara otomatis (active → grace_period → suspended).
- Tidak dapat mengaktifkan lisensi tanpa konfirmasi pembayaran yang valid.

### Super Admin
- Dapat melihat semua lisensi seluruh member.
- Dapat menangguhkan atau memulihkan lisensi secara manual dalam kondisi tertentu.
- Setiap tindakan manual dicatat di audit log.

---

## 6.4 Checkout & Pembayaran

### Member
- Dapat memulai checkout dan memilih payment gateway.
- Dapat melihat riwayat pembayaran dan mengunduh invoice miliknya sendiri.
- Tidak dapat mengubah atau menghapus riwayat transaksi.

### System
- Menerima dan memverifikasi webhook dari payment gateway.
- Mengaktifkan lisensi setelah konfirmasi sukses.
- Mencatat setiap transaksi.

### Super Admin
- Dapat melihat seluruh transaksi platform.
- Dapat memproses refund manual jika diperlukan.

---

## 6.5 SSO & Token

### Member
- Dapat memulai alur login SSO ke aplikasi SaaS.
- Dapat melakukan refresh token.
- Tidak dapat menerbitkan JWT secara langsung.

### System
- Menerbitkan JWT setelah validasi berhasil.
- Memverifikasi refresh token.
- Mencabut token jika lisensi tidak aktif.

### Super Admin
- Dapat mencabut refresh token member jika diperlukan (misal: kasus keamanan).

---

# 7. Aturan Ownership Data

Setiap request ke data pribadi member harus memvalidasi:

```text
resource.member_id == authenticated_member.id
```

Data yang wajib memiliki ownership:

- profil,
- lisensi,
- transaksi pembayaran,
- invoice,
- preferensi notifikasi,
- dan refresh token.

## 7.1 Validasi Backend

Backend wajib:

- memeriksa member sudah login,
- memeriksa role,
- memeriksa kepemilikan data,
- memeriksa status akun (`active`),
- dan menolak akses jika salah satu syarat tidak terpenuhi.

## 7.2 Respons Akses Ditolak

| Kondisi | HTTP Status |
|---|---|
| Belum login | `401 Unauthorized` |
| Tidak punya permission | `403 Forbidden` |
| Data tidak boleh diketahui keberadaannya | `404 Not Found` |

---

# 8. Permission pada Antarmuka (Frontend)

Frontend harus:

- menyembunyikan menu yang tidak tersedia untuk role yang sedang aktif,
- menonaktifkan tombol yang tidak boleh digunakan,
- tidak memuat data yang tidak dibutuhkan,
- dan menampilkan pesan akses yang jelas jika ditolak.

Namun, penyembunyian di frontend **bukan pengamanan utama**. Backend tetap wajib melakukan validasi pada setiap request.

---

# 9. Acceptance Criteria Permission

Implementasi permission dianggap selesai jika:

- member tidak dapat melihat data member lain,
- member hanya dapat mengubah data miliknya sendiri,
- lisensi hanya aktif setelah konfirmasi webhook yang valid,
- System tidak dapat mengaktifkan lisensi tanpa sumber yang sah,
- Super Admin tidak dapat melihat kata sandi member,
- seluruh endpoint memiliki validasi akses,
- akses ditolak dengan respons HTTP yang tepat,
- dan tindakan administratif penting tercatat di audit log.
