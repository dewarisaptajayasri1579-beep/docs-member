# Entity Relationship Diagram (ERD)

## Purpose

This ERD defines a relational data model for the Central Membership & SSO Hub. The primary database uses PostgreSQL 15+ with Prisma as the ORM. The primary key uses UUID, timestamps are stored as UTC, and table/column names use `snake_case`.

```mermaid
erDiagram
    members ||--o{ licenses : owns
    members ||--o{ orders : creates
    members ||--o{ email_verification_tokens : verifies
    members ||--o{ password_reset_tokens : resets
    members ||--o{ authorization_codes : authorizes
    members ||--o{ refresh_tokens : receives
    members ||--o{ audit_logs : acts
    members ||--|| notification_preferences : configures
    products ||--o{ plans : has
    products ||--o{ licenses : grants
    plans ||--o{ licenses : selected_by
    plans ||--o{ orders : ordered_as
    licenses ||--o{ orders : renewed_by
    orders ||--o{ payments : records
    payments ||--o{ webhook_events : receives
    oauth_clients ||--o{ authorization_codes : requests
    oauth_clients ||--o{ refresh_tokens : issues
    jwt_signing_keys ||--o{ refresh_tokens : signs

    members {
      uuid id PK
      varchar email UK
      member_status status
      member_role role
    }
    products {
      uuid id PK
      varchar code UK
      boolean is_active
    }
    plans {
      uuid id PK
      uuid product_id FK
      varchar code
      bigint price_amount
    }
    licenses {
      uuid id PK
      uuid member_id FK
      uuid product_id FK
      uuid plan_id FK
      varchar license_key UK
      license_status status
    }
    orders {
      uuid id PK
      varchar order_number UK
      uuid member_id FK
      uuid plan_id FK
      uuid license_id FK
      order_status status
    }
    payments {
      uuid id PK
      uuid order_id FK
      payment_gateway gateway
      varchar gateway_transaction_id
      payment_status status
    }
    webhook_events {
      uuid id PK
      uuid payment_id FK
      varchar external_event_id
      boolean signature_valid
    }
    oauth_clients {
      uuid id PK
      varchar client_id UK
    }
    authorization_codes {
      uuid id PK
      uuid member_id FK
      uuid oauth_client_id FK
      varchar code_hash UK
    }
    refresh_tokens {
      uuid id PK
      uuid member_id FK
      uuid oauth_client_id FK
      uuid signing_key_id FK
      varchar token_hash UK
    }
```

## Important Relationships and Constraints

| Relationship | Cardinality | Integrity Rule |
| --- | ---: | --- |
| Member → License | 1 : N | One member can only have one active license per product. |
| Product → Plan | 1 : N | A plan is always owned by one product. |
| License → Order | 1 : N | An order can create a new license or renew an existing one. |
| Order → Payment | 1 : N | Supports retries; only successful payments finalize an order. |
| Payment → Webhook Event | 1 : N | Payload/retry gateway is recorded for audit and idempotence. |
| OAuth Client → Code/Token | 1 : N | Authorization code and refresh token are tied to the requesting client. |

The rule of one active license per member and product is enforced through a partial unique index on `licenses (member_id, product_id)` for statuses other than `cancelled`.