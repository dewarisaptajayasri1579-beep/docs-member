# Interactive Documentation Hub

## Tujuan

Documentation Hub adalah website interaktif untuk Central Membership & SSO Hub. Markdown tetap menjadi sumber kebenaran; website menjadi lapisan visual, navigasi, pencarian, dan histori versi.

## Target pembaca dan mode

| Mode | Target | Bentuk konten |
|---|---|---|
| **Simple** | Orang awam, stakeholder, dan programmer yang ingin ringkasan | Bahasa sederhana, kartu, timeline, diagram alur, serta penjelasan “mengapa”. |
| **Detail** | Programmer, QA, dan operator | API, database, OAuth2, queue, payload, environment variable, dan test scenario. |

Toggle mode tersedia di header dan berlaku di seluruh website. Mode Simple mengganti jargon dengan penjelasan mudah tanpa menyembunyikan fakta penting; mode Detail menampilkan kontrak teknis lengkap.

## Struktur informasi

```text
/docs
├── Mulai di sini: overview, user journey, glosarium
├── Cara kerja sistem: registrasi, lisensi, pembayaran, SSO
├── Dashboard visual: peta sistem, lifecycle lisensi, riwayat perubahan
├── Untuk developer: API, database, arsitektur, setup, testing
└── Referensi: seluruh dokumen dan changelog
```

## Pengalaman interaktif

| Fitur | Nilai untuk pembaca |
|---|---|
| Peta sistem yang dapat diklik | Menjelaskan peran Next.js, NestJS, PostgreSQL, Redis/BullMQ, Midtrans, dan Xendit. |
| Flow simulator | Memvisualkan registrasi → verifikasi → aktivasi → SSO atau checkout → webhook → lisensi aktif. |
| License lifecycle | Menampilkan `active → grace_period → suspended → renewed` sebagai state machine. |
| API explorer | Filter endpoint berdasarkan fitur; Simple menjelaskan kegunaan, Detail menampilkan request/response/auth. |
| Database explorer | ERD dapat diklik untuk melihat tabel, relasi, dan arti kolom. |
| Tooltip glosarium | Menjelaskan JWT, webhook, Redis, dan BullMQ pada konteksnya. |
| Pencarian global | Menemukan topik lintas dokumen, API, tabel, dan test scenario. |
| Progress baca | Menandai halaman yang sudah dibaca. |

Diagram menggunakan SVG/React atau aset lokal agar tetap berfungsi offline; tidak bergantung pada layanan diagram eksternal saat runtime.

## Offline-first PWA

- Website dibangun dengan Next.js dan dapat di-install sebagai PWA.
- Konten Markdown/MDX, diagram, indeks pencarian, dan aset UI dibundel saat build.
- Service worker menyimpan halaman serta aset setelah kunjungan pertama.
- Mode offline menampilkan indikator dan tanggal/versi konten aktif.
- Implementasi awal ada di route `/docs` pada frontend agar konsisten dengan desain aplikasi.

## Dokumentasi berversi

Website memiliki version selector: **Terbaru**, `v1.0`, `v1.1`, `v1.2`, dan seterusnya. Versi lama tetap dapat dibaca; setiap halaman menampilkan versi aktif, tanggal pembaruan, tautan riwayat, serta opsi membandingkan dua versi.

| Artefak | Peran |
|---|---|
| Folder docs aktif | Konten terbaru. |
| `versions/vX.Y/` | Snapshot seluruh docs yang ditampilkan oleh website. |
| `11-changelog/changelog.md` | Ringkasan manusiawi tiap rilis. |
| `11-changelog/changelog-guidelines.md` | Aturan penentuan versi/perubahan. |
| Git tag `docs-vX.Y` | Penanda source resmi snapshot. |

Mode Simple menjelaskan dampak perubahan untuk pengguna; mode Detail menjelaskan dampak API, database, dan operasi.

## Tahapan implementasi

1. Buat route `/docs`, layout, sidebar, pencarian, tema, dan toggle Simple/Detail.
2. Buat halaman visual overview, user journey, pembayaran, dan arsitektur.
3. Tambahkan explorer API/database/testing dari konten Markdown.
4. Tambahkan PWA offline, version selector, changelog, dan perbandingan versi.

## Definition of done

- Orang awam memahami tujuan Hub dan alur utama tanpa jargon teknis.
- Programmer mengakses detail API, database, arsitektur, dan testing dari portal yang sama.
- Halaman/diagram utama dapat dibuka setelah cache offline tersedia.
- Pembaca dapat memilih versi dokumentasi dan membaca changelog perubahan.
- Konten visual dapat ditelusuri kembali ke Markdown sumbernya.
