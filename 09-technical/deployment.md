# Deployment Guide — Coolify on VPS

## 1. Topologi production

Coolify diinstal pada VPS dan menjalankan container terpisah untuk:

| Service | Fungsi | Ekspos publik |
|---|---|---|
| `frontend` | Next.js | Ya, `hub.domain.com`. |
| `backend-api` | NestJS HTTP/API/OAuth/webhook | Ya, `api.hub.domain.com`. |
| `backend-worker` | BullMQ processor dan scheduler | Tidak. |
| `postgres` | PostgreSQL | Tidak. |
| `redis` | BullMQ/Redis | Tidak. |

Coolify reverse proxy menangani domain dan TLS. Database/Redis hanya diakses lewat private network Docker/Coolify.

## 2. Persiapan Coolify

1. Buat project dan environment terpisah: `staging` serta `production`.
2. Tambahkan resource Git untuk frontend dan backend repository.
3. Tambahkan PostgreSQL dan Redis managed resource pada environment yang sesuai.
4. Tambahkan domain, aktifkan HTTPS, lalu atur CORS `FRONTEND_URL` backend sesuai domain frontend.
5. Simpan seluruh environment variable sebagai Coolify secret; jangan commit `.env`.

Backend dideploy dua kali dari source/image yang sama: `backend-api` menjalankan `pnpm start:prod`; `backend-worker` menjalankan `pnpm start:worker`. Pastikan hanya **satu** scheduler lifecycle aktif per environment, atau gunakan distributed lock Redis.

## 3. Urutan deploy

1. Backup database dan review migration Prisma.
2. Deploy `backend-api` baru.
3. Jalankan migration production dengan `pnpm prisma migrate deploy` sebagai pre-deploy/release command satu kali.
4. Deploy atau restart `backend-worker` dengan environment yang sama.
5. Deploy frontend dengan `NEXT_PUBLIC_API_URL` yang benar.
6. Cek `/health`, `/api/docs` (staging saja), worker queue, dan webhook sandbox.

Migration tidak boleh dieksekusi serentak oleh API dan worker. Gunakan release command/one-off task Coolify.

## 4. Payment webhook dan OAuth

- Daftarkan `https://api.hub.domain.com/webhooks/midtrans` dan `https://api.hub.domain.com/webhooks/xendit` di dashboard provider.
- Daftarkan redirect URI OAuth SaaS persis seperti pada `oauth_clients`; jangan menerima wildcard.
- Pastikan endpoint webhook menerima raw body bila signature provider memerlukannya.
- Setelah deploy, lakukan transaksi sandbox dan retry webhook untuk memastikan idempotensi.

## 5. Monitoring, backup, dan rollback

- Pantau container health, HTTP 5xx, disk VPS, koneksi PostgreSQL/Redis, queue failed jobs, dan error webhook.
- Backup PostgreSQL terjadwal serta uji restore berkala. Redis tidak memegang source of truth, tetapi konfigurasi persistence membantu pemulihan queue.
- Simpan log audit/error pada retensi yang disepakati; jangan menyimpan secret atau token mentah.
- Rollback aplikasi melalui deployment revision Coolify. Untuk migration destruktif, gunakan migration kompatibel bertahap; jangan rollback schema tanpa backup teruji.

## 6. Checklist go-live

- [ ] HTTPS/domain/CORS benar untuk frontend dan API.
- [ ] PostgreSQL dan Redis tidak terbuka ke internet.
- [ ] Environment secret terisi dan berbeda antara staging/production.
- [ ] Prisma migration sudah sukses sekali.
- [ ] API dan worker sehat; scheduler tidak berjalan ganda.
- [ ] Midtrans/Xendit webhook signature dan retry lulus sandbox test.
- [ ] Email verification/invoice dan job lifecycle terproses.
- [ ] Backup database dan prosedur rollback sudah diuji.
