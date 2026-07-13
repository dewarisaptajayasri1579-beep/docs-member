# Changelog & Documentation Versioning Guidelines

## 1. Tujuan

Panduan ini menentukan kapan perubahan dokumentasi perlu masuk changelog dan kapan
versi dokumentasi perlu dinaikkan. Tujuannya menjaga riwayat mudah dipahami oleh
orang awam maupun programmer tanpa membuat changelog terlalu ramai.

## 2. Aturan keputusan cepat

Gunakan pertanyaan berikut sebelum melakukan perubahan:

1. Apakah kemampuan pengguna atau programmer berubah?
2. Apakah perilaku atau aturan bisnis lama berubah?
3. Apakah frontend, backend, database, atau aplikasi SaaS lain perlu menyesuaikan?
4. Apakah pembaca dokumentasi versi lama dapat membuat keputusan yang salah bila
   tidak membaca perubahan ini?

Jika setidaknya satu jawaban adalah **ya**, masukkan perubahan pada rilis
dokumentasi berikutnya dan tulis di changelog.

```text
Hanya cara menjelaskan yang berubah?
  → Tidak perlu versi baru; cukup Git commit.

Data, layar, API, aturan bisnis, atau integrasi berubah?
  → Buat versi dokumentasi baru.

Integrasi lama tidak lagi dapat berfungsi tanpa penyesuaian?
  → Breaking change; naikkan versi mayor.
```

## 3. Klasifikasi perubahan

| Jenis | Contoh | Masuk changelog / versi? |
|---|---|---|
| Editorial | Typo, tata bahasa, format tabel | Tidak; cukup Git commit. |
| Dokumentasi tertinggal | Fitur sudah berjalan tetapi belum tertulis | Umumnya tidak; tulis catatan bila pembaruan penting. |
| Fitur baru | Xendit, produk baru, invoice download, notifikasi baru | Ya, kategori `Added`. |
| Perubahan perilaku | Grace period 7 hari menjadi 14 hari | Ya, kategori `Changed`. |
| Perbaikan bug | Webhook retry sebelumnya membuat email ganda | Ya, kategori `Fixed`. |
| Perubahan teknis | Redis/BullMQ, provider email, monitoring | Ya, kategori `Technical` bila berdampak pada operasi/maintainer. |
| Deprecation | Endpoint masih berjalan tetapi akan dihentikan | Ya, kategori `Deprecated`. |
| Penghapusan | Endpoint atau fitur tidak lagi tersedia | Ya, kategori `Removed`. |
| Breaking change | Claim JWT dihapus, URL API berubah, format License-ID berubah | Ya, naik versi mayor. |

## 4. Aturan versi

Versi dokumentasi mengikuti format `vMAJOR.MINOR`.

| Perubahan | Contoh | Versi |
|---|---|---|
| Baseline awal | Snapshot dokumen pertama yang disetujui | `v1.0` |
| Fitur/aturan/perubahan kompatibel | Menambah endpoint atau payment gateway | `v1.0 → v1.1` |
| Perubahan kompatibel berikutnya | Menambah dokumentasi queue atau admin flow | `v1.1 → v1.2` |
| Breaking change | Endpoint/payload lama tidak kompatibel | `v1.x → v2.0` |

Perubahan kecil dapat dikumpulkan dalam satu rilis dokumentasi. Jangan menaikkan
versi hanya karena typo atau perapian Markdown.

## 5. Format changelog

Gunakan kategori berikut hanya bila ada isinya:

```md
## v1.1 — YYYY-MM-DD

### Added
- Kemampuan atau fitur baru.

### Changed
- Perilaku, aturan bisnis, UI, API, atau arsitektur yang berubah.

### Fixed
- Bug atau inkonsistensi yang diperbaiki.

### Deprecated
- Bagian yang masih tersedia, tetapi akan dihentikan.

### Removed
- Bagian yang sudah tidak tersedia.

### Technical
- Perubahan internal untuk operasi dan pemeliharaan.
```

Setiap item penting sebaiknya menjelaskan dampaknya:

```md
### Added
- Integrasi Xendit sebagai payment gateway.
  - Dampak pengguna: tersedia pilihan pembayaran tambahan.
  - Dampak programmer: implementasi webhook Xendit dan environment variable baru.
```

## 6. Penyimpanan histori

| Artefak | Fungsi |
|---|---|
| Git commit | Riwayat teknis paling rinci per file/baris. |
| `11-changelog/changelog.md` | Ringkasan semua rilis untuk pembaca. |
| `11-changelog/changelog-guidelines.md` | Aturan pengambilan keputusan versi ini. |
| `versions/vX.Y/` | Snapshot seluruh docs untuk website dokumentasi, saat fitur versioning website dibuat. |
| Git tag `docs-vX.Y` | Penanda source resmi snapshot dokumentasi. |

## 7. Checklist rilis dokumentasi

- [ ] Tentukan kategori perubahan dan versi baru.
- [ ] Perbarui semua dokumen yang terdampak.
- [ ] Tambahkan ringkasan manusiawi ke `changelog.md`.
- [ ] Buat snapshot `versions/vX.Y/` bila portal dokumentasi versioned sudah aktif.
- [ ] Buat Git tag `docs-vX.Y` setelah perubahan ditinjau dan disetujui.
