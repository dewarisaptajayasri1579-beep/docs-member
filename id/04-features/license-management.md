# License and Subscription Management — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan cara sistem mengelola lisensi dan langganan member, termasuk pembuatan License-ID, daur hidup lisensi, dan tampilan informasi lisensi kepada member.

## 2. Konsep License-ID

### 2.1 Definisi

License-ID adalah kode unik yang dihasilkan sistem untuk setiap langganan aktif seorang member pada satu produk.

### 2.2 Format

```
[PREFIX_PRODUK]-[XXXX]-[XXXX]-[XXXX]
```

- **PREFIX_PRODUK**: Kode singkat produk SaaS (2–4 karakter, huruf kapital).
- **[XXXX]**: Segmen 4 karakter alfanumerik kapital, digenerate secara acak.

**Contoh:**
```
NTO-A1B2-C3D4-E5F6   → Lisensi NOTO milik seorang member
APP-X9Y8-Z7W6-V5U4   → Lisensi Aplikasi B milik member yang sama
```

### 2.3 Sifat License-ID

- Unik secara global di seluruh sistem.
- Tidak dapat diubah setelah digenerate.
- Berlaku hanya untuk satu member dan satu produk.
- Tidak dapat dipindahtangankan.
- Ditampilkan di dashboard member dan dikirim ke email.

---

# 3. Daur Hidup Lisensi

```
Diaktifkan
    │
    ▼
[active]
    │
    ├── (Paket Gratis)
    │       Tidak pernah expired → tetap [active/free] selamanya
    │
    └── (Paket Berbayar)
            │
            ▼ (expired_at tercapai)
        [grace_period]
            │
            ├── Member memperpanjang → kembali ke [active]
            │
            └── Grace Period habis
                    │
                    ▼
                [suspended]
                    │
                    ├── Member membayar → kembali ke [active]
                    │
                    └── Member tidak kembali → data tetap tersimpan
```

## 3.1 Status Lisensi

| Status | Kode | Keterangan |
|---|---|---|
| Aktif | `active` | Lisensi aktif, akses penuh |
| Gratis Selamanya | `active_free` | Paket gratis, tidak ada expired |
| Grace Period | `grace_period` | Expired, masih dalam masa tenggang |
| Ditangguhkan | `suspended` | Grace Period habis, akses diblokir |
| Dibatalkan | `cancelled` | Dibatalkan oleh member atau admin |

---

# 4. Pembuatan License-ID

### 4.1 Kapan License-ID Dibuat

- Saat member mengaktifkan paket gratis untuk pertama kali.
- Saat pembayaran pertama untuk produk tertentu berhasil.

### 4.2 Aturan Pembuatan

- Sistem memeriksa keunikan License-ID sebelum menyimpan.
- Jika member sudah memiliki lisensi untuk produk yang sama (perpanjangan), License-ID yang sudah ada **tidak diganti**.
- License-ID hanya dibuat ulang jika lisensi sebelumnya berstatus `cancelled` dan member membeli kembali.

---

# 5. Informasi Lisensi yang Ditampilkan kepada Member

Di dashboard member, setiap lisensi menampilkan:

| Informasi | Contoh |
|---|---|
| Nama Produk | NOTO |
| License-ID | `NTO-A1B2-C3D4-E5F6` |
| Paket | Free Forever |
| Status | Aktif |
| Masa Aktif | Tidak terbatas |
| Tanggal Aktivasi | 12 Juli 2026 |
| Tombol Aksi | Buka Aplikasi |

Untuk paket berbayar, tambahan informasi:

| Informasi | Contoh |
|---|---|
| Tanggal Berakhir | 12 Agustus 2026 |
| Sisa Hari | 30 hari |
| Tombol Aksi | Perpanjang / Upgrade |

---

# 6. Notifikasi Lisensi

## 6.1 Notifikasi Email yang Dikirim Sistem

| Peristiwa | Email |
|---|---|
| Aktivasi lisensi baru | Konfirmasi aktivasi + License-ID |
| Pembayaran berhasil | Invoice + konfirmasi perpanjangan |
| H-7 expired | Pengingat akan berakhir |
| H-3 expired | Pengingat mendesak |
| H-1 expired | Pengingat hari terakhir |
| Grace Period mulai | Pemberitahuan + instruksi perpanjangan |
| Grace Period H+3 | Pengingat selama grace period |
| Grace Period H+6 | Peringatan akan diblokir besok |
| Akses suspend | Pemberitahuan akses diblokir |
| Aktivasi setelah suspend | Konfirmasi akses dipulihkan |

---

# 7. Dashboard Multi-Produk

Satu member yang berlangganan beberapa produk akan melihat tampilan seperti:

```
Langganan Saya
│
├── NOTO
│     License-ID : NTO-A1B2-C3D4-E5F6
│     Status     : Aktif (Free Forever)
│     Aksi       : [Buka Aplikasi]
│
├── Aplikasi B
│     License-ID : APB-X9Y8-Z7W6-V5U4
│     Status     : Aktif · Berakhir 31 Agt 2026
│     Aksi       : [Buka Aplikasi] [Perpanjang]
│
└── Aplikasi C
      License-ID : APC-Q5R4-S3T2-P1O0
      Status     : Grace Period · Sisa 3 hari
      Aksi       : [Perpanjang Sekarang]
```

---

# 8. Aturan Lisensi

1. Satu member hanya dapat memiliki satu lisensi aktif per produk pada satu waktu.
2. License-ID bersifat unik dan tidak dapat dipindahtangankan.
3. Lisensi gratis tidak memiliki masa kedaluwarsa.
4. Grace Period hanya berlaku untuk lisensi berbayar.
5. Data member tidak dihapus meskipun lisensi suspend.
6. Perpanjangan lisensi yang sudah expired dihitung dari tanggal expired lama, bukan tanggal bayar.
7. Lisensi yang dibatalkan tidak dapat dipulihkan; pembelian baru akan menghasilkan License-ID baru.

---

# 9. Acceptance Criteria

- License-ID berformat `[PREFIX_PRODUK]-[XXXX]-[XXXX]-[XXXX]` dan unik di seluruh sistem.
- License-ID ditampilkan di dashboard setelah aktivasi.
- Email konfirmasi dengan License-ID terkirim setelah aktivasi.
- Status lisensi berubah secara otomatis sesuai kondisi (active → grace_period → suspended).
- Notifikasi email terkirim sesuai jadwal.
- Member dapat melihat semua lisensinya dalam satu dashboard.
- Member tidak dapat mengakses aplikasi jika lisensi berstatus suspended.
