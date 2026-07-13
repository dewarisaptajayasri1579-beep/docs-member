# User Registration — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan spesifikasi fitur registrasi dan manajemen akun member, mulai dari pendaftaran pertama hingga pengelolaan profil.

---

# 2. Alur Registrasi

## 2.1 Langkah Registrasi

1. Member membuka halaman **Daftar** di Membership Hub.
2. Member mengisi formulir registrasi.
3. Sistem memvalidasi data.
4. Sistem membuat akun dengan status `unverified`.
5. Sistem mengirim email verifikasi.
6. Member mengklik tautan di email.
7. Sistem mengaktifkan akun ke status `active`.
8. Member diarahkan ke halaman dashboard atau pilih paket.

---

# 3. Formulir Registrasi

## 3.1 Field yang Diperlukan

| Field | Tipe | Wajib | Aturan Validasi |
|---|---|---|---|
| Nama Lengkap | Text | Ya | Min 2 karakter, max 100 karakter |
| Email | Email | Ya | Format valid, unik di sistem, dinormalisasi lowercase |
| Kata Sandi | Password | Ya | Min 8 karakter, kombinasi huruf dan angka |
| Konfirmasi Kata Sandi | Password | Ya | Harus sama dengan kata sandi |

## 3.2 Field Opsional

| Field | Tipe | Keterangan |
|---|---|---|
| Nomor Telepon | Text | Untuk keperluan komunikasi |

---

# 4. Aturan Validasi

## 4.1 Email

1. Harus berformat email yang valid.
2. Dinormalisasi menjadi huruf kecil (lowercase) dan ditrim sebelum disimpan.
   ```
   " Budi@Email.COM " → "budi@email.com"
   ```
3. Harus unik; tidak boleh ada dua akun dengan email yang sama.
4. Validasi dilakukan di frontend (UX) dan backend (keamanan).

## 4.2 Kata Sandi

1. Minimal 8 karakter.
2. Harus mengandung minimal satu huruf dan satu angka.
3. Tidak boleh sama persis dengan email.
4. Disimpan dalam bentuk **hash** menggunakan bcrypt atau Argon2 (tidak pernah plaintext).
5. Tidak pernah dikirim kembali ke client dalam bentuk apapun.

## 4.3 Nama Lengkap

1. Minimal 2 karakter.
2. Ditrim spasi di awal dan akhir.
3. Tidak boleh hanya berisi spasi atau karakter khusus.

---

# 5. Status Akun

| Status | Kode | Keterangan |
|---|---|---|
| Belum Diverifikasi | `unverified` | Baru daftar, email belum dikonfirmasi |
| Aktif | `active` | Email sudah diverifikasi, dapat login |
| Ditangguhkan | `suspended` | Dinonaktifkan oleh Super Admin |

Perpindahan status:

```
[unverified] → (klik tautan verifikasi) → [active]
[active]     → (dinonaktifkan admin)    → [suspended]
[suspended]  → (dipulihkan admin)       → [active]
```

---

# 6. Verifikasi Email

## 6.1 Mekanisme

- Sistem membuat **token verifikasi** unik saat registrasi.
- Token dikirim via email sebagai bagian dari tautan verifikasi:
  ```
  https://hub.domain.com/verify-email?token=VERIFICATION_TOKEN
  ```
- Token bersifat **one-time use**: tidak dapat digunakan lebih dari satu kali.
- Token memiliki masa berlaku **24 jam**.

## 6.2 Saat Member Mengklik Tautan

- Sistem memvalidasi token: ada, belum digunakan, belum expired.
- Jika valid: akun diubah ke `active`, token ditandai sudah digunakan.
- Jika expired: tampilkan halaman untuk kirim ulang email.
- Jika sudah digunakan: tampilkan pesan "Akun sudah aktif, silakan login."

## 6.3 Kirim Ulang Email Verifikasi

- Member dapat meminta kirim ulang selama akun masih `unverified`.
- Sistem membuat token baru dan mengirim email baru.
- Token lama otomatis tidak berlaku setelah token baru dibuat.
- Dibatasi maksimal: misal 3x kirim ulang per jam (rate limiting).

---

# 7. Lupa Kata Sandi

## 7.1 Alur

1. Member membuka halaman **Lupa Kata Sandi**.
2. Member memasukkan email.
3. Sistem mencari akun dengan email tersebut (dinormalisasi).
4. Jika akun ditemukan: kirim email berisi tautan reset kata sandi.
5. Jika akun tidak ditemukan: tampilkan pesan generik (tidak mengkonfirmasi ada/tidaknya email).
6. Member mengklik tautan di email.
7. Member memasukkan kata sandi baru.
8. Sistem memvalidasi kata sandi baru.
9. Sistem menyimpan hash kata sandi baru.
10. Semua sesi aktif lainnya diakhiri.
11. Member diarahkan ke halaman login.

## 7.2 Aturan Token Reset

- Token reset kata sandi bersifat **one-time use**.
- Masa berlaku: **1 jam**.
- Token baru membatalkan token lama yang belum digunakan.

---

# 8. Mengubah Kata Sandi (dari Profil)

## 8.1 Alur

1. Member membuka halaman **Pengaturan Akun**.
2. Member mengisi:
   - kata sandi saat ini,
   - kata sandi baru,
   - konfirmasi kata sandi baru.
3. Sistem memvalidasi kata sandi saat ini.
4. Sistem memvalidasi kata sandi baru (aturan sama dengan registrasi).
5. Sistem menyimpan hash kata sandi baru.
6. Semua sesi aktif di perangkat lain diakhiri (kecuali sesi saat ini).
7. Sistem mengirim email notifikasi perubahan kata sandi.

---

# 9. Mengubah Email

## 9.1 Alur

1. Member membuka halaman **Pengaturan Akun**.
2. Member memasukkan email baru.
3. Sistem memvalidasi:
   - format email baru,
   - email baru berbeda dari email saat ini,
   - email baru belum digunakan akun lain.
4. Sistem mengirim email verifikasi ke **email baru**.
5. Email lama tetap digunakan hingga verifikasi selesai.
6. Member mengklik tautan di email baru.
7. Sistem memperbarui email ke email baru.
8. Sistem mengirim notifikasi ke email lama.

---

# 10. Manajemen Profil

## 10.1 Informasi Profil

| Field | Dapat Diubah? | Keterangan |
|---|---|---|
| Nama Lengkap | Ya | — |
| Email | Ya | Memerlukan verifikasi ulang |
| Nomor Telepon | Ya | — |
| Foto Profil | Ya | Upload gambar, optional |
| Kata Sandi | Ya | Melalui alur khusus |
| ID Member | Tidak | Digenerate sistem, tidak dapat diubah |
| Tanggal Daftar | Tidak | Dicatat sistem |

## 10.2 Foto Profil

- Format yang diterima: JPG, PNG, WebP.
- Ukuran maksimal: 2 MB.
- Gambar dikompresi dan diresize oleh sistem.
- Jika tidak ada foto, tampilkan inisial nama sebagai avatar default.

---

# 11. Penghapusan Akun

> **Catatan**: Fitur penghapusan akun akan didefinisikan lebih lanjut dalam versi selanjutnya.

Prinsip yang harus diperhatikan:

- Akun yang memiliki lisensi aktif berbayar tidak dapat langsung dihapus.
- Data transaksi keuangan harus disimpan sesuai peraturan yang berlaku.
- Penghapusan memerlukan konfirmasi kata sandi.

---

# 12. Data yang Disimpan Saat Registrasi

```json
{
  "id": "uuid-member-001",
  "name": "Budi Santoso",
  "email": "budi@email.com",
  "email_verified": false,
  "phone": null,
  "password_hash": "$2b$12$...",
  "status": "unverified",
  "created_at": "2026-07-12T14:00:00Z",
  "updated_at": "2026-07-12T14:00:00Z",
  "last_login_at": null
}
```

---

# 13. Email yang Dikirim

| Peristiwa | Email |
|---|---|
| Registrasi berhasil | Tautan verifikasi email |
| Akun diaktifkan | Selamat datang + tautan ke dashboard |
| Lupa kata sandi | Tautan reset kata sandi |
| Kata sandi berhasil diubah | Notifikasi perubahan kata sandi |
| Permintaan ubah email | Tautan verifikasi email baru |
| Email berhasil diubah | Notifikasi ke email lama |

---

# 14. Keamanan Akun

1. Kata sandi disimpan sebagai hash (bcrypt/Argon2), tidak pernah plaintext.
2. Token verifikasi dan reset bersifat satu kali pakai (one-time use).
3. Rate limiting diterapkan pada:
   - endpoint registrasi,
   - endpoint login,
   - endpoint lupa kata sandi,
   - endpoint kirim ulang verifikasi.
4. Perubahan kata sandi mengakhiri semua sesi aktif lain.
5. Email perubahan sensitif (kata sandi, email) selalu dinotifikasi ke email sebelumnya.

---

# 15. Acceptance Criteria

- Member dapat mendaftar dengan email dan kata sandi yang valid.
- Email yang sudah terdaftar tidak dapat digunakan kembali.
- Email verifikasi terkirim setelah registrasi.
- Akun berstatus `unverified` tidak dapat login ke aplikasi SaaS.
- Tautan verifikasi yang expired memunculkan opsi kirim ulang.
- Fitur lupa kata sandi tidak mengkonfirmasi apakah email terdaftar atau tidak.
- Token reset kata sandi expired setelah 1 jam dan satu kali pakai.
- Perubahan kata sandi mengakhiri sesi lain.
- Perubahan email memerlukan verifikasi ke email baru.
- Kata sandi tidak pernah tampil atau disimpan dalam bentuk teks asli.
