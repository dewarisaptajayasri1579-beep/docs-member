# SSO 認証フロー — 中央会員管理 & SSO ハブ

## 1. ドキュメントの目的

このドキュメントは、会員がさまざまな SaaS アプリにアクセスするために使用する Single Sign-On (SSO) のフローを説明します。

## 2. アクター

- 会員
- SaaS アプリ (例: NOTO)
- 会員管理ハブ (SSO プロバイダー)

## 3. SSO の基本概念

```
会員ログイン
    │
    ▼
会員管理ハブ (SSO プロバイダー)
    │── アカウント & ライセンスの検証
    │
    ▼
JWT トークンが発行される
    │
    ▼
SaaS アプリがトークンを受け取る
    │── トークンの検証
    │── メンバー ID、階層、製品、有効期限の読み取り
    │
    ▼
会員がアプリのダッシュボードにログインする
```

## 4. 会員のログインフロー

### 4.1 技術的なステップ

1. 会員が SaaS アプリを開く (例: `app.noto.com`).
2. 会員が **ログイン** ボタンをクリックする。
3. SaaS アプリが `state` パラメーター (セキュリティのための CSRF) を作成し、暫定的に保存する。
4. SaaS アプリが会員管理ハブのログインエンドポイントにリダイレクトする:
   ```
   https://hub.domain.com/oauth/authorize
     ?client_id=[APP_CLIENT_ID]
     &redirect_uri=[CALLBACK_URL_APLIKASI]
     &response_type=code
     &state=[RANDOM_STATE]
     &scope=profile:read license:read
   ```
5. 会員がハブのログインページでメールアドレスとパスワードを入力する。
6. ハブが会員の:
   - 認証情報を検証する
   - アカウントのステータス (`active`) を検証する
   - ライセンスの有効性を検証する
7. 有効であれば、ハブがアプリに **認可コード** をリダイレクトする:
   ```
   https://callback.noto.com/auth/callback
     ?code=[AUTH_CODE]
     &state=[RANDOM_STATE]
   ```
8. SaaS アプリが `state` を検証して CSRF を防ぐ。
9. SaaS アプリがハブに `code` を送信する (バックエンドからバックエンドのリクエスト):
   ```
   POST https://hub.domain.com/oauth/token
   Body: {
     client_id, client_secret, code, redirect_uri, grant_type: "authorization_code"
   }
   ```
10. ハブが JWT アクセストークンを返す:
    ```json
    {
      "access_token": "eyJhbGci...",
      "token_type": "Bearer",
      "expires_in": 3600,
      "refresh_token": "..."
    }
    ```
11. SaaS アプリが JWT の内容を読み取り検証する:
    ```json
    {
      "sub": "member_id",
      "name": "会員名",
      "email": "email@会員.com",
      "product": "NTO",
      "license_id": "NTO-A1B2-C3D4-E5F6",
      "tier": "free",
      "license_status": "active_free",
      "expires_at": null,
      "iat": 1720000000,
      "exp": 1720003600
    }
    ```
12. SaaS アプリがローカルセッションを作成する。
13. 会員がアプリのダッシュボードにログインする。

---

## 5. リフレッシュトークンのフロー

アクセストークンが期限切れになったとき:

1. SaaS アプリがリフレッシュトークンをハブに送信する。
2. ハブがリフレッシュトークンとライセンスのステータスを検証する。
3. ライセンスが有効であれば、ハブが新しいアクセストークンを発行する。
4. ライセンスが無効または凍結であれば、ハブがエラー `license_inactive` を返す。
5. SaaS アプリが会員をリフレッシュトークンページにリダイレクトする。

---

## 6. ログアウトのフロー

1. 会員がアプリのログアウトボタンをクリックする。
2. SaaS アプリがローカルセッションとトークンを削除する。
3. SaaS アプリがオプションでハブのログアウトエンドポイントにリダイレクトする:
   ```
   https://hub.domain.com/oauth/logout
     ?post_logout_redirect_uri=[ログアウト後のページ]
   ```
4. ハブが会員のハブセッションを終了する。
5. 会員が指定されたページにリダイレクトされる。

---

## 7. JWT トークンのフィールド

| フィールド | タイプ | 説明 |
|---|---|---|
| `sub` | string | 会員のユニークID |
| `name` | string | 会員の名前 |
| `email` | string | 会員のメールアドレス |
| `product` | string | SaaS アプリの製品コード |
| `license_id` | string | 会員のライセンスID |
| `tier` | string | 有効な階層 (`free`, `pro`, `business`) |
| `license_status` | string | ライセンスのステータス (`active`, `active_free`, `grace_period`, `suspended`) |
| `expires_at` | タイムスタンプ / null | ライセンスの期限切れ日時 (`null` なら永久有効) |
| `iat` | タイムスタンプ | トークンの発行日時 |
| `exp` | タイムスタンプ | トークンの期限切れ日時 |

---

## 8. アプリのトークン検証方法

アプリはハブの **パブリックキー** (RS256) を使用して JWT を検証する。

1. アプリがパブリックキーを取得する:
   ```
   GET https://hub.domain.com/.well-known/jwks.json
   ```
2. アプリがトークンの署名をパブリックキーで検証する。
3. アプリがトークンの期限切れを検証する。
4. アプリが製品コードがアプリのコードと一致するかを検証する。
5. アプリがライセンスステータスが `active`, `active_free`, または `grace_period` であるかを検証する。
6. すべての条件が満たされれば、会員がアプリにログインできる。

---

## 9. エラー条件と対応

| エラー条件 | ハブのレスポンス | アプリの対応 |
|---|---|---|
| 認証情報が不正 | `401 invalid_credentials` | ログインエラーを表示する |
| アカウントが未確認 | `403 email_not_verified` | 未確認アカウントページにリダイレクトする |
| アカウントが非アクティブ | `403 account_suspended` | サポートチームに連絡する |
| ライセンスが無効 | `403 no_license` | ライセンス選択ページにリダイレクトする |
| ライセンスが凍結 | `403 license_suspended` | ライセンス更新ページにリダイレクトする |
| トークンが期限切れ | `401 token_expired` | リフレッシュトークンを取得する |
| リフレッシュトークンが無効 | `401 invalid_refresh_token` | ログインページにリダイレクトする |

---

## 10. SSO のセキュリティ

- JWT は **RS256** (非対称) アルゴリズムで署名される。
- 秘密鍵はハブのサーバーにのみ保存される。
- パブリックキーはアプリが検証に使用できる。
- アクセストークンは短期間有効 (例: 1 時間)。
- リフレッシュトークンは長期間有効 (例: 30 日)。
- State パラメーターは CSRF を防ぐために使用される。
- 全ての通信は HTTPS で行われる。
- アプリは会員の認証情報 (パスワード) を保存してはならない。

---

## 11. 新規 SaaS アプリの統合

新規 SaaS アプリがエコシステムに参加するには:

1. ハブに OAuth2 クライアントとして登録する。
2. `client_id` と `client_secret` を取得する。
3.許可された `redirect_uri` を登録する。
