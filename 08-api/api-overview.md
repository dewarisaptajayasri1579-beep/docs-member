# API Overview — Central Membership & SSO Hub

## Tujuan

Dokumen ini adalah kontrak HTTP API untuk backend Central Membership & SSO Hub berbasis **NestJS**. API mencakup akun member, katalog, lisensi, checkout, pembayaran, admin, dan OAuth2/SSO.

## Base URL dan versioning

| Environment | Base URL |
|---|---|
| Local | `http://localhost:3001` |
| Staging | `https://api-staging.hub.domain.com` |
| Production | `https://api.hub.domain.com` |

Endpoint REST memakai prefix `/api/v1`, contohnya `GET /api/v1/products`. Endpoint OAuth2 dan webhook tidak memakai prefix karena mengikuti standar/provider eksternal: `/oauth/token` dan `/webhooks/midtrans`.

## Konvensi NestJS

| Area | Standar implementasi |
|---|---|
| Controller | Satu controller per resource; hanya menangani HTTP. |
| Service | Menyimpan aturan bisnis, transaction boundary, dan integrasi eksternal. |
| DTO | Gunakan `class-validator` dan `class-transformer`; `ValidationPipe` global memakai `whitelist`, `forbidNonWhitelisted`, dan `transform`. |
| Database | Prisma Service; settlement payment memakai `prisma.$transaction`. |
| Auth | `JwtAuthGuard` untuk member, `RolesGuard` untuk admin, dan guard khusus OAuth2/webhook. |
| Dokumentasi | Swagger/OpenAPI di `/api/docs`; DTO dan response diberi decorator Swagger. |
| Queue | BullMQ untuk email, reminder expiry, dan pekerjaan non-kritis. |

## Authentication dan otorisasi

Endpoint member/admin menerima `Authorization: Bearer <access_token>`. Guard memvalidasi signature RS256, `exp`, dan status akun. Endpoint admin juga mewajibkan role `super_admin`.

OAuth2 memakai Authorization Code Flow dengan PKCE. Webhook Midtrans/Xendit tidak memakai bearer token: validasi signature/callback token, amount, dan idempotensi harus selesai sebelum order atau lisensi dimutasi.

## Format respons

### Berhasil

```json
{
  "data": { "id": "0d1c1b9e-4d61-4d60-8e34-1f7cc4f1a5f9" },
  "meta": { "requestId": "req_01J..." }
}
```

Koleksi memakai `meta.page`, `meta.limit`, `meta.total`, dan `meta.totalPages`.

### Gagal

```json
{
  "statusCode": 409,
  "code": "LICENSE_ALREADY_EXISTS",
  "message": "Anda sudah memiliki lisensi aktif untuk produk ini.",
  "details": [],
  "requestId": "req_01J..."
}
```

Gunakan global exception filter NestJS. Pesan aman ditampilkan ke pengguna; stack trace, password, token, dan secret tidak pernah dikembalikan.

## HTTP status dan kode aplikasi

| Status | Penggunaan |
|---:|---|
| `200` / `201` / `204` | Request berhasil, resource dibuat, atau sukses tanpa body. |
| `202` | Pekerjaan asynchronous diterima. |
| `400` | DTO/request invalid. |
| `401` | Token/kredensial tidak valid atau kedaluwarsa. |
| `403` | Role, lisensi, atau scope tidak mengizinkan akses. |
| `404` | Resource tidak ditemukan/tidak aktif. |
| `409` | Konflik email, order, atau lisensi. |
| `422` | Request valid secara bentuk tetapi melanggar aturan proses. |
| `429` | Rate limit terlampaui. |
| `503` | Dependency tidak tersedia. |

Kode aplikasi utama: `EMAIL_ALREADY_REGISTERED`, `EMAIL_NOT_VERIFIED`, `INVALID_CREDENTIALS`, `LICENSE_ALREADY_EXISTS`, `NO_LICENSE`, `LICENSE_SUSPENDED`, `ORDER_EXPIRED`, `DUPLICATE_ORDER`, `INVALID_WEBHOOK_SIGNATURE`, dan `PAYMENT_AMOUNT_MISMATCH`.

## Pagination dan idempotency

- Koleksi menerima `page` (default `1`) dan `limit` (default `20`, maksimum `100`).
- Endpoint pembuatan order mewajibkan header `Idempotency-Key` UUID. Key sama dengan body identik mengembalikan hasil awal; body berbeda menghasilkan `409`.
- Webhook diidempoten dengan ID event gateway dan `order_number`.

## Keamanan operasional

1. Terapkan HTTPS, CORS allowlist, Helmet, dan rate-limit pada NestJS.
2. Terapkan limit lebih ketat untuk login, registrasi, reset password, dan resend email.
3. Buat audit log untuk autentikasi, perubahan lisensi, pembayaran, dan aksi admin.
4. Endpoint webhook menggunakan raw body bila diperlukan untuk verifikasi signature provider.
5. API key gateway, OAuth secret, dan JWT private key hanya berada di server/secret manager.
