# User Roles — Central Membership & SSO Hub

## 1. Document Purpose

This document describes the roles that interact with the Central Membership & SSO Hub system, the responsibilities of each role, and their limitations.

## 2. List of Roles

The system has three main roles:

1. Member
2. System
3. Super Admin

---

# 3. Role: Member

## 3.1 Definition

A Member is an end-user who registers and uses the Membership Hub service to access one or more SaaS products within the ecosystem.

## 3.2 Purpose

Members use the system to:

- register an account,
- activate product licenses,
- make subscription payments,
- view License-ID,
- and log in to applications via SSO.

## 3.3 Main Member Rights

Members can:

- register and log in,
- verify email,
- view and modify profile,
- view a list of available products,
- view packages per product,
- activate free packages,
- checkout paid packages,
- view all their active licenses,
- view License-ID per product,
- view license validity period,
- renew subscriptions,
- view payment history,
- download invoices,
- and log in to applications via SSO.

## 3.4 Member Limitations

Members cannot:

- view other members' data,
- manage system configurations,
- manage product and package lists,
- change package prices,
- access the Super Admin panel,
- and directly verify JWT tokens.

## 3.5 Data Ownership

All the following data is linked to its owning member:

- profile,
- licenses,
- payment transactions,
- invoices,
- and notification preferences.

---

# 4. Role: System

## 4.1 Definition

System refers to automated processes that perform backend functions, including payment gateway integration, token issuance, and notification delivery.

## 4.2 System Responsibilities

The System is responsible for:

- receiving callbacks from payment gateways,
- verifying payment status,
- automatically activating or suspending licenses,
- generating License-ID,
- issuing JWT tokens during SSO,
- calculating license expiration periods,
- monitoring Grace Period and sending notifications,
- suspending access after the Grace Period expires,
- and logging all processes to the audit log.

## 4.3 System Limitations

The System must not:

- activate paid licenses without valid payment confirmation,
- send tokens to users with inactive licenses,
- modify member data without a defined process,
- and delete payment transaction data.

---

# 5. Role: Super Admin

## 5.1 Definition

Super Admin is an internal role for managing the entire Membership Hub platform.

## 5.2 Super Admin Responsibilities

The Super Admin is responsible for:

- managing the list of registered SaaS products,
- managing packages per product (name, price, duration, features),
- monitoring member and license status,
- managing payment gateway configurations,
- viewing transaction reports,
- viewing error logs,
- and handling escalation cases (suspension, manual refunds, etc.).

## 5.3 Super Admin Rights

Super Admins can:

- view a list of all members,
- view member account and license status,
- manually activate or suspend member accounts,
- manage products and packages,
- manage system configurations,
- view aggregated transaction statistics,
- view revenue reports,
- view error logs and audit logs,
- and perform manual administrative actions under specific conditions.

## 5.4 Super Admin Limitations

Super Admins, by default, must not:

- view member passwords,
- modify personal financial data within SaaS applications (e.g., transactions in NOTO),
- access sensitive data without documented reasons and procedures.

---

# 6. Role Summary

| Role | Primary Function | Member Data Owner |
|---|---|---|
| Member | Access products and manage subscriptions | Yes |
| System | Execute automated backend processes | No |
| Super Admin | Manage platform and operations | No |

## 7. Role Security Principles

- **Least Privilege**: Each role only receives access according to its task requirements.
- **Data Ownership**: Member data can only be accessed by the owning member and Super Admin for legitimate reasons.
- **Audit Trail**: All important administrative actions are logged.
- **Separation of Concerns**: Authentication, billing, and licensing processes are logically separated.