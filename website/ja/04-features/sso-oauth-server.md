# SSO / OAuth2 サーバー機能 — 中央会員管理 & SSO ヘブ

## 1. ドキュメントの目的

このドキュメントは、Membership Hub が実行する SSO / OAuth2 サーバー機能の仕様を説明します。SSO ヘブは、**Identity Provider (IdP)** として機能し、SaaS エコシステム内のアプリケーションに認証トークンを発行します。

---

# 2. Membership Hub の OAuth2 サーバー機能

Membership Hub は、**OAuth2 Authorization Code Flow with PKCE** を実装して、認証標準を提供しています。

```
Hub の役割は次のとおりです。
├── Authorization Server  →  認証コード & トークンを発行
├── Identity Provider     →  メンバーの ID を保存 & 検証
└── Resource Server       →  メンバーのプロフィール & ライセンス情報を提供
```

各 SaaS アプリケーションは、エコシステムに参加することで、次の役割を担います。

```
SaaS アプリケーションは次の役割を担います。
└── OAuth2 クライアント (Relying Party)  →  メンバーの behalf でアクセスを要求
```

---

# 3. OAuth2 エンドポイント

## 3.1 主要エンドポイントの一覧

| エンドポイント | メソッド | 機能 |
|---|---|---|
| `/oauth/authorize` | `GET` | ログイン & 承認画面を表示 |
| `/oauth/token` | `POST` | 認証コードをトークンに交換 |
| `/oauth/token` | `POST` | リフレッシュトークンを使用してアクセストークンを更新 |
| `/oauth/revoke` | `POST` | トークンを取り消す |
| `/oauth/logout` | `GET` | Hub のセッションを終了 |
| `/oauth/userinfo` | `GET` | メンバーのプロフィール情報を取得 |
| `/.well-known/oauth-authorization-server` | `GET` | OAuth2 サーバーのメタデータ |
| `/.well-known/jwks.json` | `GET` | JWT の公開鍵を取得 |

---

## 3.2 `/oauth/authorize` — 認証エンドポイント

**リクエスト:**

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

**パラメーター:**

| パラメーター | 必須 | 説明 |
|---|---|---|
| `client_id` | はい | 登録済みの OAuth2 クライアント ID |
| `redirect_uri` | はい | 登録済みのリダイレクト URI |
| `response_type` | はい | 値が `code` である必要があります |
| `scope` | はい | 要求するスコープ |
| `state` | はい | CSRF を防ぐためのランダムな値 |
| `code_challenge` | はい (PKCE) | `code_verifier` のハッシュ値 |
| `code_challenge_method` | はい (PKCE) | 値が `S256` である必要があります |

**成功レスポンス** — リダイレクト先の URI:

```
https://app.noto.com/auth/callback
  ?code=AUTH_CODE
  &state=RANDOM_CSRF_STATE
```

**失敗レスポンス** — エラーを含むリダイレクト先の URI:

```
https://app.noto.com/auth/callback
  ?error=access_denied
  &error_description=License+not+found
  &state=RANDOM_CSRF_STATE
```

---

## 3.3 `/oauth/token` — トークンエンドポイント

### 3.3.1 認証コードをトークンに交換する

**リクエスト:**

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

**レスポンス:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_string",
  "scope": "profile:read license:read"
}
```

### 3.3.2 リフレッシュトークンを使用してアクセストークンを更新する

**リクエスト:**

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=REFRESH_TOKEN
&client_id=CLIENT_ID
&client_secret=CLIENT_SECRET
```

**レスポンス:** トークンを新しく取得した場合と同じです。

---

## 3.4 `/oauth/userinfo` — ユーザー情報エンドポイント

**リクエスト:**

```http
GET /oauth/userinfo
Authorization: Bearer ACCESS_TOKEN
```

**レスポンス:**

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

# 4. JWT アクセストークンの構造

JWT は **RS256** (RSA Signature with SHA-256) で署名されています。

## 4.1 ヘッダー

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id-001"
}
```

## 4.2 ペイロード (クレーム)

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

## 4.3 クレームの説明

| クレーム | タイプ | 説明 |
|---|---|---|
| `sub` | string | メンバーの ID (Subject) |
| `name` | string | メンバーの名前 |
| `email` | string | メンバーのメールアドレス |
| `email_verified` | boolean | メールアドレスが検証されているかどうか |
| `product` | string | SaaS の製品コード |
| `license_id` | string | メンバーのライセンス ID |
| `tier` | string | 有効なパッケージ (free, pro, business) |
| `license_status` | string | ライセンスの状態 (active, active_free, grace_period, suspended) |
| `expires_at` | timestamp / null | ライセンスの有効期限 (null = 無期限) |
| `iss` | string | 発行者: Hub の URL |
| `aud` | string | 対象者: SaaS アプリケーションの client_id |
| `iat` | timestamp | トークンが発行された時間 (Issued At) |
| `exp` | timestamp | トークンの有効期限 (Expiry) |
| `jti` | string | トークンの ID (JWT ID) |

---

# 5. 利用可能なスコープ

| スコープ | アクセス可能なデータ |
|---|---|
| `profile:read` | 名前、メールアドレス、プロフィール画像 |
| `license:read` | ライセンス ID、パッケージ、ライセンスの状態、有効期限 |
| `openid` | メンバーの ID (Subject) — OpenID Connect の互換性のために |

---

# 6. OAuth2 クライアント (SaaS アプリケーション) の登録

エコシステムに参加する各 SaaS アプリケーションは、OAuth2 クライアントとして登録する必要があります。

## 6.1 必要な情報

| フィールド | 例 | 説明 |
|---|---|---|
| `client_name` | NOTO | アプリケーションの名前 |
| `product_code` | NTO | システム内の製品コード |
| `redirect_uris`