# API Endpoints Reference — Central Membership & SSO Hub

Prefix REST: `/api/v1`. Body memakai `application/json`, kecuali `/oauth/token` yang memakai `application/x-www-form-urlencoded`.

## Health dan katalog publik

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/health` | Publik | Health check aplikasi dan dependency utama. |
| `GET` | `/api/v1/products` | Publik | Daftar produk aktif; query `search`, `page`, `limit`. |
| `GET` | `/api/v1/products/:productCode` | Publik | Detail produk beserta paket aktif. |
| `GET` | `/api/v1/products/:productCode/plans` | Publik | Paket yang tersedia untuk produk. |

```json
{ "data": { "code": "NTO", "name": "NOTO", "plans": [{ "code": "free", "type": "free", "priceAmount": 0, "currency": "IDR" }] } }
```

## Auth dan akun

| Method | Path | Auth | Request / hasil penting |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Publik | `{ fullName, email, password, passwordConfirmation }`; membuat akun `unverified`, `201`. |
| `POST` | `/api/v1/auth/login` | Publik | `{ email, password }`; access token, refresh token, dan profil, `200`. |
| `POST` | `/api/v1/auth/logout` | Member | Cabut refresh token/sesi, `204`. |
| `POST` | `/api/v1/auth/refresh` | Publik | `{ refreshToken }`; rotasi refresh token. |
| `POST` | `/api/v1/auth/verify-email` | Publik | `{ token }`; aktifkan akun. |
| `POST` | `/api/v1/auth/resend-verification` | Publik | `{ email }`; respons generik, `202`. |
| `POST` | `/api/v1/auth/forgot-password` | Publik | `{ email }`; respons generik, `202`. |
| `POST` | `/api/v1/auth/reset-password` | Publik | `{ token, password, passwordConfirmation }`, `204`. |
| `GET` | `/api/v1/me` | Member | Profil dan ringkasan status member. |
| `PATCH` | `/api/v1/me` | Member | `{ fullName, avatarUrl? }`. |
| `PATCH` | `/api/v1/me/password` | Member | `{ currentPassword, newPassword, passwordConfirmation }`, `204`. |
| `PATCH` | `/api/v1/me/notification-preferences` | Member | Preferensi notifikasi. |

Login/registrasi/reset wajib memakai rate limiter. Forgot-password dan resend email tidak boleh membocorkan apakah email terdaftar.

## Dashboard dan lisensi member

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/api/v1/dashboard` | Member | Ringkasan subscription, peringatan, dan pembayaran terbaru. |
| `GET` | `/api/v1/licenses` | Member | Lisensi sendiri; filter `status`, `productCode`, `page`, `limit`. |
| `GET` | `/api/v1/licenses/:licenseId` | Member | Detail lisensi milik sendiri. |
| `POST` | `/api/v1/licenses/activate-free` | Member | `{ productCode, planCode }`; membuat `active_free`, `201`. |
| `POST` | `/api/v1/licenses/:licenseId/renew` | Member | `{ planCode, gateway }`; membuat order renewal paid, `201`. |
| `GET` | `/api/v1/licenses/:licenseId/sso-link` | Member | URL otorisasi SSO untuk produk lisensi. |

Aktivasi free menolak akun belum aktif, produk/paket nonaktif, serta lisensi berlaku yang sudah ada. License-ID dibuat pada aktivasi pertama dan tidak berubah saat renewal.

## Checkout dan pembayaran

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/v1/orders` | Member | Membuat checkout paid; header `Idempotency-Key` wajib. |
| `GET` | `/api/v1/orders` | Member | Riwayat order sendiri; filter `status`, `page`, `limit`. |
| `GET` | `/api/v1/orders/:orderId` | Member | Detail order dan instruksi pembayaran. |
| `GET` | `/api/v1/payments` | Member | Riwayat pembayaran; filter `status`, `page`, `limit`. |
| `GET` | `/api/v1/payments/:paymentId/invoice` | Member | Metadata/download invoice settlement. |

Body order:

```json
{ "productCode": "NTO", "planCode": "pro-monthly", "gateway": "midtrans" }
```

Respons `201` memuat `id`, `orderNumber`, `status: "pending_payment"`, `amount`, `currency`, `paymentUrl`, dan `expiresAt`.

## Webhook payment gateway

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/webhooks/midtrans` | Signature Midtrans | Memproses notification/Snap callback. |
| `POST` | `/webhooks/xendit` | Callback token Xendit | Memproses invoice callback. |

Webhook harus memvalidasi signature/token dan amount, menyimpan event, mengecek idempotensi, lalu dalam satu transaction memperbarui payment, order, license, dan audit log. Event invalid memberi `400`; retry event yang sudah sukses memberi `200` tanpa aktivasi ulang. Endpoint ini tidak boleh dipanggil frontend.

## Admin API

Semua endpoint berikut membutuhkan bearer token dengan role `super_admin`.

| Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | Metrik member, lisensi, order, dan pembayaran. |
| `GET` | `/api/v1/admin/members` | List member; filter `search`, `status`, `page`, `limit`. |
| `GET` | `/api/v1/admin/members/:memberId` | Detail member, lisensi, dan order. |
| `PATCH` | `/api/v1/admin/members/:memberId/status` | `{ status: "active" | "suspended" }`; audit log wajib. |
| `GET` | `/api/v1/admin/products` | Semua produk/paket, termasuk nonaktif. |
| `POST` | `/api/v1/admin/products` | Membuat produk baru. |
| `PATCH` | `/api/v1/admin/products/:productId` | Ubah metadata/status produk. |
| `POST` | `/api/v1/admin/products/:productId/plans` | Membuat paket. |
| `PATCH` | `/api/v1/admin/plans/:planId` | Ubah paket tanpa mengubah order lama. |
| `GET` | `/api/v1/admin/orders` | Filter order global. |
| `GET` | `/api/v1/admin/payments` | Filter pembayaran global. |
| `POST` | `/api/v1/admin/orders/:orderId/confirm-payment` | Fallback manual terverifikasi; audit wajib. |
| `GET` | `/api/v1/admin/audit-logs` | Filter `actorId`, `action`, `objectType`, `from`, `to`. |
| `POST` | `/api/v1/admin/oauth-clients` | Daftarkan client SaaS; secret hanya dikembalikan sekali. |
| `PATCH` | `/api/v1/admin/oauth-clients/:clientId` | Ubah redirect URI, scope, atau status. |
| `POST` | `/api/v1/admin/oauth-clients/:clientId/rotate-secret` | Rotasi client secret. |

## OAuth2 dan metadata

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/oauth/authorize` | Sesi Hub | Authorization Code Flow + PKCE. |
| `POST` | `/oauth/token` | Client + code/refresh token | Tukar authorization code atau refresh token. |
| `GET` | `/oauth/userinfo` | OAuth access token | Claim sesuai scope. |
| `POST` | `/oauth/revoke` | Client + token | Cabut refresh token. |
| `GET` | `/oauth/logout` | Sesi Hub | Logout SSO dan cabut token terkait. |
| `GET` | `/.well-known/jwks.json` | Publik | Public key JWT aktif/retired. |
| `GET` | `/.well-known/oauth-authorization-server` | Publik | Metadata authorization server. |

Scope: `openid`, `profile:read`, dan `license:read`. Token hanya diterbitkan untuk akun aktif dengan lisensi `active`, `active_free`, atau `grace_period`.

## Mapping modul NestJS

| Modul | Controller |
|---|---|
| `AuthModule` | `AuthController`, `MeController` |
| `ProductsModule` | `ProductsController`, `PlansController` |
| `LicensesModule` | `LicensesController`, `DashboardController` |
| `OrdersModule` | `OrdersController` |
| `PaymentsModule` | `PaymentsController`, `WebhooksController` |
| `AdminModule` | `AdminMembersController`, `AdminProductsController`, `AdminOrdersController`, `AuditLogsController` |
| `OAuthModule` | `OAuthController`, `WellKnownController` |
