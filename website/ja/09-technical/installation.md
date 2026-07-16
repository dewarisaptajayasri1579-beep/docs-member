# インストール & セットアップ ガイド

## 必要条件

- Node.js LTS と選択したパッケージ マネージャー (pnpm が推奨)
- PostgreSQL 15+ と Redis 7+ ローカル環境、または Docker Compose を使用
- リポジトリを分離: `frontend` (Next.js) と `backend` (NestJS + Prisma)

## Backend NestJS

```bash
cd backend
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm prisma migrate dev
pnpm start:dev
```

`.env` ファイルの最小限の設定:

```dotenv
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/membership_hub
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

開発プロセスでワーカーを実行しない場合は、別のターミナルで次のコマンドを実行します。

```bash
pnpm start:worker
```

API は `http://localhost:3001` で、Swagger は `http://localhost:3001/api/docs` で利用できます。

## Frontend Next.js

```bash
cd project/frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

`NEXT_PUBLIC_API_URL=http://localhost:3001` を使用します。環境変数にデータベース、Redis、支払いシークレット、または JWT 秘密鍵を含めないようにしてください。

## データベースとキュー

- `pnpm prisma migrate dev --name <description>` を使用して新しいマイグレーションを作成します。
- Prisma のマイグレーション ファイルとスキーマの変更を一緒にコミットします。
- `pnpm prisma studio` を開発環境で使用します。
- Redis の検証を実行し、メール、スケジューラ、またはワーカーをテストする前に、ワーカーが接続され、ジョブが失敗していないことを確認します。

## マージ前に実行するチェック

1. バックエンドの lint、ユニット テスト、統合 テスト、ビルドを実行します。
2. 空のデータベースとデータベース アップグレード コピーでマイグレーションを実行し、互換性を確認します。
3. Midtrans/Xendit のサンドボックスをテストし、サインャーが無効である場合や Webhook のリトライをテストします。
4. Redis が有効で、ジョブ メール/ライフサイクルをテストし、リトライをシミュレートします。