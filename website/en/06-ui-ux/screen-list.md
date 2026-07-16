# Screen List — Central Membership & SSO Hub

## 1. Document Purpose

This document lists all pages (screens) within the Membership Hub application, including descriptions, main components, and conditions to consider during design and implementation.

---

# 2. Public Area (Without Login)

## SCR-PUB-01: Landing Page

**Route**: `/`

**Description**: The first page seen by prospective users. Displays product value and a CTA to register.

**Components**:
- Hero section: tagline "One Account, All Applications", brief description, CTA buttons "Start Free" and "Learn More"
- Section for available products
- Advantages section: SSO, multi-product, security
- Footer with important links

**Conditions**: If the user is already logged in, redirect to the dashboard.

---

## SCR-PUB-02: Registration Page

**Route**: `/register`

**Description**: Form for new account registration.

**Components**:
- Hub Logo
- Title: "Create Account"
- Input: Full Name, Email, Password, Confirm Password
- Password strength indicator
- Button: "Register" (primary, full-width)
- Link: "Already have an account? Log in"
- Error message per field (inline)

**Conditions**:
- Email already registered → inline error
- Realtime validation as member types
- Loading state on submit

---

## SCR-PUB-03: Login Page

**Route**: `/login`

**Description**: Form to log into an existing account.

**Components**:
- Hub Logo
- Title: "Log In"
- Input: Email, Password
- Button: "Log In" (primary)
- Link: "Forgot password?"
- Divider "or"
- Button: "Register Account" (secondary outline)

**Conditions**:
- Account not yet verified → banner + resend email button
- Account suspended → message to contact support
- Rate limit → message to wait a few minutes

---

## SCR-PUB-04: Email Verification

**Route**: `/verify-email`

**Description**: Confirmation page after registration, asking users to check email.

**Components**:
- Envelope illustration
- Title: "Check Your Email"
- Text: "We have sent a verification link to [email]"
- Button: "Resend Email"
- Link: "Change email?"
- Resend countdown timer (e.g., 60 seconds)

**State**: Loading on resend, success state, error state

---

## SCR-PUB-05: Email Verification Confirmation

**Route**: `/verify-email/confirm?token=...`

**Description**: Page that opens when a member clicks the link in the email.

**State**:
- **Success**: Checkmark animation, "Account successfully verified!", CTA "Start Now"
- **Expired**: "Link has expired", "Resend" button
- **Already used**: "Account is already active", "Login" button

---

## SCR-PUB-06: Forgot Password

**Route**: `/forgot-password`

**Components**:
- Email input
- Button "Send Reset Link"
- After submit: illustration + "Check your email for the reset link"

**Conditions**: Message is always generic (does not confirm existence of email)

---

## SCR-PUB-07: Reset Password

**Route**: `/reset-password?token=...`

**Components**:
- Input: New Password, Confirm New Password
- Password strength indicator
- Button "Save New Password"

**State**:
- Token valid: display form
- Token expired: "Link invalid or expired", CTA "Request New Link"
- Success: "Password successfully updated", CTA "Log In Now"

---

# 3. Member Area (With Login)

## SCR-MEM-01: Main Dashboard

**Route**: `/dashboard`

**Description**: Main page after login. Displays all active subscriptions.

**Components**:
- Header: Greeting ("Hello, [Name]!"), avatar
- Subtitle: "Manage all your subscriptions"
- List of product cards (Product Card) per subscription
- Button: "+ Add Product" (if not all products are owned)
- Grace Period Banner (if there is a `grace_period` license)
- Bottom Navigation

**Empty State**: Illustration + "No active products yet" + CTA "Explore Products"

---

## SCR-MEM-02: Product Catalog

**Route**: `/products`

**Description**: List of all SaaS products available in the ecosystem.

**Components**:
- Product card grid/list:
  - Logo, name, brief description
  - Available plan labels (Free, Pro, etc.)
  - Member status for this product (Not Active / Active)
  - CTA "View Plans" or "Already Active"

---

## SCR-MEM-03: Product Detail & Choose Plan

**Route**: `/products/[product-code]`

**Description**: Product detail page with plan comparison.

**Components**:
- Product hero: logo, name, description
- Monthly / Annual Toggle (for paid products)
- Plan card: name, price, feature list, CTA "Choose Plan"
- Active products already owned by the member are specially marked

---

## SCR-MEM-04: Checkout

**Route**: `/checkout/[order-id]`

**Description**: Order confirmation page before payment.

**Components**:
- Progress: "Choose Plan → Payment → Confirmation"
- Order summary: product, plan, price, duration
- Payment gateway options: Midtrans / Xendit card (radio button with logo)
- Button "Proceed to Payment"

---

## SCR-MEM-05: Waiting for Payment

**Route**: `/checkout/[order-id]/waiting`

**Description**: Page after being redirected to the payment gateway, awaiting confirmation.

**Components**:
- Loading animation / spinner
- Text: "Waiting for payment confirmation..."
- Brief instructions according to payment method
- Link: "Back to Dashboard"

---

## SCR-MEM-06: Payment Successful / License Active

**Route**: `/checkout/[order-id]/success`

**Description**: Confirmation page after successful payment.

**Components**:
- Animation: green circle + checkmark
- Title: "License Active!"
- Subtitle: "Congratulations! [Product Name] is ready to use"
- License-ID card (monospace + copy button)
- Note: "We have also sent a confirmation email"
- CTA: "Open [Product Name] Now →" (primary)
- Link: "Back to Dashboard"

---

## SCR-MEM-07: Payment Failed

**Route**: `/checkout/[order-id]/failed`

**Components**:
- Red X icon
- Title: "Payment Unsuccessful"
- Brief explanation of the reason
- CTA: "Try Again" (primary)
- Link: "Back to Dashboard"

---

## SCR-MEM-08: License Detail

**Route**: `/licenses/[license-id]`

**Description**: Detail page for a single product license.

**Components**:
- Product name + logo
- Status badge
- License-ID (monospace, copy button)
- Active plan (tier)
- Activation date
- Active period / expiration date
- Action buttons: "Open Application", "Renew" (if paid), "Upgrade"
- Grace Period Banner (if status is `grace_period`)

---

## SCR-MEM-09: Payment History

**Route**: `/billing/history`

**Description**: List of all member payment transactions.

**Components**:
- Transaction list/table: date, product, plan, amount, status
- Filter: all / successful / failed
- Button "Download Invoice" per transaction
- Pagination

**Empty State**: "No transaction history yet"

---

## SCR-MEM-10: Account Profile

**Route**: `/profile`

**Description**: Member profile management page.

**Tabs**:
- **Profile**: Name, email, phone number, photo, save button
- **Security**: Change password, active session history
- **Preferences**: Theme toggle (Dark/Light), notification preferences

---

## SCR-MEM-11: Change Password

**Route**: `/profile/change-password`

**Components**:
- Input: Current Password, New Password, Confirm
- Password strength indicator
- Button "Save"

---

## SCR-MEM-12: Grace Period Warning

**Route**: Overlay/banner on all pages

**Description**: Urgent banner displayed when a license is in `grace_period` status.

**Components**:
- Background: yellow/amber
- Warning icon
- Text: "Your [Product] subscription will expire in [X days]"
- CTA: "Renew Now"
- Close button (X) — banner reappears tomorrow

---

# 4. Super Admin Area

## SCR-ADM-01: Admin Login

**Route**: `/admin/login`

**Components**: Admin login form (separate from member login)

---

## SCR-ADM-02: Admin Dashboard

**Route**: `/admin`

**Components**:
- Statistics: total members, total active licenses, revenue this month
- Graphs: registrations per day, transactions per week
- Alerts: licenses expiring in 7 days

---

## SCR-ADM-03: Member Management

**Route**: `/admin/members`

**Components**: Member table, filters, search, actions (view details, suspend, activate)

---

## SCR-ADM-04: Member Detail (Admin)

**Route**: `/admin/members/[member-id]`

**Components**: Profile, license list, transaction history, activity logs, admin action buttons

---

## SCR-ADM-05: Product Management

**Route**: `/admin/products`

**Components**: Product list, add product, edit, deactivate

---

## SCR-ADM-06: Plan Management

**Route**: `/admin/products/[product-code]/plans`

**Components**: Plan list per product, add plan, edit price & features, deactivate

---

## SCR-ADM-07: Transaction Reports

**Route**: `/admin/billing`

**Components**: Transaction table, filter by date/product/status, export CSV

---

## SCR-ADM-08: OAuth2 Client Configuration

**Route**: `/admin/oauth-clients`

**Components**: List of registered SaaS applications, add client, regenerate secret

---

# 5. System Pages

## SCR-SYS-01: 404 Not Found

Illustration icon + message + CTA back to dashboard.

## SCR-SYS-02: 403 Forbidden

Access denied message + context-appropriate CTA.

## SCR-SYS-03: 500 Server Error

Generic message "There is a problem" + try again button.

## SCR-SYS-04: Maintenance Mode

Illustration + text "Under maintenance" + estimated time (if available).

---

# 6. Screen Count Summary

| Area | Number of Screens |
|---|---|
| Public (without login) | 7 |
| Member (with login) | 12 |
| Super Admin | 8 |
| System | 4 |
| **Total** | **31** |
