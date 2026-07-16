# Access and Permissions — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the access rights of each role to modules, data, and actions within the Central Membership & SSO Hub system. This document serves as the basis for the implementation of:

- authorization,
- middleware backend,
- API permission,
- route protection,
- and access testing.

## 2. Roles Used

- **Member**: End-user account owner.
- **System**: Automatic backend process (webhook, scheduler, notification).
- **Super Admin**: Internal team managing the platform.

## 3. Permission Principles

1. All access is denied by default.
2. Access is granted only if explicitly defined.
3. Members can only access their own data.
4. The System can only process data in the context of a valid process.
5. Super Admins cannot see member passwords.
6. The frontend should not be the only security layer.
7. The backend must validate roles and data ownership on every request.

## 4. Access Type Definitions

| Code | Meaning |
|---|---|
| `View` | View data |
| `Create` | Create new data |
| `Update` | Update data |
| `Delete` | Delete or cancel data |
| `Process` | Run automatic process |
| `Manage` | Manage everything (full CRUD) |
| `None` | No access |

---

# 5. Main Access Matrix

| Module / Activity | Member | System | Super Admin |
|---|---|---|---|
| **Account & Authentication** | | | |
| Register account | `Create` | `Process` | `None` |
| Verify email | `Process` | `Process` | `None` |
| Login to Hub | `Process` | `None` | `Process` |
| Logout | `Process` | `None` | `Process` |
| Forgot & reset password | `Process` | `Process` | `None` |
| View own profile | `View` | `None` | `None` |
| Update own profile | `Update` | `None` | `None` |
| View other member's profile | `None` | `None` | `View` (limited) |
| Disable own account | `Update` | `None` | `None` |
| Disable member account | `None` | `None` | `Update` |
| **Products & Packages** | | | |
| View product catalog | `View` | `None` | `View` |
| View product package list | `View` | `None` | `View` |
| Manage products (add/edit) | `None` | `None` | `Manage` |
| Manage packages (add/edit/price) | `None` | `None` | `Manage` |
| Disable package | `None` | `None` | `Update` |
| **Licenses** | | | |
| Activate free package | `Create` | `None` | `None` |
| View own license | `View` | `Process` | `None` |
| View License-ID own | `View` | `Process` | `None` |
| Activate license (after payment) | `None` | `Process` | `None` |
| Suspend license (suspend) | `None` | `Process` | `Update` |
| Restore license (after payment) | `None` | `Process` | `Update` |
| Cancel license | `None` | `None` | `Update` |
| View all member licenses | `None` | `None` | `View` |
| **Checkout & Payment** | | | |
| Create checkout order | `Create` | `None` | `None` |
| Select payment gateway | `Update` | `None` | `None` |
| Receive payment webhook | `None` | `Process` | `None` |
| Verify payment webhook | `None` | `Process` | `None` |
| View own payment history | `View` | `None` | `None` |
| Download own invoice | `View` | `None` | `None` |
| View all transactions | `None` | `None` | `View` |
| Process manual refund | `None` | `None` | `Update` |
| **SSO & Token** | | | |
| Login via SSO (request auth code) | `Process` | `None` | `None` |
| Exchange auth code with token | `None` | `Process` | `None` |
| Issue JWT | `None` | `Process` | `None` |
| Refresh access token | `Process` | `Process` | `None` |
| Logout SSO | `Process` | `None` | `None` |
| Revoke refresh token | `None` | `Process` | `Update` |
| **Notifications & Email** | | | |
| Set notification preferences | `Update` | `None` | `None` |
| Send automatic email | `None` | `Process` | `None` |
| View email delivery log | `None` | `None` | `View` |
| **Super Admin Panel** | | | |
| Access admin panel | `None` | `None` | `View` |
| View aggregate statistics | `None` | `Process` | `View` |
| View member list | `None` | `None` | `View` |
| View member account details | `None` | `None` | `View` (limited) |
| View error log | `None` | `Process` | `View` |
| View audit log | `None` | `None` | `View` |
| Manage system configuration | `None` | `None` | `Manage` |
| Register new OAuth2 client | `None` | `None` | `Manage` |

---

# 6. Permission by Module

## 6.1 Authentication & Profile

### Member
- Can register, login, logout, and reset password.
- Can view and update own profile.
- Cannot view or update other member's data.

### System
- Can validate credentials during login.
- Can send email verification and reset password.
- Can create and end sessions.

### Super Admin
- Can view administrative data of members (name, email, account status, registration date).
- Cannot view member passwords in any form.
- Can enable or disable member accounts.

---

## 6.2 Products & Packages

### Member
- Can view product catalog and available package list.
- Cannot update products or packages.

### System
- Has no direct access to product management.

### Super Admin
- Can add new products to the ecosystem.
- Can manage package per product (name, price, duration, features).
- Can disable packages that are no longer offered.

---

## 6.3 Licenses

### Member
- Can activate free package directly.
- Can view all licenses belonging to them.
- Can view License-ID and license status.
- Cannot activate, suspend, or cancel licenses directly (except through valid processes).

### System
- Activates licenses after successful payment webhook confirmation.
- Automatically updates license status (active → grace_period → suspended).
- Cannot activate licenses without valid payment confirmation.

### Super Admin
- Can view all licenses of all members.
- Can suspend or restore licenses manually in certain conditions.
- Every manual action is recorded in the audit log.

---

## 6.4 Checkout & Payment

### Member
- Can initiate checkout and select payment gateway.
- Can view payment history and download own invoice.
- Cannot update or delete transaction history.

### System
- Receives and verifies payment webhooks from the payment gateway.
- Activates licenses after successful confirmation.
- Records every transaction.

### Super Admin
- Can view all platform transactions.
- Can process manual refunds if necessary.

---

## 6.5 SSO & Token

### Member
- Can initiate SSO login flow to SaaS applications.
- Can refresh tokens.
- Cannot issue JWT directly.

### System
- Issues JWT after successful validation.
- Verifies refresh tokens.
- Revokes tokens if licenses are not active.

### Super Admin
- Can revoke refresh tokens if necessary (e.g., security cases).

---

# 7. Data Ownership Rules

Every request to member personal data must validate:

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

The backend must:

- Check if the member is logged in,
- Check the role,
- Check data ownership,
- Check account status (`active`),
- and deny access if any condition is not met.

## 7.2 Access Denied Response

| Condition | HTTP Status |
|---|---|
| Not logged in | `401 Unauthorized` |
| No permission | `403 Forbidden` |
| Data should not exist | `404 Not Found` |

---

# 8. Permission on Interface (Frontend)

The frontend must:

- Hide menus that are not available for the active role,
- Disable buttons that should not be used,
- Not load unnecessary data,
- And display clear access messages if denied.

However, frontend hiding is **not the primary security measure**. The backend must still validate every request.

---

# 9. Acceptance Criteria for Permission

Permission implementation is considered complete if:

- Members cannot view other member's data,
- Members can only update their own data,
- Licenses are only active after valid webhook confirmation,
- The System cannot activate licenses without a valid source,
- Super Admins cannot view member passwords,
- All endpoints have access validation,
- Access is denied with the correct HTTP response,
- And important administrative