# Design Guideline — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjadi panduan desain visual dan pengalaman pengguna (UX) yang wajib diikuti dalam pengembangan antarmuka Central Membership & SSO Hub.

---

# 2. Prinsip Desain

1. **Mobile-First**: Desain dirancang untuk layar mobile terlebih dahulu, kemudian diadaptasi ke tablet dan desktop.
2. **Premium & Minimal**: Elemen bersih, tidak berlebihan, setiap elemen harus memiliki tujuan.
3. **Konsisten**: Komponen, spacing, warna, dan tipografi harus konsisten di seluruh halaman.
4. **Aksesibel**: Kontras warna memenuhi standar WCAG 2.1 AA.
5. **Responsif terhadap State**: Setiap status (loading, error, success, empty) harus memiliki tampilan yang sesuai.

---

# 3. Tema

Sistem mendukung dua tema:

- **Dark Mode** (default)
- **Light Mode**

Pengguna dapat beralih antar tema melalui toggle di halaman profil atau pengaturan. Preferensi tema disimpan secara lokal.

---

# 4. Palet Warna

## 4.1 Dark Mode

| Token | Hex | Penggunaan |
|---|---|---|
| `bg-base` | `#0F0F13` | Latar belakang utama halaman |
| `bg-surface` | `#1A1A24` | Card, panel, modal |
| `bg-elevated` | `#22222F` | Dropdown, tooltip, popup |
| `border` | `#2A2A38` | Garis pemisah, border input |
| `accent-start` | `#7C3AED` | Gradient mulai (purple) |
| `accent-end` | `#A78BFA` | Gradient akhir (purple muda) |
| `success` | `#10B981` | Status aktif, konfirmasi |
| `warning` | `#F59E0B` | Grace Period, peringatan |
| `danger` | `#EF4444` | Error, suspend, hapus |
| `text-primary` | `#F1F0FF` | Teks utama |
| `text-secondary` | `#A1A1B5` | Teks keterangan |
| `text-muted` | `#6B7280` | Placeholder, label tidak aktif |

## 4.2 Light Mode

| Token | Hex | Penggunaan |
|---|---|---|
| `bg-base` | `#F8F8FC` | Latar belakang utama |
| `bg-surface` | `#FFFFFF` | Card, panel, modal |
| `bg-elevated` | `#F1F0FF` | Dropdown, tooltip |
| `border` | `#E2E2EE` | Garis, border input |
| `accent-start` | `#7C3AED` | Gradient mulai |
| `accent-end` | `#A78BFA` | Gradient akhir |
| `success` | `#059669` | Status aktif |
| `warning` | `#D97706` | Peringatan |
| `danger` | `#DC2626` | Error |
| `text-primary` | `#111118` | Teks utama |
| `text-secondary` | `#4B4B63` | Teks keterangan |
| `text-muted` | `#9CA3AF` | Placeholder |

## 4.3 Warna Aksen (Gradient)

Tombol utama dan elemen highlight menggunakan gradient:

```css
background: linear-gradient(135deg, #7C3AED, #A78BFA);
```

---

# 5. Tipografi

**Font Utama**: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)

**Font Monospace** (untuk License-ID): `JetBrains Mono` atau `Fira Code`

## 5.1 Skala Tipografi

| Nama | Size | Weight | Penggunaan |
|---|---|---|---|
| `display` | 28px / 1.75rem | 700 | Judul halaman utama |
| `heading-1` | 22px / 1.375rem | 700 | Judul section |
| `heading-2` | 18px / 1.125rem | 600 | Sub-judul, nama produk |
| `body-lg` | 16px / 1rem | 400 | Teks utama |
| `body` | 14px / 0.875rem | 400 | Teks konten umum |
| `body-sm` | 12px / 0.75rem | 400 | Keterangan, label kecil |
| `caption` | 11px / 0.6875rem | 400 | Metadata, timestamp |
| `code` | 14px / 0.875rem | 500 | License-ID, kode teknis |

---

# 6. Spacing

Menggunakan sistem kelipatan 4px:

| Token | Value | Penggunaan |
|---|---|---|
| `space-1` | 4px | Jarak sangat kecil |
| `space-2` | 8px | Padding dalam elemen kecil |
| `space-3` | 12px | Jarak antar elemen inline |
| `space-4` | 16px | Padding card, jarak antar komponen |
| `space-5` | 20px | Margin section |
| `space-6` | 24px | Padding halaman mobile |
| `space-8` | 32px | Jarak antar section besar |
| `space-10` | 40px | Header tinggi |
| `space-12` | 48px | Jarak antar halaman section |

**Padding halaman mobile**: `24px` kiri-kanan

---

# 7. Border Radius

| Token | Value | Penggunaan |
|---|---|---|
| `radius-sm` | 8px | Button kecil, badge |
| `radius-md` | 12px | Input, button utama |
| `radius-lg` | 16px | Card produk, panel |
| `radius-xl` | 20px | Modal, bottom sheet |
| `radius-full` | 9999px | Pill badge, avatar |

---

# 8. Komponen Utama

## 8.1 Button

| Varian | Tampilan | Penggunaan |
|---|---|---|
| Primary | Gradient purple, teks putih | Aksi utama (Masuk, Aktifkan, Bayar) |
| Secondary | Border purple, teks purple | Aksi kedua (Batal, Kembali) |
| Danger | Background merah muda, teks merah | Hapus, batalkan |
| Ghost | Transparan, teks muted | Link action |

- Ukuran default: `height: 48px`, `border-radius: 12px`, `font-weight: 600`
- Full-width di mobile
- State: `default`, `hover`, `active`, `disabled`, `loading`

## 8.2 Input Field

- `height: 52px`
- `border-radius: 12px`
- `border: 1px solid border`
- Label selalu di atas input (bukan floating label)
- State: `default`, `focus`, `error`, `disabled`
- Error message muncul di bawah input, berwarna merah

## 8.3 Status Badge

| Status | Warna | Contoh |
|---|---|---|
| Aktif | Hijau (`success`) + dot pulse | `● Aktif` |
| Free Forever | Aksen purple | `Free Forever` |
| Grace Period | Kuning (`warning`) | `⚠ Grace Period · 3 hari` |
| Suspended | Merah (`danger`) | `✕ Ditangguhkan` |
| Unverified | Abu (`muted`) | `Email belum terverifikasi` |

## 8.4 License-ID Card

- Background: `bg-elevated` dengan border subtle
- Font: monospace (`JetBrains Mono`)
- Tombol copy di sisi kanan
- Muncul feedback "Disalin!" setelah diklik (toast 2 detik)

## 8.5 Product Card

Kartu langganan produk di dashboard:

```
┌──────────────────────────────────┐
│  [Logo] Nama Produk    [● Aktif] │
│  ─────────────────────────────── │
│  License ID                      │
│  NTO-A1B2-C3D4-E5F6     [Copy]  │
│  ─────────────────────────────── │
│  [Free Forever]    Buka App →   │
└──────────────────────────────────┘
```

## 8.6 Toast / Snackbar

- Muncul di bagian bawah layar (mobile), atas kanan (desktop)
- Durasi: 3 detik, dapat ditutup manual
- Tipe: `success`, `error`, `warning`, `info`

## 8.7 Bottom Navigation (Mobile)

4 tab navigasi:

| Tab | Ikon | Label |
|---|---|---|
| Home | House | Home |
| Products | Grid | Produk |
| History | Clock | Riwayat |
| Profile | Member | Profil |

---

# 9. Animasi & Transisi

| Elemen | Animasi | Durasi |
|---|---|---|
| Perpindahan halaman | Slide up (mobile) / Fade (desktop) | 250ms |
| Modal / Bottom Sheet | Slide up dari bawah | 300ms |
| Toast | Slide in dari bawah | 200ms |
| Button tap | Scale 0.97 | 100ms |
| Status badge | Dot pulse (green aktif) | Looping |
| Halaman sukses | Checkmark draw + confetti ringan | 600ms |
| Skeleton loading | Shimmer left-to-right | Looping |

Semua animasi menggunakan `ease-out` easing.

---

# 10. Responsive Breakpoints

| Nama | Breakpoint | Layout |
|---|---|---|
| Mobile | < 640px | Full-width, bottom nav |
| Tablet | 640px – 1024px | Sidebar tersembunyi, top nav |
| Desktop | > 1024px | Sidebar persisten, 2-kolom |

---

# 11. Dark / Light Mode Toggle

- Toggle tersedia di halaman **Profil** dan **Header** (ikon matahari/bulan).
- Transisi tema: 200ms fade semua elemen.
- Preferensi disimpan di `localStorage` dan diaplikasikan sebelum render (mencegah flash).

---

# 12. Aturan UX

1. Setiap aksi destruktif (batalkan, logout) harus meminta konfirmasi.
2. Tombol utama hanya satu per halaman (tidak membingungkan pengguna).
3. Pesan error harus spesifik dan memberi arahan solusi, bukan hanya kode error.
4. Halaman kosong (empty state) harus memiliki ilustrasi dan CTA yang relevan.
5. Setiap proses async harus menampilkan state loading.
6. Formulir yang gagal harus mempertahankan data yang sudah diisi.
7. License-ID harus selalu mudah disalin (satu tap/klik).
8. Navigasi utama selalu terlihat di mobile (sticky bottom nav).
