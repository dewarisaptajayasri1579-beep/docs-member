# User Registration — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the specifications for user registration and member account management features, from initial registration to profile management.

---

# 2. Registration Flow

## 2.1 Registration Steps

1. The member opens the **Register** page on the Membership Hub.
2. The member fills out the registration form.
3. The system validates the data.
4. The system creates an account with a status of `unverified`.
5. The system sends a verification email.
6. The member clicks the link in the email.
7. The system activates the account to the `active` status.
8. The member is redirected to the dashboard or selects a package.

---

# 3. Registration Form

## 3.1 Required Fields

| Field | Type | Required | Validation Rules |
|---|---|---|---|
| Full Name | Text | Yes | Min 2 characters, max 100 characters |
| Email | Email | Yes | Valid format, unique in the system, normalized to lowercase |
| Password | Password | Yes | Min 8 characters, combination of letters and numbers |
| Confirm Password | Password | Yes | Must match the password |

## 3.2 Optional Fields

| Field | Type | Description |
|---|---|---|
| Phone Number | Text | For communication purposes |

---

# 4. Validation Rules

## 4.1 Email

1. Must be in a valid email format.
2. Normalized to lowercase and trimmed before saving.
   ```bash
   " Budi@Email.COM " → "budi@email.com"
   ```
3. Must be unique; no two accounts can have the same email.
4. Validation is performed on both frontend (UX) and backend (security).

## 4.2 Password

1. Minimal 8 characters.
2. Must contain at least one letter and one number.
3. Cannot be the same as the email.
4. Stored in hashed form using bcrypt or Argon2 (never plaintext).
5. Never sent back to the client in any form.

## 4.3 Full Name

1. Minimal 2 characters.
2. Trimmed with spaces at the beginning and end.
3. Cannot consist only of spaces or special characters.

---

# 5. Account Status

| Status | Code | Description |
|---|---|---|
| Not Verified | `unverified` | New registration, email not confirmed |
| Active | `active` | Email confirmed, can log in |
| Suspended | `suspended` | Disabled by Super Admin |

Status transitions:

```
[unverified] → (click verification link) → [active]
[active]     → (disabled by admin)    → [suspended]
[suspended]  → (restored by admin)       → [active]
```

---

# 6. Email Verification

## 6.1 Mechanism

- The system generates a unique **verification token** during registration.
- The token is sent via email as part of the verification link:
  ```bash
  https://hub.domain.com/verify-email?token=VERIFICATION_TOKEN
  ```
- The token is **one-time use**: cannot be used more than once.
- The token has a **24-hour** validity period.

## 6.2 When the Member Clicks the Link

- The system validates the token: exists, not used, not expired.
- If valid: the account is updated to `active`, the token is marked as used.
- If expired: display a page to re-send the email.
- If already used: display a message "Account already active, please log in."

## 6.3 Re-Sending the Verification Email

- The member can request a re-send while the account is still `unverified`.
- The system generates a new token and sends a new email.
- The old token automatically expires after the new token is created.
- Limited to a maximum of: e.g., 3 re-sends per hour (rate limiting).

---

# 7. Forgot Password

## 7.1 Flow

1. The member opens the **Forgot Password** page.
2. The member enters their email.
3. The system searches for the account with the entered email (normalized).
4. If the account is found: send an email with a password reset link.
5. If the account is not found: display a generic message (does not confirm existence or non-existence of the email).
6. The member clicks the link in the email.
7. The member enters a new password.
8. The system validates the new password.
9. The system stores the hashed new password.
10. All active sessions are terminated.
11. The member is redirected to the login page.

## 7.2 Password Reset Token Rules

- The password reset token is **one-time use**.
- Validity period: **1 hour**.
- A new token cancels out any unused old tokens.

---

# 8. Changing Password (from Profile)

## 8.1 Flow

1. The member opens the **Account Settings** page.
2. The member enters:
   - current password,
   - new password,
   - confirm new password.
3. The system validates the current password.
4. The system validates the new password (same rules as registration).
5. The system stores the hashed new password.
6. All active sessions on other devices are terminated (except the current session).
7. The system sends an email notification for the password change.

---

# 9. Changing Email

## 9.1 Flow

1. The member opens the **Account Settings** page.
2. The member enters the new email.
3. The system validates:
   - the new email format,
   - the new email is different from the current email,
   - the new email is not used by another account.
4. The system sends a verification email to the **new email**.
5. The old email remains active until verification is complete.
6. The member clicks the link in the new email.
7. The system updates the email to the new email.
8. The system sends a notification to the old email.

---

# 10. Profile Management

## 10.1 Profile Information

| Field | Can Be Changed? | Description |
|---|---|---|
| Full Name | Yes | — |
| Email | Yes | Requires re-verification |
| Phone Number | Yes | — |
| Profile Picture | Yes | Upload image, optional |
| Password | Yes | Through a special flow |
| Member ID | No | System-generated, cannot be changed |
| Registration Date | No | Recorded by the system |

## 10.2 Profile Picture

- Accepted formats: JPG, PNG, WebP.
- Maximum size: 2 MB.
- The image is compressed and resized by the system.
- If no picture is available, display the initials of the name as the default avatar.

---

# 11. Account Deletion

> **Note**: The account deletion feature will be further defined in a future version.

Principles to be considered:

- Accounts with active paid licenses cannot be deleted directly.
- Financial transaction data must be stored in accordance with applicable regulations.
- Deletion requires confirmation of the current password.

---

# 12. Data Stored During Registration

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
| Successful registration | Verification email link |
| Account activated | Welcome message + link to dashboard |
| Forgot password | Password reset link |
| Password changed | Notification of password change |
| Request to change email | Verification email link for new email |
| Email changed | Notification to old email |

---

# 14. Account Security

1. Passwords are stored as hashes (bcrypt/Argon2), never plaintext.
2. Verification and reset tokens are **one-time use**.
3. Rate limiting is applied to:
   - registration endpoint,
   - login endpoint,
   - forgot password endpoint,
   - re-send verification endpoint.
4. Changing the password terminates all active sessions.
5. Email notifications for sensitive changes (password, email) are always sent to the previous email.

---

# 15. Acceptance Criteria

- Members can register with a valid email and password.
- Registered emails cannot be used again.
- A verification email is sent after registration.
- Unverified accounts cannot log in to the SaaS application.
- Expired verification links display an option to re-send.
- The forgot password feature does not confirm whether the email exists or not.
- Password reset tokens expire after 1 hour and are one-time use.
- Changing the password terminates other sessions.
- Changing the email requires verification of the new email.
- Passwords are never displayed or stored in plain text.