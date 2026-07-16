# Single Sign-On (SSO) / OAuth2 Server Feature — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the specifications of the SSO / OAuth2 Server feature run by the Membership Hub. The SSO Hub functions as an **Identity Provider (IdP)** that issues authentication tokens to SaaS applications within the ecosystem.

---

# 2. Membership Hub as OAuth2 Server

Membership Hub implements **OAuth2 Authorization Code Flow with PKCE** as the authentication standard.

```
Hub plays the role of:
├── Authorization Server  →  Issues authorization code & token
├── Identity Provider     →  Stores & validates member identities
└── Resource Server       →  Provides member profile & license information
```

Each SaaS application that joins the ecosystem plays the role of:

```
SaaS application plays the role of:
└── OAuth2 Client (Relying Party)  →  Requests access on behalf of the member
```

---

# 3. OAuth2 Endpoints

## 3.1 Main Endpoints

| Endpoint | Method | Function |
|---|---|---|
| `/oauth/authorize` | `GET` | Displays login & consent page |
| `/oauth/token` | `POST` | Exchanges authorization code for token |
| `/oauth/token` | `POST` | Refreshes access token using refresh token |
| `/oauth/revoke` | `POST` | Revokes token |
| `/oauth/logout` | `GET` | Ends Hub session |
| `/oauth/userinfo` | `GET` | Retrieves member profile information |
| `/.well-known/oauth-authorization-server` | `GET` | OAuth2 server metadata |
| `/.well-known/jwks.json` | `GET` | Public key for JWT verification |

---

## 3.2 `/oauth/authorize` — Authorization Endpoint

**Request:**

```http
GET /oauth/authorize
  ?client_id=CLIENT_ID
  &redirect_uri=https://app.noto.com/auth/callback
  &response_type=code
  &scope=profile:read license:read
  &state=RANDOM_CSRF_STATE
  &code_challenge=PKCE_CODE_CHALLENGE
  &code_challenge_method=S256
```

**Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `client_id` | Yes | Registered OAuth2 client ID |
| `redirect_uri` | Yes | Registered callback URL |
| `response_type` | Yes | Must be `code` |
| `scope` | Yes | Requested scope |
| `state` | Yes | Random value for CSRF prevention |
| `code_challenge` | Yes (PKCE) | Hash of `code_verifier` |
| `code_challenge_method` | Yes (PKCE) | Must be `S256` |

**Successful Response** — Redirect to `redirect_uri`:

```http
https://app.noto.com/auth/callback
  ?code=AUTH_CODE
  &state=RANDOM_CSRF_STATE
```

**Error Response** — Redirect with error:

```http
https://app.noto.com/auth/callback
  ?error=access_denied
  &error_description=License+not+found
  &state=RANDOM_CSRF_STATE
```

---

## 3.3 `/oauth/token` — Token Endpoint

### 3.3.1 Exchanging Authorization Code for Token

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

**Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_string",
  "scope": "profile:read license:read"
}
```

### 3.3.2 Refreshing Access Token

**Request:**

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=REFRESH_TOKEN
&client_id=CLIENT_ID
&client_secret=CLIENT_SECRET
```

**Response:** Same as new token response.

---

## 3.4 `/oauth/userinfo` — UserInfo Endpoint

**Request:**

```http
GET /oauth/userinfo
Authorization: Bearer ACCESS_TOKEN
```

**Response:**

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

# 4. JWT Access Token Structure

JWT is signed using **RS256** (RSA Signature with SHA-256).

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

## 4.3 Claim Explanation

| Claim | Type | Description |
|---|---|---|
| `sub` | string | Unique member ID (Subject) |
| `name` | string | Member full name |
| `email` | string | Member email |
| `email_verified` | boolean | Whether email is verified |
| `product` | string | SaaS product code that allows login |
| `license_id` | string | Member license-ID for this product |
| `tier` | string | Active package (`free`, `pro`, `business`) |
| `license_status` | string | License status (`active`, `active_free`, `grace_period`, `suspended`) |
| `expires_at` | timestamp / null | License expiration time (`null` = free forever) |
| `iss` | string | Issuer: Hub URL |
| `aud` | string | Audience: `client_id` of SaaS application |
| `iat` | timestamp | Token issuance time (Issued At) |
| `exp` | timestamp | Token expiry time (Expiry) |
| `jti` | string | Unique token ID (JWT ID) for revocation |

---

# 5. Available Scopes

| Scope | Accessible Data |
|---|---|
| `profile:read` | Name, email, profile picture |
| `license:read` | License-ID, tier, license status, expired_at |
| `openid` | Sub (member ID) — for OpenID Connect compatibility |

---

# 6. Registering OAuth2 Client (SaaS Application)

Each SaaS application that joins the ecosystem must register itself as an OAuth2 Client.

## 6.1 Required Information

| Field | Example | Description |
|---|---|---|
| `client_name` | NOTO | Application name |
| `product_code` | NTO | Product code in the system |
| `redirect_uris` | `https://app.noto.com/auth/callback` | List of allowed callback URLs |
| `post_logout_redirect_uris` | `https://app.noto.com/logout` | URL after Hub logout |
| `logo_uri` | Application logo URL | Displayed on consent page |
| `homepage_uri` | `https://app.noto.com` | Application homepage URL |

## 6.2 Registration Result

After registration, the system issues:

```json
{
  "client_id": "noto-client-id-abc123",
  "client_secret": "secret_key_xyz789"
}
```

`client_secret` is only shown once. Save it securely.

---

# 7. Rotating Public Key (JWKS)

- Membership Hub uses a **RSA key pair** (private key + public key).
- Private key is used to sign JWT (only on the server).
- Public key is published through the `/.well-known/jwks.json` endpoint.

**Example JWKS response:**

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

**Key rotation:**

- Key can be rotated periodically for security.
- Old key remains available in JWKS for validating active tokens.
- After all old tokens expire, old key is removed from JWKS.
- SaaS applications are recommended to fetch JWKS from the endpoint (not hardcode) and cache it.

---

# 8. Hub Session

- After a member successfully logs in to Hub, a **Hub session** is created on the server.
- Hub session allows members to log in to multiple applications without re-entering credentials (true SSO).
- Hub session has an expiration time (e.g., 8 hours from last