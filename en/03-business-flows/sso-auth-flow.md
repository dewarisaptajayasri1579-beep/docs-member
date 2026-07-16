# Single Sign-On (SSO) Authentication Flow — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the Single Sign-On (SSO) flow that allows members to access various SaaS applications using a single Membership Hub account.

## 2. Actors

- Member
- SaaS Application (e.g., NOTO)
- Membership Hub (SSO Provider)

## 3. Basic SSO Concept

```
Member Login
    │
    ▼
Membership Hub (SSO Provider)
    │── Validate account & license
    │
    ▼
JWT Token issued
    │
    ▼
SaaS Application receives token
    │── Verify token
    │── Read member_id, tier, product, expires_at
    │
    ▼
Member logs in to application dashboard
```

## 4. Member Login Flow to SaaS Application

### 4.1 Technical Steps

1. Member opens the SaaS application (e.g., `app.noto.com`).
2. Member clicks the **Login** button.
3. The SaaS application creates a `state` parameter (for CSRF security) and stores it temporarily.
4. The SaaS application redirects the member to the Membership Hub login endpoint:
   ```
   https://hub.domain.com/oauth/authorize
     ?client_id=[APP_CLIENT_ID]
     &redirect_uri=[CALLBACK_URL_APLIKASI]
     &response_type=code
     &state=[RANDOM_STATE]
     &scope=profile:read license:read
   ```
5. The member enters their email and password on the Hub login page.
6. The Hub validates:
   - member credentials,
   - account status (`active`),
   - and the presence of an active license for the requested product.
7. If valid, the Hub redirects back to the application with an **authorization code**:
   ```
   https://callback.noto.com/auth/callback
     ?code=[AUTH_CODE]
     &state=[RANDOM_STATE]
   ```
8. The SaaS application verifies the `state` to prevent CSRF.
9. The SaaS application exchanges the `code` with the Hub via a backend-to-backend request:
   ```
   POST https://hub.domain.com/oauth/token
   Body: {
     client_id, client_secret, code, redirect_uri, grant_type: "authorization_code"
   }
   ```
10. The Hub returns a JWT Access Token:
    ```json
    {
      "access_token": "eyJhbGci...",
      "token_type": "Bearer",
      "expires_in": 3600,
      "refresh_token": "..."
    }
    ```
11. The SaaS application reads and verifies the JWT contents:
    ```json
    {
      "sub": "member_id",
      "name": "Member Name",
      "email": "member@example.com",
      "product": "NTO",
      "license_id": "NTO-A1B2-C3D4-E5F6",
      "tier": "free",
      "license_status": "active_free",
      "expires_at": null,
      "iat": 1720000000,
      "exp": 1720003600
    }
    ```
12. The SaaS application creates a local session based on the token contents.
13. The member successfully logs in to the application dashboard.

---

## 5. Refresh Token Flow

When the Access Token is about to expire:

1. The SaaS application sends the Refresh Token to the Hub.
2. The Hub verifies the Refresh Token and license status.
3. If the license is still active, the Hub issues a new Access Token.
4. If the license is inactive/suspended, the Hub rejects and returns an error `license_inactive`.
5. The SaaS application redirects the member to the renewal page.

---

## 6. Logout Flow

1. The member chooses to log out from the SaaS application.
2. The SaaS application deletes the local session and stored token.
3. The SaaS application can optionally redirect to the Hub logout endpoint:
   ```
   https://hub.domain.com/oauth/logout
     ?post_logout_redirect_uri=[POST_LOGOUT_REDIRECT_URI]
   ```
4. The Hub terminates the member's Hub session.
5. The member is redirected to the specified page.

---

## 7. JWT Token Contents

| Field | Type | Description |
|---|---|---|
| `sub` | string | Unique member ID |
| `name` | string | Member full name |
| `email` | string | Member email |
| `product` | string | SaaS product code |
| `license_id` | string | Member license ID for this product |
| `tier` | string | Active tier (`free`, `pro`, `business`) |
| `license_status` | string | License status (`active`, `active_free`, `grace_period`, `suspended`) |
| `expires_at` | timestamp / null | License expiration time (`null` if free forever) |
| `iat` | timestamp | Token issuance time |
| `exp` | timestamp | Token expiration time |

---

## 8. Verifying Tokens in SaaS Applications

SaaS applications verify JWT using the **Public Key** of the Hub (RS256):

1. The application retrieves the public key from the endpoint:
   ```
   GET https://hub.domain.com/.well-known/jwks.json
   ```
2. The application verifies the token signature using the public key.
3. The application checks the `exp` is not expired.
4. The application checks `product` matches the application code.
5. The application checks `license_status` = `active`, `active_free`, or `grace_period`.
6. If all valid, the member is allowed to log in.

---

## 9. Failure Conditions and Handling

| Condition | Hub Response | SaaS Application Action |
|---|---|---|
| Incorrect credentials | `401 invalid_credentials` | Display login error message |
| Unverified email | `403 email_not_verified` | Redirect to verification page |
| Suspended account | `403 account_suspended` | Display contact support message |
| No license for product | `403 no_license` | Redirect to select package page |
| Suspended license | `403 license_suspended` | Redirect to renewal page |
| Expired token | `401 token_expired` | Refresh token |
| Invalid refresh token | `401 invalid_refresh_token` | Redirect to login again |

---

## 10. SSO Security

- JWT is signed using the **RS256** algorithm (asymmetric).
- The private key is stored only on the Hub server.
- The public key can be accessed by the application for verification.
- Access Tokens have a short validity period (e.g., 1 hour).
- Refresh Tokens have a longer validity period (e.g., 30 days).
- The `state` parameter is used to prevent CSRF attacks.
- All communication uses HTTPS.
- SaaS applications must not store member credentials (passwords).

---

## 11. Integrating New SaaS Applications

Each SaaS application wishing to join the ecosystem must:

1. Register with the Hub as an OAuth2 Client.
2. Obtain `client_id` and `client_secret`.
3. Register the allowed `redirect_uri`.
4. Implement the OAuth2 Authorization Code flow according to this document.
5. Verify JWT using the Hub's public key.

---

## 12. Acceptance Criteria

- Members can log in to the SaaS application through the Hub without separate login.
- JWT contains accurate license information.
- Applications can verify tokens without contacting the Hub for each request.
- Members with inactive licenses cannot log in to the application.
- Logout correctly deletes sessions.
- Refresh tokens can automatically update access tokens.
- The `state` parameter prevents CSRF attacks.