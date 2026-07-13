# User Registration — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the specifications for member registration and account management features, from initial registration to profile management.

---

# 2. Registration Flow

## 2.1 Registration Steps

1.  Member opens the **Register** page on the Membership Hub.
2.  Member fills out the registration form.
3.  The system validates the data.
4.  The system creates an account with `unverified` status.
5.  The system sends a verification email.
6.  Member clicks the link in the email.
7.  The system activates the account to `active` status.
8.  Member is redirected to the dashboard page or package selection.

---

# 3. Registration Form

## 3.1 Required Fields

| Field | Type | Required | Validation Rules |
|---|---|---|---|
| Full Name | Text | Yes | Min 2 characters, max 100 characters |
| Email | Email | Yes | Valid format, unique in system, normalized lowercase |
| Password | Password | Yes | Min 8 characters, combination of letters and numbers |
| Confirm Password | Password | Yes | Must match password |

## 3.2 Optional Fields

| Field | Type | Description |
|---|---|---|
| Phone Number | Text | For communication purposes |

---

# 4. Validation Rules

## 4.1 Email

1.  Must be a valid email format.
2.  Normalized to lowercase and trimmed before saving.
    ```
    " Budi@Email.COM " → "budi@email.com"
    ```
3.  Must be unique; no two accounts can have the same email.
4.  Validation is performed on the frontend (UX) and backend (security).

## 4.2 Password

1.  Minimum 8 characters.
2.  Must contain at least one letter and one number.
3.  Cannot be exactly the same as the email.
4.  Stored as a **hash** using bcrypt or Argon2 (never plaintext).
5.  Never sent back to the client in any form.

## 4.3 Full Name

1.  Minimum 2 characters.
2.  Trim leading and trailing spaces.
3.  Cannot consist only of spaces or special characters.

---

# 5. Account Status

| Status | Code | Description |
|---|---|---|
| Unverified | `unverified` | Newly registered, email not yet confirmed |
| Active | `active` | Email verified, can log in |
| Suspended | `suspended` | Deactivated by Super Admin |

Status transitions:

```
[unverified] → (click verification link) → [active]
[active]     → (deactivated by admin)    → [suspended]
[suspended]  → (restored by admin)       → [active]
```

---

# 6. Email Verification

## 6.1 Mechanism

-   The system creates a unique **verification token** upon registration.
-   The token is sent via email as part of the verification link:
    ```
    https://hub.domain.com/verify-email?token=VERIFICATION_TOKEN
    ```
-   The token is **one-time use**: cannot be used more than once.
-   The token has an expiry period of **24 hours**.

## 6.2 When Member Clicks the Link

-   The system validates the token: exists, not used, not expired.
-   If valid: account is changed to `active`, token is marked as used.
-   If expired: display a page to resend the email.
-   If already used: display message "Account is already active, please log in."

## 6.3 Resend Verification Email

-   Member can request a resend as long as the account is still `unverified`.
-   The system creates a new token and sends a new email.
-   The old token automatically becomes invalid after a new token is created.
-   Maximum limit: e.g., 3 resends per hour (rate limiting).

---

# 7. Forgot Password

## 7.1 Flow

1.  Member opens the **Forgot Password** page.
2.  Member enters email.
3.  The system searches for an account with that email (normalized).
4.  If account found: send an email containing a password reset link.
5.  If account not found: display a generic message (does not confirm existence of email).
6.  Member clicks the link in the email.
7.  Member enters a new password.
8.  The system validates the new password.
9.  The system saves the new password hash.
10. All other active sessions are terminated.
11. Member is redirected to the login page.

## 7.2 Reset Token Rules

-   The password reset token is **one-time use**.
-   Expiry period: **1 hour**.
-   A new token invalidates any old, unused tokens.

---

# 8. Change Password (from Profile)

## 8.1 Flow

1.  Member opens the **Account Settings** page.
2.  Member fills in:
    -   current password,
    -   new password,
    -   confirm new password.
3.  The system validates the current password.
4.  The system validates the new password (same rules as registration).
5.  The system saves the new password hash.
6.  All active sessions on other devices are terminated (except the current session).
7.  The system sends a password change notification email.

---

# 9. Change Email

## 9.1 Flow

1.  Member opens the **Account Settings** page.
2.  Member enters a new email.
3.  The system validates:
    -   new email format,
    -   new email is different from current email,
    -   new email is not already used by another account.
4.  The system sends a verification email to the **new email**.
5.  The old email remains in use until verification is complete.
6.  Member clicks the link in the new email.
7.  The system updates the email to the new email.
8.  The system sends a notification to the old email.

---

# 10. Profile Management

## 10.1 Profile Information

| Field | Editable? | Description |
|---|---|---|
| Full Name | Yes | — |
| Email | Yes | Requires re-verification |
| Phone Number | Yes | — |
| Profile Picture | Yes | Image upload, optional |
| Password | Yes | Via a dedicated flow |
| Member ID | No | System-generated, cannot be changed |
| Registration Date | No | System-recorded |

## 10.2 Profile Picture

-   Accepted formats: JPG, PNG, WebP.
-   Maximum size: 2 MB.
-   Images are compressed and resized by the system.
-   If no photo, display name initials as default avatar.

---

# 11. Account Deletion

> **Note**: The account deletion feature will be further defined in a later version.

Principles to consider:

-   Accounts with active paid licenses cannot be directly deleted.
-   Financial transaction data must be retained according to applicable regulations.
-   Deletion requires password confirmation.

---

# 12. Data Stored Upon Registration

```json
{
  "id": "uuid-member-001",
  "name": "Budi Santoso",
  "email": "budi@email.com",
  "email_verified": false,
  "phone": null,
  "password_hash": "$2b$12$...",
  "status": "unverified",
  "created_at": "2026-07-12T14:00:00Z",
  "updated_at": "2026-07-12T14:00:00Z",
  "last_login_at": null
}
```

---

# 13. Emails Sent

| Event | Email |
|---|---|
| Successful registration | Email verification link |
| Account activated | Welcome + link to dashboard |
| Forgot password | Password reset link |
| Password successfully changed | Password change notification |
| Email change request | New email verification link |
| Email successfully changed | Notification to old email |

---

# 14. Account Security

1.  Passwords are stored as hash (bcrypt/Argon2), never plaintext.
2.  Verification and reset tokens are one-time use.
3.  Rate limiting is applied to:
    -   registration endpoint,
    -   login endpoint,
    -   forgot password endpoint,
    -   resend verification endpoint.
4.  Password changes terminate all other active sessions.
5.  Sensitive changes (password, email) are always notified to the previous email.

---

# 15. Acceptance Criteria

-   Members can register with a valid email and password.
-   Already registered emails cannot be reused.
-   Verification email is sent after registration.
-   Accounts with `unverified` status cannot log in to SaaS applications.
-   Expired verification links present a resend option.
-   The forgot password feature does not confirm whether an email is registered or not.
-   Password reset tokens expire after 1 hour and are one-time use.
-   Password changes terminate other sessions.
-   Email changes require verification to the new email.
-   Passwords are never displayed or stored in plain text.