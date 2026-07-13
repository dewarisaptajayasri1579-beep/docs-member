# Goals and Scope — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the product's purpose, development goals, and scope of the Central Membership & SSO Hub system.

## 2. Product Goal

To be a centralized identity and licensing system that:

1.  **Simplifies** user registration and login experience across the SaaS ecosystem.
2.  **Manages** subscription lifecycle (activation, renewal, suspension) automatically.
3.  **Secures** access to each application through a JWT-based SSO mechanism.
4.  **Supports** ecosystem growth with the ability to add new products without changing the core architecture.

## 3. Member Goal

Users (Members) can:

-   register once and access all available products,
-   view all active subscriptions in one dashboard,
-   activate new products easily,
-   make payments with diverse methods,
-   obtain a License-ID for each activated product,
-   and log in to each application without having to log in separately.

## 4. Business Goal

-   Build a foundation for a multi-SaaS ecosystem that can grow modularly.
-   Centralize identity, licensing, and billing management in one system.
-   Enable each SaaS product to focus on its core features without having to build its own authentication and billing system.
-   Open opportunities for a scalable subscription-based revenue model.

## 5. Development Goal

-   The system must be able to add new SaaS products with configuration only, without core code changes.
-   SSO integration into each application must use clearly documented standards.
-   All business rules must be documented before implementation.
-   Programmers must not make assumptions about undefined licensing or billing rules.

## 6. Initial Version Scope

### 6.1 Member Account Management

-   registration with email and password,
-   email verification,
-   login and logout,
-   forgot password,
-   basic profile management.

### 6.2 Product & Package Catalog

-   display available SaaS products list,
-   display packages per product (Free, Paid),
-   provide feature and price information per package.

### 6.3 License Activation

-   direct activation of free packages without payment,
-   automatic License-ID creation after activation,
-   License-ID display on the dashboard and delivery to email.

### 6.4 Payments (For Paid Products)

-   checkout using Midtrans or Xendit,
-   automatic license activation after successful payment,
-   storage of payment transaction history,
-   invoice delivery to email.

### 6.5 License Management

-   view active licenses list,
-   view status and active period per license,
-   view License-ID per product,
-   subscription renewal,
-   and Grace Period handling.

### 6.6 SSO (Single Sign-On)

-   centralized login in Membership Hub,
-   issuance of JWT token containing user and license information,
-   token verification by SaaS applications,
-   and expired token handling.

### 6.7 Member Dashboard

-   summary of all subscriptions,
-   status of each product,
-   payment history,
-   and quick access to each application.

### 6.8 Notifications

-   account verification email,
-   license activation confirmation email,
-   payment invoice email,
-   near-expiration notification,
-   Grace Period notification,
-   and access suspension notification.

## 7. Out of Initial Version Scope

-   team or multi-user management within an organization,
-   usage-based billing,
-   referral system or promo codes,
-   integration with third-party marketplaces,
-   reseller or partner management,
-   complete business accounting financial reports,
-   and payment gateways other than Midtrans and Xendit.

## 8. Current Products

| Product | Model           | Status |
| :------ | :-------------- | :----- |
| NOTO    | Free Forever | Active |

## 9. Success Indicators

The system is considered successful if:

-   Members can register and activate NOTO in one session,
-   License-ID is received via email and displayed on the dashboard,
-   Members can log in to NOTO via SSO without hindrance,
-   Adding new paid products does not require core architectural changes,
-   The entire payment gateway process runs automatically without manual intervention.

## 10. Definition of Done

A feature is considered done if:

-   it conforms to this documentation,
-   the main flow runs without errors,
-   the payment flow is atomic (not partially saved),
-   SSO generates a verifiable token by the application,
-   email notifications are sent,
-   all sensitive data is protected,
-   and it has been tested according to acceptance criteria.