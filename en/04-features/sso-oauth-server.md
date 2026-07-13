# SSO / OAuth2 Server Feature — Central Membership & SSO Hub

## 1. Document Purpose

This document describes the specifications for the SSO / OAuth2 Server feature run by the Membership Hub. The SSO Hub functions as an **Identity Provider (IdP)** that issues authentication tokens to SaaS applications within the ecosystem.

---

# 2. Role of Membership Hub as an OAuth2 Server

The Membership Hub implements **OAuth2 Authorization Code Flow with PKCE** as the authentication standard.

```
The Hub acts as:
├── Authorization Server  →  Issues authorization code & token
├── Identity Provider     →  Stores & validates member identities
└── Resource Server       →  Provides member profile & license information
```

Each SaaS application joining the ecosystem acts as:

```
SaaS applications act as:
└── OAuth2 Client (Relying Party)  →  Requests access on behalf of the member
```

---

# 3. OAuth2 Endpoints

## 3.1 List of Main Endpoints

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

| Parameter | Required | Description |
|---|---|---|
| `client_id` | Yes | Registered OAuth2 client ID |
| `redirect_uri` | Yes | Registered callback URL |
| `response_type` | Yes | Must be `code` |
| `scope` | Yes | Requested scope |
| `state` | Yes | Random value to prevent CSRF |
| `code_challenge` | Yes (PKCE) | Hash of `code_verifier` |
| `code_challenge_method` | Yes (PKCE) | Must be `S256` |

**Success Response** — Redirect to `redirect_uri`:

```
https://app.noto.com/auth/callback
  ?code=AUTH_CODE
  &state=RANDOM_CSRF_STATE
```

**Error Response** — Redirect with error:

```
https://app.noto.com/auth/callback
  ?error=access_denied
  &error_description=License+not+found
  &state=RANDOM_CSRF_STATE
```

---

## 3.3 `/oauth/token` — Token Endpoint

### 3.3.1 Exchange Authorization Code for Token

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

JWTs are signed using **RS256** (RSA Signature with SHA-256).

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

## 4.3 Claims Explanation

| Claim | Type | Description |
|---|---|---|
| `sub` | string | Unique member ID (Subject) |
| `name` | string | Member's full name |
| `email` | string | Member's email |
| `email_verified` | boolean | Whether email has been verified |
| `product` | string | SaaS product code that allows login |
| `license_id` | string | Member's License-ID for this product |
| `tier` | string | Active plan (`free`, `pro`, `business`) |
| `license_status` | string | License status (`active`, `active_free`, `grace_period`, `suspended`) |
| `expires_at` | timestamp / null | License expiration time (`null` = free forever) |
| `iss` | string | Issuer: Hub URL |
| `aud` | string | Audience: SaaS application `client_id` |
| `iat` | timestamp | Time token was issued (Issued At) |
| `exp` | timestamp | Time token expires (Expiry) |
| `jti` | string | Unique token ID (JWT ID) for revocation |

---

# 5. Available Scopes

| Scope | Accessible Data |
|---|---|
| `profile:read` | Name, email, profile picture |
| `license:read` | License-ID, tier, license status, expired_at |
| `openid` | Sub (member ID) — for OpenID Connect compatibility |

---

# 6. OAuth2 Client Registration (SaaS Application)

Each SaaS application joining the ecosystem must register itself as an OAuth2 Client.

## 6.1 Required Information

| Field | Example | Description |
|---|---|---|
| `client_name` | NOTO | Application name |
| `product_code` | NTO | Product code in the system |
| `redirect_uris` | `https://app.noto.com/auth/callback` | List of allowed callback URLs |
| `post_logout_redirect_uris` | `https://app.noto.com/logout` | URL after Hub logout |
| `logo_uri` | URL logo aplikasi | Displayed on the consent page |
| `homepage_uri` | `https://app.noto.com` | Application homepage URL |

## 6.2 Registration Result

After registration, the system issues:

```json
{
  "client_id": "noto-client-id-abc123",
  "client_secret": "secret_key_xyz789"
}
```

`client_secret` is displayed only once. Store it securely.

---

# 7. Public Key Rotation (JWKS)

- The Membership Hub uses an **RSA key pair** (private key + public key).
- The private key is used to sign JWTs (only present on the Hub server).
- The public key is published via the `/.well-known/jwks.json` endpoint.

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

- Keys can be rotated periodically for security.
- Old keys remain available in JWKS to validate tokens that are still active.
- After all old tokens expire, old keys are removed from JWKS.
- SaaS applications are advised to retrieve JWKS from the endpoint (not hardcode) and cache it.

---

# 8. Hub Session

- After a member successfully logs into the Hub, a **Hub session** is created on the server.
- The Hub session allows members to log into multiple different applications without having to enter credentials repeatedly (true SSO).
- The Hub session has an expiration period (e.g., 8 hours from the last login).
- The Hub session ends when the member logs out or the expiration period is over.

---

# 9. Logout and Token Revocation

## 9.1 Logout from SaaS Application

1. The application deletes local sessions and tokens.
2. The application (optional) redirects to Hub logout.

## 9.2 Logout from Hub (SSO Logout)

```
GET /oauth/logout
  ?post_logout_redirect_uri=https://app.noto.com/logout
```

After Hub logout:

- Hub session is deleted.
- Refresh token is revoked.
- The member needs to log in to the Hub again to get a new access token.

## 9.3 Manual Token Revocation

```http
POST /oauth/revoke
Authorization: Basic [BASE64(client_id:client_secret)]
Content-Type: application/x-www-form-urlencoded

token=REFRESH_TOKEN_TO_REVOKE
&token_type_hint=refresh_token
```

Used by:

- Super Admin to revoke specific member tokens in security cases.
- SaaS applications when detecting suspicious activity.

---

# 10. How SaaS Applications Verify JWTs

Mandatory verification steps for every SaaS application:

```
1. Retrieve the public key from /.well-known/jwks.json (cache, not per-request)
2. Verify the JWT signature using the public key with the RS256 algorithm
3. Check claim "iss" = "https://hub.domain.com"
4. Check claim "aud" = this application's client_id
5. Check claim "exp" has not expired
6. Check claim "product" matches this application's product code
7. Check claim "license_status" = "active", "active_free", or "grace_period"
```

If any step fails → deny access.

---

# 11. Security

| Aspect | Implementation |
|---|---|
| Signing algorithm | RS256 (asymmetric) |
| PKCE | Required to prevent authorization code interception |
| State parameter | Required to prevent CSRF |
| Redirect URI | Only registered URIs are accepted (exact match) |
| client_secret | Only used in backend-to-backend (not in frontend) |
| HTTPS | Required for all endpoints |
| Token expiry | Access Token: 1 hour; Refresh Token: 30 days |
| Token rotation | Refresh Token is rotated every time it's used |
| JTI | Each JWT has a unique ID for individual revocation |

---

# 12. Acceptance Criteria

- SaaS applications can complete the Authorization Code + PKCE flow.
- JWT contains all required claims with correct values.
- SaaS applications can verify JWTs using JWKS without contacting the Hub per request.
- Members with inactive licenses do not receive tokens.
- Refresh Token can update Access Token.
- Logout deletes the Hub session and revokes the Refresh Token.
- State and PKCE are validated; invalid requests are rejected.
- The JWKS endpoint is publicly accessible and returns valid keys.