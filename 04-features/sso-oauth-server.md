# SSO / OAuth2 Server Feature — Central Membership & SSO Hub

## 1. Tujuan Dokumen

Dokumen ini menjelaskan spesifikasi fitur SSO / OAuth2 Server yang dijalankan oleh Membership Hub. SSO Hub berfungsi sebagai **Identity Provider (IdP)** yang menerbitkan token autentikasi kepada aplikasi SaaS dalam ekosistem.

---

# 2. Peran Membership Hub sebagai OAuth2 Server

Membership Hub mengimplementasikan **OAuth2 Authorization Code Flow with PKCE** sebagai standar autentikasi.

```
Hub berperan sebagai:
├── Authorization Server  →  Menerbitkan authorization code & token
├── Identity Provider     →  Menyimpan & memvalidasi identitas member
└── Resource Server       →  Menyediakan informasi profil & lisensi member
```

Setiap aplikasi SaaS yang bergabung ke ekosistem berperan sebagai:

```
Aplikasi SaaS berperan sebagai:
└── OAuth2 Client (Relying Party)  →  Meminta akses atas nama member
```

---

# 3. Endpoints OAuth2

## 3.1 Daftar Endpoint Utama

| Endpoint | Metode | Fungsi |
|---|---|---|
| `/oauth/authorize` | `GET` | Menampilkan halaman login & persetujuan |
| `/oauth/token` | `POST` | Menukar authorization code dengan token |
| `/oauth/token` | `POST` | Refresh access token menggunakan refresh token |
| `/oauth/revoke` | `POST` | Mencabut token |
| `/oauth/logout` | `GET` | Mengakhiri sesi Hub |
| `/oauth/userinfo` | `GET` | Mengambil informasi profil member |
| `/.well-known/oauth-authorization-server` | `GET` | Metadata server OAuth2 |
| `/.well-known/jwks.json` | `GET` | Public key untuk verifikasi JWT |

---

## 3.2 `/oauth/authorize` — Authorization Endpoint

**Request:**

```
GET /oauth/authorize
  ?client_id=CLIENT_ID
  &redirect_uri=https://app.noto.com/auth/callback
  &response_type=code
  &scope=profile:read license:read
  &state=RANDOM_CSRF_STATE
  &code_challenge=PKCE_CODE_CHALLENGE
  &code_challenge_method=S256
```

**Parameter:**

| Parameter | Wajib | Keterangan |
|---|---|---|
| `client_id` | Ya | ID OAuth2 client yang terdaftar |
| `redirect_uri` | Ya | URL callback yang terdaftar |
| `response_type` | Ya | Harus bernilai `code` |
| `scope` | Ya | Scope yang diminta |
| `state` | Ya | Nilai acak untuk mencegah CSRF |
| `code_challenge` | Ya (PKCE) | Hash dari `code_verifier` |
| `code_challenge_method` | Ya (PKCE) | Harus bernilai `S256` |

**Respons Sukses** — Redirect ke `redirect_uri`:

```
https://app.noto.com/auth/callback
  ?code=AUTH_CODE
  &state=RANDOM_CSRF_STATE
```

**Respons Gagal** — Redirect dengan error:

```
https://app.noto.com/auth/callback
  ?error=access_denied
  &error_description=License+not+found
  &state=RANDOM_CSRF_STATE
```

---

## 3.3 `/oauth/token` — Token Endpoint

### 3.3.1 Tukar Authorization Code dengan Token

**Request:**

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE
&redirect_uri=https://app.noto.com/auth/callback
&client_id=CLIENT_ID
&client_secret=CLIENT_SECRET
&code_verifier=PKCE_CODE_VERIFIER
```

**Respons:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_string",
  "scope": "profile:read license:read"
}
```

### 3.3.2 Refresh Access Token

**Request:**

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=REFRESH_TOKEN
&client_id=CLIENT_ID
&client_secret=CLIENT_SECRET
```

**Respons:** Sama seperti respons token baru.

---

## 3.4 `/oauth/userinfo` — UserInfo Endpoint

**Request:**

```http
GET /oauth/userinfo
Authorization: Bearer ACCESS_TOKEN
```

**Respons:**

```json
{
  "sub": "member_id_123",
  "name": "Budi Santoso",
  "email": "budi@email.com",
  "email_verified": true,
  "picture": null
}
```

---

# 4. Struktur JWT Access Token

JWT ditandatangani menggunakan **RS256** (RSA Signature with SHA-256).

## 4.1 Header

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id-001"
}
```

## 4.2 Payload (Claims)

```json
{
  "sub": "member_id_123",
  "name": "Budi Santoso",
  "email": "budi@email.com",
  "email_verified": true,
  "product": "NTO",
  "license_id": "NTO-A1B2-C3D4-E5F6",
  "tier": "free",
  "license_status": "active_free",
  "expires_at": null,
  "iss": "https://hub.domain.com",
  "aud": "noto-client-id",
  "iat": 1720000000,
  "exp": 1720003600,
  "jti": "unique-token-id"
}
```

## 4.3 Penjelasan Claims

| Claim | Tipe | Keterangan |
|---|---|---|
| `sub` | string | ID unik member (Subject) |
| `name` | string | Nama lengkap member |
| `email` | string | Email member |
| `email_verified` | boolean | Apakah email sudah diverifikasi |
| `product` | string | Kode produk SaaS yang mengizinkan login |
| `license_id` | string | License-ID member untuk produk ini |
| `tier` | string | Paket aktif (`free`, `pro`, `business`) |
| `license_status` | string | Status lisensi (`active`, `active_free`, `grace_period`, `suspended`) |
| `expires_at` | timestamp / null | Masa berakhir lisensi (`null` = free forever) |
| `iss` | string | Issuer: URL Hub |
| `aud` | string | Audience: `client_id` aplikasi SaaS |
| `iat` | timestamp | Waktu token diterbitkan (Issued At) |
| `exp` | timestamp | Waktu token kedaluwarsa (Expiry) |
| `jti` | string | ID unik token (JWT ID) untuk pencabutan |

---

# 5. Scope yang Tersedia

| Scope | Data yang Dapat Diakses |
|---|---|
| `profile:read` | Nama, email, foto profil |
| `license:read` | License-ID, tier, status lisensi, expired_at |
| `openid` | Sub (ID member) — untuk kompatibilitas OpenID Connect |

---

# 6. Pendaftaran OAuth2 Client (Aplikasi SaaS)

Setiap aplikasi SaaS yang bergabung ke ekosistem harus mendaftarkan diri sebagai OAuth2 Client.

## 6.1 Informasi yang Diperlukan

| Field | Contoh | Keterangan |
|---|---|---|
| `client_name` | NOTO | Nama aplikasi |
| `product_code` | NTO | Kode produk di sistem |
| `redirect_uris` | `https://app.noto.com/auth/callback` | Daftar URL callback yang diizinkan |
| `post_logout_redirect_uris` | `https://app.noto.com/logout` | URL setelah logout Hub |
| `logo_uri` | URL logo aplikasi | Ditampilkan di halaman persetujuan |
| `homepage_uri` | `https://app.noto.com` | URL halaman utama aplikasi |

## 6.2 Hasil Pendaftaran

Setelah didaftarkan, sistem menerbitkan:

```json
{
  "client_id": "noto-client-id-abc123",
  "client_secret": "secret_key_xyz789"
}
```

`client_secret` hanya ditampilkan sekali. Simpan dengan aman.

---

# 7. Rotasi Public Key (JWKS)

- Membership Hub menggunakan **pasangan kunci RSA** (private key + public key).
- Private key digunakan untuk menandatangani JWT (hanya ada di server Hub).
- Public key dipublikasikan melalui endpoint `/.well-known/jwks.json`.

**Contoh respons JWKS:**

```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "key-id-001",
      "alg": "RS256",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

**Rotasi key:**

- Key dapat dirotasi secara berkala untuk keamanan.
- Key lama tetap tersedia di JWKS untuk memvalidasi token yang masih aktif.
- Setelah semua token lama expired, key lama dihapus dari JWKS.
- Aplikasi SaaS disarankan mengambil JWKS dari endpoint (bukan hardcode) dan menyimpan cache-nya.

---

# 8. Sesi Hub

- Setelah member berhasil login ke Hub, **sesi Hub** dibuat di server.
- Sesi Hub memungkinkan member login ke beberapa aplikasi berbeda tanpa harus memasukkan kredensial berulang kali (true SSO).
- Sesi Hub memiliki masa berlaku (misal: 8 jam dari login terakhir).
- Sesi Hub berakhir saat member logout atau masa berlaku habis.

---

# 9. Logout dan Pencabutan Token

## 9.1 Logout dari Aplikasi SaaS

1. Aplikasi menghapus sesi lokal dan token.
2. Aplikasi (opsional) mengarahkan ke logout Hub.

## 9.2 Logout dari Hub (SSO Logout)

```
GET /oauth/logout
  ?post_logout_redirect_uri=https://app.noto.com/logout
```

Setelah logout Hub:

- Sesi Hub dihapus.
- Refresh token dicabut.
- Member perlu login ulang ke Hub untuk mendapatkan access token baru.

## 9.3 Pencabutan Token Manual (Revocation)

```http
POST /oauth/revoke
Authorization: Basic [BASE64(client_id:client_secret)]
Content-Type: application/x-www-form-urlencoded

token=REFRESH_TOKEN_TO_REVOKE
&token_type_hint=refresh_token
```

Digunakan oleh:

- Super Admin untuk mencabut token member tertentu dalam kasus keamanan.
- Aplikasi SaaS saat mendeteksi aktivitas mencurigakan.

---

# 10. Cara Aplikasi SaaS Memverifikasi JWT

Langkah verifikasi yang wajib dilakukan oleh setiap aplikasi SaaS:

```
1. Ambil public key dari /.well-known/jwks.json (cache, jangan per-request)
2. Verifikasi signature JWT menggunakan public key dengan algoritma RS256
3. Periksa claim "iss" = "https://hub.domain.com"
4. Periksa claim "aud" = client_id aplikasi ini
5. Periksa claim "exp" belum kedaluwarsa
6. Periksa claim "product" sesuai kode produk aplikasi ini
7. Periksa claim "license_status" = "active", "active_free", atau "grace_period"
```

Jika salah satu langkah gagal → tolak akses.

---

# 11. Keamanan

| Aspek | Implementasi |
|---|---|
| Algoritma signing | RS256 (asymmetric) |
| PKCE | Wajib untuk mencegah authorization code interception |
| State parameter | Wajib untuk mencegah CSRF |
| Redirect URI | Hanya URI yang terdaftar yang diterima (exact match) |
| client_secret | Hanya digunakan di backend-to-backend (tidak di frontend) |
| HTTPS | Wajib untuk semua endpoint |
| Token expiry | Access Token: 1 jam; Refresh Token: 30 hari |
| Token rotation | Refresh Token dirotasi setiap kali digunakan |
| JTI | Setiap JWT memiliki ID unik untuk pencabutan individual |

---

# 12. Acceptance Criteria

- Aplikasi SaaS dapat menyelesaikan alur Authorization Code + PKCE.
- JWT berisi semua klaim yang diperlukan dengan nilai yang benar.
- Aplikasi SaaS dapat memverifikasi JWT menggunakan JWKS tanpa menghubungi Hub per request.
- Member dengan lisensi tidak aktif tidak mendapat token.
- Refresh Token dapat memperbarui Access Token.
- Logout menghapus sesi Hub dan mencabut Refresh Token.
- State dan PKCE divalidasi; request yang tidak valid ditolak.
- Endpoint JWKS dapat diakses publik dan mengembalikan key yang valid.
