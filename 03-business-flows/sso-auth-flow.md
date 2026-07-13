# SSO Authentication Flow — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan alur Single Sign-On (SSO) yang memungkinkan member mengakses berbagai aplikasi SaaS menggunakan satu akun Membership Hub.

## 2. Aktor

- Member
- Aplikasi SaaS (misal: NOTO)
- Membership Hub (SSO Provider)

## 3. Konsep Dasar SSO

```
Member Login
    │
    ▼
Membership Hub (SSO Provider)
    │── Validasi akun & lisensi
    │
    ▼
JWT Token diterbitkan
    │
    ▼
Aplikasi SaaS menerima token
    │── Verifikasi token
    │── Baca member_id, tier, product, expires_at
    │
    ▼
Member masuk ke dashboard aplikasi
```

## 4. Alur Login Member ke Aplikasi

### 4.1 Langkah Teknis

1. Member membuka aplikasi SaaS (misal: `app.noto.com`).
2. Member menekan tombol **Login**.
3. Aplikasi SaaS membuat `state` parameter (untuk keamanan CSRF) dan menyimpannya sementara.
4. Aplikasi SaaS mengarahkan (redirect) member ke endpoint login Membership Hub:
   ```
   https://hub.domain.com/oauth/authorize
     ?client_id=[APP_CLIENT_ID]
     &redirect_uri=[CALLBACK_URL_APLIKASI]
     &response_type=code
     &state=[RANDOM_STATE]
     &scope=profile:read license:read
   ```
5. Member memasukkan email dan kata sandi di halaman login Hub.
6. Hub memvalidasi:
   - kredensial member,
   - status akun (`active`),
   - dan keberadaan lisensi aktif untuk produk yang meminta akses.
7. Jika valid, Hub mengarahkan kembali ke aplikasi dengan **authorization code**:
   ```
   https://callback.noto.com/auth/callback
     ?code=[AUTH_CODE]
     &state=[RANDOM_STATE]
   ```
8. Aplikasi SaaS memverifikasi `state` untuk mencegah CSRF.
9. Aplikasi SaaS menukar `code` ke Hub melalui backend-to-backend request:
   ```
   POST https://hub.domain.com/oauth/token
   Body: {
     client_id, client_secret, code, redirect_uri, grant_type: "authorization_code"
   }
   ```
10. Hub mengembalikan JWT Access Token:
    ```json
    {
      "access_token": "eyJhbGci...",
      "token_type": "Bearer",
      "expires_in": 3600,
      "refresh_token": "..."
    }
    ```
11. Aplikasi SaaS membaca dan memverifikasi isi JWT:
    ```json
    {
      "sub": "member_id",
      "name": "Nama Member",
      "email": "email@member.com",
      "product": "NTO",
      "license_id": "NTO-A1B2-C3D4-E5F6",
      "tier": "free",
      "license_status": "active_free",
      "expires_at": null,
      "iat": 1720000000,
      "exp": 1720003600
    }
    ```
12. Aplikasi SaaS membuat sesi lokal berdasarkan isi token.
13. Member berhasil masuk ke dashboard aplikasi.

---

## 5. Alur Refresh Token

Ketika Access Token mendekati kedaluwarsa:

1. Aplikasi SaaS mengirim Refresh Token ke Hub.
2. Hub memverifikasi Refresh Token dan status lisensi.
3. Jika lisensi masih aktif, Hub menerbitkan Access Token baru.
4. Jika lisensi tidak aktif / suspend, Hub menolak dan mengembalikan error `license_inactive`.
5. Aplikasi SaaS mengarahkan member ke halaman perpanjangan.

---

## 6. Alur Logout

1. Member memilih logout di aplikasi SaaS.
2. Aplikasi SaaS menghapus sesi lokal dan token yang tersimpan.
3. Aplikasi SaaS dapat (opsional) mengarahkan ke endpoint logout Hub:
   ```
   https://hub.domain.com/oauth/logout
     ?post_logout_redirect_uri=[HALAMAN_SETELAH_LOGOUT]
   ```
4. Hub mengakhiri sesi Hub member.
5. Member diarahkan ke halaman yang ditentukan.

---

## 7. Isi JWT Token

| Field | Tipe | Keterangan |
|---|---|---|
| `sub` | string | ID unik member |
| `name` | string | Nama lengkap member |
| `email` | string | Email member |
| `product` | string | Kode produk SaaS |
| `license_id` | string | License-ID member untuk produk ini |
| `tier` | string | Paket yang aktif (`free`, `pro`, `business`) |
| `license_status` | string | Status lisensi (`active`, `active_free`, `grace_period`, `suspended`) |
| `expires_at` | timestamp / null | Waktu kedaluwarsa lisensi (`null` jika gratis selamanya) |
| `iat` | timestamp | Waktu token diterbitkan |
| `exp` | timestamp | Waktu token kedaluwarsa |

---

## 8. Cara Aplikasi SaaS Memverifikasi Token

Aplikasi SaaS memverifikasi JWT menggunakan **Public Key** Hub (RS256):

1. Aplikasi mengambil public key dari endpoint:
   ```
   GET https://hub.domain.com/.well-known/jwks.json
   ```
2. Aplikasi memverifikasi signature token menggunakan public key.
3. Aplikasi memeriksa nilai `exp` tidak kedaluwarsa.
4. Aplikasi memeriksa `product` sesuai dengan kode aplikasi.
5. Aplikasi memeriksa `license_status` = `active`, `active_free`, atau `grace_period`.
6. Jika semua valid, member diizinkan masuk.

---

## 9. Kondisi Gagal dan Penanganannya

| Kondisi | Respons Hub | Tindakan Aplikasi |
|---|---|---|
| Kredensial salah | `401 invalid_credentials` | Tampilkan pesan error login |
| Akun belum diverifikasi | `403 email_not_verified` | Arahkan ke halaman verifikasi |
| Akun dinonaktifkan | `403 account_suspended` | Tampilkan pesan hubungi dukungan |
| Tidak punya lisensi produk | `403 no_license` | Arahkan ke halaman pilih paket |
| Lisensi suspend | `403 license_suspended` | Arahkan ke halaman perpanjangan |
| Token kedaluwarsa | `401 token_expired` | Lakukan refresh token |
| Refresh token tidak valid | `401 invalid_refresh_token` | Arahkan ke login ulang |

---

## 10. Keamanan SSO

- JWT ditandatangani menggunakan algoritma **RS256** (asymmetric).
- Private key hanya tersimpan di server Hub.
- Public key dapat diakses oleh aplikasi untuk verifikasi.
- Access Token memiliki masa berlaku singkat (misal: 1 jam).
- Refresh Token memiliki masa berlaku lebih panjang (misal: 30 hari).
- State parameter digunakan untuk mencegah serangan CSRF.
- Seluruh komunikasi menggunakan HTTPS.
- Aplikasi SaaS tidak boleh menyimpan kredensial (password) member.

---

## 11. Integrasi Aplikasi SaaS Baru

Setiap aplikasi SaaS yang ingin bergabung ke ekosistem harus:

1. Mendaftarkan diri ke Hub sebagai OAuth2 Client.
2. Mendapatkan `client_id` dan `client_secret`.
3. Mendaftarkan `redirect_uri` yang diizinkan.
4. Mengimplementasikan alur OAuth2 Authorization Code sesuai dokumen ini.
5. Memverifikasi JWT menggunakan public key Hub.

---

## 12. Acceptance Criteria

- Member dapat login ke aplikasi SaaS melalui Hub tanpa login ulang secara terpisah.
- JWT berisi informasi lisensi yang akurat.
- Aplikasi dapat memverifikasi token tanpa menghubungi Hub untuk setiap request.
- Member dengan lisensi tidak aktif tidak dapat masuk ke aplikasi.
- Logout menghapus sesi dengan benar.
- Refresh token dapat memperbarui access token secara otomatis.
- State parameter mencegah CSRF.
