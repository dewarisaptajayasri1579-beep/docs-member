# エンティティ関係図 (ERD)

## 目的

この ERD は、Central Membership & SSO Hub のデータ リレーショナル モデルを定義します。
主なデータベースは PostgreSQL 15+ を使用し、Prisma を ORM として使用します。主キーは UUID を使用し、タイムスタンプは UTC を使用し、テーブル/カラム名は `snake_case` を使用します。

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

## 関係と重要な制約

| 関係 | カーディナリティ | 正規化規則 |
|---|---:|---|
| Member → License | 1 : N | 1 つのメンバーは 1 つの有効なライセンスを 1 つの製品につき 1 つしか持つことができません。 |
| Product → Plan | 1 : N | パックは 1 つの製品にのみ属します。 |
| License → Order | 1 : N | オーダーは新しいライセンスを作成したり既存のライセンスを更新したりできます。 |
| Order → Payment | 1 : N | 1 つのオーダーは 1 つの有効な支払いを伴うことができます。 |
| Payment → Webhook Event | 1 : N | 支払いのリトライ/ペイロードはオーダーと関連付けられ、IDEMPOTENT になります。 |
| OAuth Client → Code/Token | 1 : N | 認証コードとリフレッシュトークンはクライアントに紐付けられます。 |

1 つのライセンスが 1 つのメンバーと 1 つの製品につき 1 つしか有効であることを保証するために、`licenses (member_id, product_id)` に partial unique index を使用します。