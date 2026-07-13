# Billing Plans — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan struktur paket langganan (plan) untuk setiap produk SaaS dalam ekosistem, aturan pengelolaan paket, dan ketentuan khusus per produk.

## 2. Prinsip Paket

1. Setiap produk SaaS mendefinisikan paketnya sendiri secara independen.
2. Satu member dapat berlangganan paket yang berbeda untuk produk yang berbeda.
3. Paket **Free / Gratis** tidak memerlukan pembayaran dan tidak memiliki masa kedaluwarsa.
4. Paket **Berbayar** memiliki durasi (bulanan atau tahunan) dan akan kedaluwarsa jika tidak diperpanjang.
5. Harga dan fitur per paket dikelola oleh Super Admin.

---

# 3. Produk: NOTO

## 3.1 Status Paket

NOTO saat ini menawarkan satu paket:

| Paket | Harga | Durasi | Status |
|---|---|---|---|
| Free Forever | Rp0 | Tidak terbatas | Aktif |

## 3.2 Ketentuan Paket Free Forever NOTO

- Tidak ada masa kedaluwarsa.
- Akses penuh ke semua fitur NOTO (Early Access).
- Tidak ada batasan kuota (jumlah akun keuangan, pos keuangan, transaksi).
- Tersedia sejak hari pertama registrasi.

> **Catatan**: Batasan fitur atau kuota akan didefinisikan pada dokumen NOTO terpisah ketika paket berbayar NOTO diperkenalkan di masa mendatang.

---

# 4. Struktur Paket untuk Produk Berbayar (Template)

Ketika produk berbayar baru ditambahkan ke ekosistem, paket mereka mengikuti struktur berikut.

## 4.1 Jenis Paket Standar

| Paket | Peruntukan |
|---|---|
| Free / Trial | Pengguna baru yang ingin mencoba |
| Starter | Pengguna individu atau kebutuhan dasar |
| Pro | Pengguna aktif dengan kebutuhan menengah |
| Business | Tim kecil atau kebutuhan lanjutan |

## 4.2 Siklus Penagihan

| Siklus | Keterangan |
|---|---|
| Bulanan | Ditagih setiap bulan |
| Tahunan | Ditagih setiap tahun (biasanya lebih hemat) |

## 4.3 Contoh Struktur Data Paket

```json
{
  "product_code": "APP",
  "plan_name": "Pro",
  "billing_cycle": "monthly",
  "price": 99000,
  "currency": "IDR",
  "duration_days": 30,
  "features": [
    "Fitur A",
    "Fitur B",
    "Fitur C"
  ],
  "is_active": true
}
```

---

# 5. Perbandingan Lisensi Berdasarkan Status

| Status Lisensi | Akses Aplikasi | Keterangan |
|---|---|---|
| `active` | Ya, penuh | Lisensi aktif dan belum kedaluwarsa |
| `grace_period` | Ya, dengan peringatan | Lisensi kedaluwarsa, dalam masa tenggang |
| `suspended` | Tidak | Grace Period habis, akses diblokir |
| `cancelled` | Tidak | Lisensi dibatalkan oleh member atau admin |
| `free` | Ya, penuh | Paket gratis selamanya (seperti NOTO) |

---

# 6. Grace Period

## 6.1 Ketentuan Grace Period

- Grace Period berlaku hanya untuk paket **berbayar**.
- Paket **Free** tidak memiliki Grace Period karena tidak ada masa kedaluwarsa.
- Panjang Grace Period ditentukan per produk dalam konfigurasi sistem.
- Default Grace Period: **7 hari**.

## 6.2 Jadwal Notifikasi Grace Period

| Waktu | Notifikasi |
|---|---|
| H-7 sebelum expired | Email: Langganan Anda akan segera berakhir |
| H-3 sebelum expired | Email: Segera perpanjang langganan Anda |
| H-1 sebelum expired | Email: Langganan berakhir besok |
| H+0 (Grace Period mulai) | Email: Langganan berakhir, masih ada 7 hari untuk perpanjang |
| H+3 (Grace Period berjalan) | Email: Sisa 4 hari sebelum akses diblokir |
| H+6 (Grace Period hampir habis) | Email: Akses akan diblokir besok |
| H+7 (Grace Period habis) | Email: Akses telah diblokir |

## 6.3 Perpanjangan Selama Grace Period

- Member dapat memperpanjang kapan saja selama Grace Period.
- Setelah perpanjangan berhasil, `expired_at` dihitung dari tanggal expired asli:
  ```
  expired_at_baru = expired_at_lama + durasi_paket
  ```

---

# 7. Pembaruan Paket (Upgrade / Downgrade)

- **Upgrade**: Member dapat pindah ke paket lebih tinggi kapan saja. Sisa masa aktif diperhitungkan secara proporsional.
- **Downgrade**: Member dapat pindah ke paket lebih rendah pada akhir siklus tagihan aktif.

> Aturan perhitungan prorated upgrade/downgrade akan didefinisikan lebih lanjut di dokumen aturan bisnis.

---

# 8. Acceptance Criteria Billing Plans

- Paket Free NOTO dapat diaktifkan tanpa pembayaran.
- Paket berbayar hanya aktif setelah pembayaran dikonfirmasi.
- Grace Period berjalan sesuai konfigurasi.
- Notifikasi email terkirim sesuai jadwal.
- Lisensi suspend tepat setelah Grace Period berakhir.
- Data member tidak dihapus meskipun lisensi suspend.
