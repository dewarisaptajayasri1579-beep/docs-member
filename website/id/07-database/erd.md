# Entity Relationship Diagram (ERD)

## Tujuan

ERD ini mendefinisikan model data relasional untuk Central Membership & SSO Hub.
Database utama menggunakan PostgreSQL 15+ dengan Prisma sebagai ORM. Primary key
menggunakan UUID, timestamp disimpan sebagai UTC, dan nama tabel/kolom memakai
`snake_case`.

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

## Relasi dan batasan penting

| Relasi | Kardinalitas | Aturan integritas |
|---|---:|---|
| Member → License | 1 : N | Satu member hanya boleh memiliki satu lisensi yang masih berlaku per produk. |
| Product → Plan | 1 : N | Paket selalu dimiliki tepat oleh satu produk. |
| License → Order | 1 : N | Order dapat membuat lisensi baru atau memperpanjang lisensi yang sudah ada. |
| Order → Payment | 1 : N | Mendukung percobaan ulang; hanya pembayaran sukses yang memfinalkan order. |
| Payment → Webhook Event | 1 : N | Payload/retry gateway dicatat untuk audit dan idempotensi. |
| OAuth Client → Code/Token | 1 : N | Authorization code dan refresh token terikat pada client peminta. |

Aturan satu lisensi aktif per member dan produk diterapkan melalui partial unique
index pada `licenses (member_id, product_id)` untuk status selain `cancelled`.
