# User Roles — Central Membership & SSO Hub

## 1. Document Purpose

This document explains the roles that interact with the Central Membership & SSO Hub system, their responsibilities, and their limitations.

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

## 3.3 Primary Rights of Members

Members can:

- register and log in,
- verify email,
- view and edit their profile,
- view the list of available products,
- view product packages,
- activate free packages,
- make checkout payments for paid packages,
- view all active licenses,
- view License-ID per product,
- view license expiration dates,
- extend subscriptions,
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

The following data is connected to the member owner:

- profile,
- licenses,
- payment transactions,
- invoices,
- and notification preferences.

---

# 4. Role: System

## 4.1 Definition

The System is an automated process that runs backend functions, including payment gateway integration, token issuance, and notification sending.

## 4.2 System Responsibilities

The System is responsible for:

- receiving callbacks from payment gateways,
- verifying payment status,
- automatically activating or suspending licenses,
- generating License-ID,
- issuing JWT tokens during SSO,
- calculating license expiration dates,
- monitoring the Grace Period and sending notifications,
- suspending access after the Grace Period expires,
- and recording all processes in audit logs.

## 4.3 System Limitations

The System must not:

- activate paid licenses without valid payment confirmation,
- send tokens to users with inactive licenses,
- change member data without defined processes,
- and delete payment transaction data.

---

# 5. Role: Super Admin

## 5.1 Definition

The Super Admin is an internal role for managing the Membership Hub platform as a whole.

## 5.2 Super Admin Responsibilities

The Super Admin is responsible for:

- managing the list of registered SaaS products,
- managing product packages (name, price, duration, features),
- monitoring member and license status,
- managing payment gateway configurations,
- viewing transaction reports,
- viewing error logs,
- and handling escalation cases (suspend, manual refund, etc.).

## 5.3 Super Admin Rights

Super Admins can:

- view the list of all members,
- view member account and license status,
- manually activate or suspend member accounts,
- manage products and packages,
- manage system configurations,
- view aggregate transaction statistics,
- view revenue reports,
- view error logs and audit logs,
- and perform manual administrative actions in certain conditions.

## 5.4 Super Admin Limitations

By default, Super Admins must not:

- view member passwords,
- change personal financial data within SaaS applications (e.g., transactions in NOTO),
- access sensitive data without documented reasons and procedures.

---

# 6. Role Summary

| Role | Primary Function | Member Data Ownership |
|---|---|---|
| Member | Accessing products and managing subscriptions | Yes |
| System | Running automated backend processes | No |
| Super Admin | Managing the platform and operations | No |

## 7. Role Security Principles

- **Least Privilege**: Each role only receives access necessary for its tasks.
- **Data Ownership**: Member data can only be accessed by the member owner and Super Admin with valid reasons.
- **Audit Trail**: All significant administrative actions are recorded.
- **Separation of Concerns**: Authentication, billing, and licensing processes are logically separated.