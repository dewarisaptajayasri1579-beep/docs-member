# Goals and Scope — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the product goals, development objectives, and scope of the Central Membership & SSO Hub system.

## 2. Product Goal

Become a centralized identity and licensing system that:

1. **Simplifies** user registration and login experiences across the SaaS ecosystem.
2. **Manages** subscription life cycles (activation, renewal, suspension) automatically.
3. **Secures** access to each application through JWT-based SSO mechanisms.
4. **Supports** ecosystem growth with the ability to add new products without modifying the core architecture.

## 3. Member Goal

Members can:

- register once and access all available products,
- view all active subscriptions in one dashboard,
- easily activate new products,
- make payments using various methods,
- obtain a License-ID for each activated product,
- and log in to each application without separate re-login.

## 4. Business Goal

- Build a modular, multi-SaaS ecosystem foundation that can grow.
- Centralize identity, licensing, and billing management in one system.
- Allow each SaaS product to focus on its core features without building authentication and billing systems.
- Open up revenue models based on subscription metrics.

## 5. Development Goal

- The system must be able to add new SaaS products with configuration only, without modifying core code.
- SSO integration with each application must use documented standards.
- All business rules must be documented before implementation.
- Programmers should not make assumptions about undefined licensing or billing rules.

## 6. Initial Scope

### 6.1 Member Account Management

- registration with email and password,
- email verification,
- login and logout,
- forgot password,
- basic profile management.

### 6.2 Product Catalog & Packages

- display a list of available SaaS products,
- display product packages (Free, Paid),
- provide feature and price information per package.

### 6.3 License Activation

- direct activation of free packages without payment,
- automatic creation of License-ID after activation,
- display License-ID in the dashboard and send to email.

### 6.4 Payment (For Paid Products)

- checkout using Midtrans or Xendit,
- automatic activation of licenses after successful payment,
- store payment transaction history,
- send invoices to email.

### 6.5 License Management

- view active license list,
- view status and active period per license,
- view License-ID per product,
- subscription renewal,
- and handling of Grace Period.

### 6.6 SSO (Single Sign-On)

- centralized login in Membership Hub,
- issuance of JWT tokens containing user and license information,
- token verification by SaaS applications,
- and handling of expired tokens.

### 6.7 Member Dashboard

- summary of all subscriptions,
- status of each product,
- payment history,
- and quick access to each application.

### 6.8 Notifications

- email account verification,
- email confirmation of license activation,
- email invoice payment,
- approaching expiration date notification,
- Grace Period notification,
- and access suspension notification.

## 7. Beyond Initial Scope

- management of teams or multi-users within an organization,
- billing based on usage,
- referral system or promo code,
- integration with third-party marketplaces,
- reseller or partner management,
- complete business financial accounting reports,
- and payment gateways other than Midtrans and Xendit.

## 8. Current Products

| Product | Model | Status |
|---|---|---|
| NOTO | Free Forever | Active |

## 9. Success Indicators

The system is considered successful if:

- Members can register and activate NOTO in one session,
- License-ID is received via email and displayed in the dashboard,
- Members can log in to NOTO through SSO without hindrance,
- Adding new paid products does not require modifying core architecture,
- All payment gateway processes run automatically without manual intervention.

## 10. Definition of Done

A feature is considered complete if:

- it matches this documentation,
- the main flow runs without errors,
- payment flow is atomic (not partially stored),
- SSO generates tokens verifiable by applications,
- email notifications are sent,
- sensitive data is protected,
- and it has been tested according to acceptance criteria.