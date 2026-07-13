# Access and Permissions — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the access rights of each role to modules, data, and actions within the Central Membership & SSO Hub system.

This document serves as the basis for the implementation of:

- authorization,
- middleware backend,
- API permission,
- route protection,
- and access testing.

## 2. Roles Used

- **Member**: End-user account owner.
- **System**: Automated backend processes (webhook, scheduler, notifications).
- **Super Admin**: Internal team managing the platform.

## 3. Permission Principles

1. All access is denied by default.
2. Access is granted only if explicitly defined.
3. Members can only access their own data.
4. System can only process data within the context of legitimate processes.
5. Super Admins cannot view member passwords.
6. Frontend must not be the sole layer of security.
7. Backend must validate role and data ownership on every request.

## 4. Definition of Access Types

| Kode | Meaning |
|---|---|
| `View` | View data |
| `Create` | Create new data |
| `Update` | Modify data |
| `Delete` | Delete or cancel data |
| `Process` | Run automated process |
| `Manage` | Manage overall (full CRUD) |
| `None` | No access |

---

# 5. Main Access Matrix

| Module / Activity | Member | System | Super Admin |
|---|---|---|---|
| **Account & Authentication** | | | |
| Account registration | `Create` | `Process` | `None` |
| Email verification | `Process` | `Process` | `None` |
| Login to Hub | `Process` | `None` | `Process` |
| Logout | `Process` | `None` | `Process` |
| Forgot & reset password | `Process` | `Process` | `None` |
| View own profile | `View` | `None` | `None` |
| Edit own profile | `Update` | `None` | `None` |
| View other member profiles | `None` | `None` | `View` (limited) |
| Deactivate own account | `Update` | `None` | `None` |
| Deactivate member account | `None` | `None` | `Update` |
| **Products & Packages** | | | |
| View product catalog | `View` | `None` | `View` |
| View product package list | `View` | `None` | `View` |
| Manage products (add/edit) | `None` | `None` | `Manage` |
| Manage packages (add/edit/price) | `None` | `None` | `Manage` |
| Deactivate package | `None` | `None` | `Update` |
| **Licenses** | | | |
| Activate free package | `Create` | `None` | `None` |
| View own licenses | `View` | `Process` | `None` |
| View own License-ID | `View` | `Process` | `None` |
| Activate license (after payment) | `None` | `Process` | `None` |
| Suspend license (suspend) | `None` | `Process` | `Update` |
| Restore license (after payment) | `None` | `Process` | `Update` |
| Cancel license | `None` | `None` | `Update` |
| View all member licenses | `None` | `None` | `View` |
| **Checkout & Payments** | | | |
| Create checkout order | `Create` | `None` | `None` |
| Select payment gateway | `Update` | `None` | `None` |
| Receive payment webhook | `None` | `Process` | `None` |
| Verify webhook | `None` | `Process` | `None` |
| View own payment history | `View` | `None` | `None` |
| Download own invoice | `View` | `None` | `None` |
| View all transactions | `None` | `None` | `View` |
| Process manual refund | `None` | `None` | `Update` |
| **SSO & Tokens** | | | |
| Login via SSO (request auth code) | `Process` | `None` | `None` |
| Exchange auth code for token | `None` | `Process` | `None` |
| Issue JWT | `None` | `Process` | `None` |
| Refresh access token | `Process` | `Process` | `None` |
| Logout SSO | `Process` | `None` | `None` |
| Revoke refresh token | `None` | `Process` | `Update` |
| **Notifications & Email** | | | |
| Manage notification preferences | `Update` | `None` | `None` |
| Send automated email | `None` | `Process` | `None` |
| View email delivery logs | `None` | `None` | `View` |
| **Super Admin Panel** | | | |
| Access admin panel | `None` | `None` | `View` |
| View aggregate statistics | `None` | `Process` | `View` |
| View member list | `None` | `None` | `View` |
| View member account details | `None` | `None` | `View` (limited) |
| View error logs | `None` | `Process` | `View` |
| View audit logs | `None` | `None` | `View` |
| Manage system configuration | `None` | `None` | `Manage` |
| Register new OAuth2 client | `None` | `None` | `Manage` |

---

# 6. Permissions by Module

## 6.1 Authentication & Profile

### Member
- Can register, log in, log out, and reset password.
- Can view and edit own profile.
- Cannot view or edit other member data.

### System
- Can validate credentials during login.
- Can send verification and password reset emails.
- Can create and terminate sessions.

### Super Admin
- Can view administrative member data (name, email, account status, registration date).
- Cannot view member passwords in any form.
- Can activate or deactivate member accounts.

---

## 6.2 Products & Packages

### Member
- Can view product catalog and available package list.
- Cannot modify products or packages.

### System
- Does not have direct access to product management.

### Super Admin
- Can add new products to the ecosystem.
- Can manage packages per product (name, price, duration, features).
- Can deactivate packages that are no longer offered.

---

## 6.3 Licenses

### Member
- Can activate free packages directly.
- Can view all their licenses.
- Can view License-ID and license status.
- Cannot activate, suspend, or cancel licenses directly (except through legitimate processes).

### System
- Activates licenses after successful payment webhook confirmation.
- Automatically updates license status (`active` → `grace_period` → `suspended`).
- Cannot activate licenses without valid payment confirmation.

### Super Admin
- Can view all licenses of all members.
- Can manually suspend or restore licenses under certain conditions.
- Every manual action is recorded in the audit log.

---

## 6.4 Checkout & Payments

### Member
- Can initiate checkout and select a payment gateway.
- Can view payment history and download their own invoices.
- Cannot modify or delete transaction history.

### System
- Receives and verifies webhooks from the payment gateway.
- Activates licenses after successful confirmation.
- Records every transaction.

### Super Admin
- Can view all platform transactions.
- Can process manual refunds if necessary.

---

## 6.5 SSO & Tokens

### Member
- Can initiate the SSO login flow to SaaS applications.
- Can refresh tokens.
- Cannot issue JWT directly.

### System
- Issues JWT after successful validation.
- Verifies refresh tokens.
- Revokes tokens if the license is inactive.

### Super Admin
- Can revoke member refresh tokens if necessary (e.g., security incidents).

---

# 7. Data Ownership Rules

Every request for member personal data must validate:

```text
resource.member_id == authenticated_member.id
```

Data that must have ownership:

- profile,
- licenses,
- payment transactions,
- invoices,
- notification preferences,
- and refresh tokens.

## 7.1 Backend Validation

Backend must:

- check if the member is logged in,
- check the role,
- check data ownership,
- check account status (`active`),
- and deny access if any of the conditions are not met.

## 7.2 Access Denied Response

| Condition | HTTP Status |
|---|---|
| Not logged in | `401 Unauthorized` |
| No permission | `403 Forbidden` |
| Data existence should not be revealed | `404 Not Found` |

---

# 8. Permissions on the Interface (Frontend)

Frontend must:

- hide menus unavailable for the active role,
- disable buttons that should not be used,
- not load unnecessary data,
- and display clear access messages if denied.

However, frontend hiding is **not the primary security measure**. The backend must still perform validation on every request.

---

# 9. Permission Acceptance Criteria

Permission implementation is considered complete if:

- members cannot view other member data,
- members can only modify their own data,
- licenses are only activated after valid webhook confirmation,
- System cannot activate licenses without a legitimate source,
- Super Admins cannot view member passwords,
- all endpoints have access validation,
- access is denied with the appropriate HTTP response,
- and important administrative actions are recorded in the audit log.