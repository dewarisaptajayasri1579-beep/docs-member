# Exception Flow — Central Membership & SSO Hub

## 1. Document Purpose

This document describes all exception conditions that can occur within the system, how the system responds, and actions to be taken by users or the system.

## 2. Exception Categories

1.  Account Registration & Verification
2.  Login & Authentication
3.  License Activation
4.  Checkout & Payment
5.  Payment Gateway Webhook
6.  SSO & Token
7.  Grace Period & Suspend
8.  System & Infrastructure

---

# 3. Exception: Account Registration & Verification

## EX-REG-01: Email Already Registered

| Attribute | Detail |
|---|---|
| Condition | Member attempts to register with an email that already exists in the system |
| System | Rejects registration |
| HTTP Response | `422 Unprocessable Entity` |
| Message to User | "This email is already registered. Please log in or use another email." |
| User Action | Log in using the same email, or use the forgot password feature |
| Note | Message should not confirm if email is registered for privacy reasons; however, for membership UX, it can be informative |

## EX-REG-02: Invalid Email Format

| Attribute | Detail |
|---|---|
| Condition | Entered email does not match format |
| System | Rejects at validation level (frontend and backend) |
| HTTP Response | `422 Unprocessable Entity` |
| Message to User | "Invalid email format." |
| User Action | Correct email format |

## EX-REG-03: Password Does Not Meet Requirements

| Attribute | Detail |
|---|---|
| Condition | Password too short, does not contain numbers/capital letters, etc. |
| System | Rejects at validation level |
| HTTP Response | `422 Unprocessable Entity` |
| Message to User | "Password must be at least 8 characters and contain letters and numbers." |
| User Action | Create a password that meets the requirements |

## EX-REG-04: Email Verification Link Expired

| Attribute | Detail |
|---|---|
| Condition | Member clicks verification link after exceeding time limit (e.g., 24 hours) |
| System | Rejects verification, link is no longer valid |
| HTTP Response | `410 Gone` |
| Message to User | "Verification link has expired. Click the button below to resend." |
| User Action | Request resend of verification email |
| System Action | Send new verification email with a new link |

## EX-REG-05: Verification Link Already Used

| Attribute | Detail |
|---|---|
| Condition | Member clicks a verification link that has already been used |
| System | Checks if account is already active |
| Message to User | "Your account is already verified. Please log in." |
| User Action | Log in |

---

# 4. Exception: Login & Authentication

## EX-LOGIN-01: Incorrect Credentials

| Attribute | Detail |
|---|---|
| Condition | Incorrect email or password entered |
| System | Rejects login |
| HTTP Response | `401 Unauthorized` |
| Message to User | "Incorrect email or password." |
| User Action | Try again or use the forgot password feature |
| Note | Should not differentiate between non-existent email or incorrect password (security) |

## EX-LOGIN-02: Account Not Yet Verified

| Attribute | Detail |
|---|---|
| Condition | Member logs in with an account that has not verified email |
| System | Rejects login, offers to resend email |
| HTTP Response | `403 Forbidden` |
| Message to User | "Account not yet verified. Check your email or click the button to resend." |
| User Action | Check email and click verification link |

## EX-LOGIN-03: Account Suspended

| Attribute | Detail |
|---|---|
| Condition | Member account deactivated by Super Admin |
| System | Rejects login |
| HTTP Response | `403 Forbidden` |
| Message to User | "Your account has been suspended. Contact support for more information." |
| User Action | Contact support |

## EX-LOGIN-04: Too Many Failed Login Attempts

| Attribute | Detail |
|---|---|
| Condition | Member exceeds the limit of failed login attempts (e.g., 5x in 10 minutes) |
| System | Temporarily locks the login endpoint for that IP / account |
| HTTP Response | `429 Too Many Requests` |
| Message to User | "Too many failed attempts. Try again in 10 minutes." |
| User Action | Wait and try again |

---

# 5. Exception: License Activation

## EX-LIC-01: Account Not Yet Verified During Activation

| Attribute | Detail |
|---|---|
| Condition | Member attempts to activate a package but the account is not yet verified |
| System | Rejects activation |
| HTTP Response | `403 Forbidden` |
| Message to User | "Verify your email first before activating the product." |
| User Action | Verify email |

## EX-LIC-02: Already Has an Active License for the Same Product

| Attribute | Detail |
|---|---|
| Condition | Member attempts to activate a free package, but already has an active license for that product |
| System | Rejects duplication, redirects to existing license details |
| HTTP Response | `409 Conflict` |
| Message to User | "You already have an active license for this product." |
| User Action | View active license in dashboard or choose to upgrade |

## EX-LIC-03: Product Not Available

| Attribute | Detail |
|---|---|
| Condition | Member attempts to activate a product that has been deleted/deactivated |
| System | Rejects activation |
| HTTP Response | `404 Not Found` |
| Message to User | "Product is not available at this time." |
| User Action | Choose another product |

---

# 6. Exception: Checkout & Payment

## EX-PAY-01: Order Expired Before Payment

| Attribute | Detail |
|---|---|
| Condition | Member does not complete payment within the order time limit |
| System | Order marked `expired`, license not activated |
| Message to User | "Your payment session has expired. Please restart the purchase process." |
| User Action | Return to catalog and create a new order |

## EX-PAY-02: Payment Rejected by Payment Gateway

| Attribute | Detail |
|---|---|
| Condition | Payment rejected (insufficient balance, card declined, etc.) |
| System | Order marked `failed`, license not activated |
| Message to User | "Payment unsuccessful. Try another method or contact your bank." |
| User Action | Retry with a different payment method |

## EX-PAY-03: Payment Amount Mismatch

| Attribute | Detail |
|---|---|
| Condition | Webhook received but the amount paid does not match the order price |
| System | Reject activation, log in audit log, notify Super Admin |
| System Action | Does not activate license, saves proof to log |
| Super Admin Action | Manual verification and take action according to policy |

## EX-PAY-04: Double Checkout (Duplicate Order)

| Attribute | Detail |
|---|---|
| Condition | Member creates more than one order for the same product in close succession |
| System | Only processes one order; duplicate orders are marked as `duplicate` |
| Message to User | "You already have an active order for this product. Complete the ongoing payment." |
| User Action | Complete the existing order |

---

# 7. Exception: Payment Gateway Webhook

## EX-WH-01: Webhook Cannot Be Verified

| Attribute | Detail |
|---|---|
| Condition | Webhook signature does not match or is invalid |
| System | Ignore webhook, log in error log |
| HTTP Response to Gateway | `400 Bad Request` |
| License | Not activated |
| Action | Super Admin checks logs and performs manual verification if necessary |

## EX-WH-02: Webhook Received More Than Once (Retry)

| Attribute | Detail |
|---|---|
| Condition | Payment gateway resends the same webhook because it did not receive a success response |
| System | Checks if `order_id` has already been processed → ignores (idempotency) |
| HTTP Response to Gateway | `200 OK` (to stop gateway from retrying) |
| License | Not activated twice |

## EX-WH-03: Webhook Received but Server is Down

| Attribute | Detail |
|---|---|
| Condition | Hub server is unavailable when payment gateway sends webhook |
| System | Payment gateway will automatically retry several times |
| Action | Ensure webhook endpoint can respond shortly after server recovers |
| Fallback | Super Admin performs manual activation based on payment logs in the payment gateway dashboard |

---

# 8. Exception: SSO & Token

## EX-SSO-01: Does Not Have License for Requested Product

| Attribute | Detail |
|---|---|
| Condition | Member attempts to log in to a SaaS application but does not have an active license for that product |
| System | Rejects token issuance, redirects to package selection page |
| Response | `403 no_license` |
| Message to User | "You have not subscribed to this product. Choose a package to start using it." |

## EX-SSO-02: License Suspended

| Attribute | Detail |
|---|---|
| Condition | Member attempts to log in to the application with a `suspended` license |
| System | Rejects token issuance, redirects to renewal page |
| Response | `403 license_suspended` |
| Message to User | "Your access to this product has been blocked. Renew your subscription to continue." |

## EX-SSO-03: Access Token Expired

| Attribute | Detail |
|---|---|
| Condition | SaaS application receives a request with an expired Access Token |
| System | Rejects request |
| HTTP Response | `401 Unauthorized` |
| Application Action | Use Refresh Token to obtain a new Access Token |

## EX-SSO-04: Refresh Token Invalid or Expired

| Attribute | Detail |
|---|---|
| Condition | Refresh Token is expired or revoked |
| System | Rejects issuance of new Access Token |
| Response | `401 invalid_refresh_token` |
| Application Action | Redirects member to Hub login page |

## EX-SSO-05: State Parameter Mismatch (CSRF)

| Attribute | Detail |
|---|---|
| Condition | The `state` value returned by the Hub does not match what the application stored |
| System | SaaS application rejects SSO process |
| Application Action | Display error message, ask member to restart login process |
| Note | This is a protection against CSRF attacks |

## EX-SSO-06: Invalid JWT Signature

| Attribute | Detail |
|---|---|
| Condition | SaaS application receives a JWT whose signature cannot be verified using the Hub's public key |
| System | Application rejects JWT |
| Application Action | Deny access, redirect to login |
| Note | Likely occurs if the token is forged or the public key has not been updated |

---

# 9. Exception: Grace Period & Suspend

## EX-GP-01: Grace Period Notification Failed to Send

| Attribute | Detail |
|---|---|
| Condition | Grace Period reminder email failed to send due to email service error |
| System | Logs failure, attempts to resend according to retry policy |
| Action | In-app notification is still displayed on the dashboard |
| Note | Email failure does not stop the Grace Period process |

## EX-GP-02: Member Pays After Suspend

| Attribute | Detail |
|---|---|
| Condition | License is already `suspended` and member just paid |
| System | Reactivates license after payment confirmation |
| New `expired_at` | Calculated from payment date + package duration |
| Message to User | "Your access has been restored. Thank you for renewing." |

---

# 10. Exception: System & Infrastructure

## EX-SYS-01: Database Unavailable

| Attribute | Detail |
|---|---|
| Condition | Database cannot be reached by the server |
| System | Returns a generic error to the user |
| HTTP Response | `503 Service Unavailable` |
| Message to User | "Service is currently unavailable. Please try again in a moment." |
| Action | Technical team is notified via monitoring alert |

## EX-SYS-02: Email Service Unavailable

| Attribute | Detail |
|---|---|
| Condition | Email sending service cannot be reached |
| System | Main operations continue, emails go into retry queue |
| Action | System attempts to resend email after service recovers |
| Note | Email failure should not block license activation or login processes |

## EX-SYS-03: Payment Gateway Unavailable

| Attribute | Detail |
|---|---|
| Condition | Payment gateway endpoint cannot be reached when creating a payment session |
| System | Displays an error message to the member |
| HTTP Response | `503 Service Unavailable` |
| Message to User | "Payment service is currently unavailable. Try again in a moment or choose another method." |
| User Action | Try again or choose a different payment gateway |

---

# 11. Error Code Summary

| Exception Code | Area | Brief Condition |
|---|---|---|
| EX-REG-01 | Registration | Email already registered |
| EX-REG-02 | Registration | Invalid email format |
| EX-REG-03 | Registration | Password does not meet requirements |
| EX-REG-04 | Registration | Verification link expired |
| EX-REG-05 | Registration | Verification link already used |
| EX-LOGIN-01 | Login | Incorrect credentials |
| EX-LOGIN-02 | Login | Account not yet verified |
| EX-LOGIN-03 | Login | Account suspended |
| EX-LOGIN-04 | Login | Login rate limit |
| EX-LIC-01 | License | Account not yet verified |
| EX-LIC-02 | License | Active license already exists |
| EX-LIC-03 | License | Product not available |
| EX-PAY-01 | Payment | Order expired |
| EX-PAY-02 | Payment | Payment rejected |
| EX-PAY-03 | Payment | Amount mismatch |
| EX-PAY-04 | Payment | Duplicate order |
| EX-WH-01 | Webhook | Signature verification failed |
| EX-WH-02 | Webhook | Duplicate webhook (retry) |
| EX-WH-03 | Webhook | Server down when webhook arrives |
| EX-SSO-01 | SSO | Does not have product license |
| EX-SSO-02 | SSO | License suspended |
| EX-SSO-03 | SSO | Access token expired |
| EX-SSO-04 | SSO | Refresh token invalid |
| EX-SSO-05 | SSO | State parameter mismatch |
| EX-SSO-06 | SSO | Invalid JWT signature |
| EX-GP-01 | Grace Period | Notification email failed |
| EX-GP-02 | Grace Period | Paid after suspend |
| EX-SYS-01 | System | Database unavailable |
| EX-SYS-02 | System | Email service unavailable |
| EX-SYS-03 | System | Payment gateway unavailable |

---

# 12. Exception Handling Principles

1.  Every exception must have an **informative** message for the user, not raw technical messages.
2.  Internal error codes are logged, not displayed to the user.
3.  Email or notification failures **must not halt** core processes (license, login).
4.  Payment processes must be **atomic**: licenses are not partially activated.
5.  All exceptions are recorded in the **audit log** with sufficient context for debugging.
6.  Critical endpoints must return appropriate HTTP responses according to the condition.
7.  The system must **fail gracefully**: infrastructure errors do not display stack traces to users.