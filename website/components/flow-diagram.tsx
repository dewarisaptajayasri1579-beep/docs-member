'use client'
import { useState } from 'react'

/* ── Types ─────────────────────────────────────────────────── */
type Kind = 'pill' | 'step' | 'sys' | 'dec' | 'ok' | 'warn' | 'fail'

interface N {
  id: string; cx: number; cy: number; w: number; h: number
  kind: Kind; label: string; sub?: string; info?: string
}
interface E {
  pts: number[][]; label?: string; lx?: number; ly?: number; back?: boolean
}
interface Flow {
  id: string; emoji: string; title: string
  vb: string; nodes: N[]; edges: E[]
}

/* ── Palette ───────────────────────────────────────────────── */
const STYLE: Record<Kind, { fill: string; stroke: string; text: string; sub: string }> = {
  pill: { fill: '#1a1430', stroke: '#a78bfa', text: '#a78bfa', sub: '#7c6dc4' },
  step: { fill: '#181820', stroke: '#3a3a50', text: '#f0eeff', sub: '#8886a4' },
  sys:  { fill: '#0f172a', stroke: '#3b82f6', text: '#93c5fd', sub: '#5e8ab4' },
  dec:  { fill: '#1c1500', stroke: '#f59e0b', text: '#fcd34d', sub: '#b8882a' },
  ok:   { fill: '#052e1a', stroke: '#10b981', text: '#6ee7b7', sub: '#2d8a5e' },
  warn: { fill: '#2a1a00', stroke: '#f59e0b', text: '#fcd34d', sub: '#b8882a' },
  fail: { fill: '#2a0a0a', stroke: '#ef4444', text: '#fca5a5', sub: '#b83434' },
}

/* ── Flow data ─────────────────────────────────────────────── */
const getFlows = (lang: string): Flow[] => [
  /* ── 1. REGISTRASI ───────────────────────────────────────── */
  {
    id: 'reg', emoji: '👤', title: lang === 'en' ? 'Registration' : lang === 'ja' ? '登録' : 'Registrasi',
    vb: '0 0 680 548',
    nodes: [
      { id:'s', cx:340,cy:26, w:150,h:32, kind:'pill', label:lang === 'en' ? 'New User' : lang === 'ja' ? '新規ユーザー' : 'Pengguna Baru', info:lang === 'en' ? 'Potential member opens the platform for the first time.' : lang === 'ja' ? '見込みメンバーが初めてプラットフォームを開きます。' : 'Calon member membuka platform untuk pertama kali.' },
      { id:'f', cx:340,cy:94, w:280,h:42, kind:'step', label:lang === 'en' ? 'Fill Registration Form' : lang === 'ja' ? '登録フォームに入力' : 'Isi Form Registrasi', sub:'Name · Email · Password', info:lang === 'en' ? 'Validation: unique email, min 8 chars password. Inline errors.' : lang === 'ja' ? '検証：一意のメール、パスワード8文字以上。インラインエラー。' : 'Validasi: email unik, password min. 8 karakter. Error inline per field.' },
      { id:'c', cx:340,cy:162,w:280,h:42, kind:'sys',  label:lang === 'en' ? 'Account Created (Unverified)' : lang === 'ja' ? 'アカウント作成（未検証）' : 'Akun dibuat (unverified)', sub:'POST /api/v1/auth/register', info:lang === 'en' ? 'Password hashed with Argon2. Cannot login until email is verified.' : lang === 'ja' ? 'パスワードはArgon2でハッシュ化。メールが検証されるまでログインできません。' : 'Password di-hash dengan Argon2. Akun belum bisa login sebelum email diverifikasi.' },
      { id:'e', cx:340,cy:230,w:280,h:42, kind:'sys',  label:lang === 'en' ? 'Verification Email Sent' : lang === 'ja' ? '検証メール送信完了' : 'Email verifikasi dikirim', sub:'via BullMQ · expires 24h', info:lang === 'en' ? 'Email sent asynchronously. Unique token valid for 24 hours.' : lang === 'ja' ? 'メールは非同期で送信されます。ユニークトークンは24時間有効です。' : 'Email dikirim secara async. Token unik hanya berlaku sekali dan 24 jam.' },
      { id:'k', cx:340,cy:298,w:280,h:42, kind:'step', label:lang === 'en' ? 'Click Verification Link' : lang === 'ja' ? '検証リンクをクリック' : 'Klik tautan verifikasi', info:lang === 'en' ? 'Member opens link in email. Token is verified on the server.' : lang === 'ja' ? 'メンバーはメール内のリンクを開きます。サーバーでトークンが検証されます。' : 'Member membuka link di email. Token dicocokkan di server.' },
      { id:'v', cx:340,cy:374,w:280,h:42, kind:'dec',  label:lang === 'en' ? 'Token valid & unused?' : lang === 'ja' ? 'トークンは有効で未使用？' : 'Token valid & belum dipakai?', info:lang === 'en' ? 'Checks if token exists, not used_at, and not expired.' : lang === 'ja' ? 'トークンが存在し、使用されておらず、期限切れでないか確認します。' : 'Pengecekan: token ada, belum used_at, belum expired.' },
      { id:'a', cx:170,cy:466,w:210,h:42, kind:'ok',   label:lang === 'en' ? 'Account ACTIVE ✓' : lang === 'ja' ? 'アカウント アクティブ ✓' : 'Akun AKTIF ✓', sub:'Status: active', info:lang === 'en' ? 'Member can login, activate products, and checkout.' : lang === 'ja' ? 'メンバーはログインし、製品をアクティブ化し、チェックアウトできます。' : 'Member dapat login, aktivasi produk, dan checkout.' },
      { id:'r', cx:530,cy:466,w:185,h:42, kind:'warn', label:lang === 'en' ? 'Resend Email' : lang === 'ja' ? 'メール再送' : 'Kirim ulang email', sub:'Cooldown: 60 seconds', info:lang === 'en' ? 'Old token invalidated. New email sent via queue.' : lang === 'ja' ? '古いトークンは無効になります。キューを介して新しいメールが送信されます。' : 'Token lama diinvalidasi. Email baru dikirim via queue.' },
    ],
    edges: [
      { pts:[[340,42],[340,73]] },
      { pts:[[340,115],[340,141]] },
      { pts:[[340,183],[340,209]] },
      { pts:[[340,251],[340,277]] },
      { pts:[[340,319],[340,353]] },
      { pts:[[340,395],[340,436],[170,436],[170,445]], label:lang === 'en' ? 'Yes' : lang === 'ja' ? 'はい' : 'Ya', lx:240, ly:430 },
      { pts:[[340,395],[340,436],[530,436],[530,445]], label:lang === 'en' ? 'No' : lang === 'ja' ? 'いいえ' : 'Tidak', lx:442, ly:430 },
      { pts:[[530,487],[635,487],[635,219],[481,219]], label:lang === 'en' ? '↑ try again' : lang === 'ja' ? '↑ 再試行' : '↑ coba lagi', lx:635, ly:350, back:true },
    ],
  },

  /* ── 2. AKTIVASI LISENSI ─────────────────────────────────── */
  {
    id: 'act', emoji: '🔑', title: lang === 'en' ? 'Activation' : lang === 'ja' ? 'アクティベーション' : 'Aktivasi',
    vb: '0 0 820 570',
    nodes: [
      { id:'p', cx:410,cy:26, w:220,h:42, kind:'step', label:lang === 'en' ? 'Select Product' : lang === 'ja' ? '製品を選択' : 'Pilih Produk', sub:lang === 'en' ? 'from SaaS Catalog' : lang === 'ja' ? 'SaaSカタログから' : 'dari Katalog SaaS', info:lang === 'en' ? 'Only active products shown. Purchased products marked as "Active".' : lang === 'ja' ? 'アクティブな製品のみが表示されます。購入済みの製品は「アクティブ」とマークされます。' : 'Hanya produk aktif yang ditampilkan. Produk yang sudah diaktifkan ditandai "Sudah Aktif".' },
      { id:'t', cx:410,cy:96, w:220,h:42, kind:'step', label:lang === 'en' ? 'Select Plan' : lang === 'ja' ? 'プランを選択' : 'Pilih Paket', info:lang === 'en' ? 'Free Forever, Pro Monthly, or Pro Yearly. Prices are snapshotted.' : lang === 'ja' ? 'Free Forever、Pro Monthly、またはPro Yearly。価格はスナップショットされます。' : 'Free Forever, Pro Monthly, atau Pro Yearly. Harga disimpan sebagai snapshot saat order dibuat.' },
      { id:'q', cx:410,cy:172,w:220,h:42, kind:'dec',  label:lang === 'en' ? 'Free Forever Plan?' : lang === 'ja' ? 'Free Foreverプラン？' : 'Paket Free Forever?', info:lang === 'en' ? 'Free plans skip payment and activate directly.' : lang === 'ja' ? '無料プランは支払いをスキップして直接アクティブ化します。' : 'Paket free tidak memerlukan pembayaran. Langsung dibuat tanpa order/payment.' },
      { id:'fa',cx:155,cy:270,w:200,h:42, kind:'sys',  label:lang === 'en' ? 'Direct Activation' : lang === 'ja' ? '直接アクティベーション' : 'Aktivasi Langsung', sub:'POST /licenses/activate-free', info:lang === 'en' ? 'active_free license created. Unique License-ID generated.' : lang === 'ja' ? 'active_freeライセンスが作成されました。一意のLicense-IDが生成されます。' : 'Lisensi active_free dibuat. License-ID unik di-generate dan dikirim via email.' },
      { id:'or',cx:655,cy:270,w:210,h:42, kind:'step', label:lang === 'en' ? 'Create Order' : lang === 'ja' ? '注文を作成' : 'Buat Order', sub:'Header: Idempotency-Key', info:lang === 'en' ? 'Idempotency key prevents duplicates. Status: pending_payment.' : lang === 'ja' ? 'べき等キーにより重複を防ぎます。ステータス：支払い保留中。' : 'Cek idempotency key mencegah order duplikat. Status: pending_payment.' },
      { id:'py',cx:655,cy:346,w:210,h:42, kind:'step', label:lang === 'en' ? 'Pay at Gateway' : lang === 'ja' ? 'ゲートウェイで支払い' : 'Bayar di Gateway', sub:'Midtrans / Xendit', info:lang === 'en' ? 'User redirected to hosted payment page.' : lang === 'ja' ? 'ユーザーはホストされた支払いページにリダイレクトされます。' : 'Member diarahkan ke hosted payment page. Mendukung Transfer, GoPay, OVO, QRIS.' },
      { id:'wh',cx:655,cy:422,w:210,h:42, kind:'sys',  label:lang === 'en' ? 'Webhook Settlement' : lang === 'ja' ? 'Webhook 決済' : 'Webhook Settlement', sub:lang === 'en' ? 'Validate signature + amount' : lang === 'ja' ? '署名と金額の検証' : 'Validasi signature + amount', info:lang === 'en' ? 'Atomic: payment, order, license updated together.' : lang === 'ja' ? 'アトミック：支払い、注文、ライセンスが一緒に更新されます。' : 'Atomik: payment, order, license, dan audit log berhasil bersama atau gagal bersama.' },
      { id:'li',cx:410,cy:524,w:240,h:44, kind:'ok',   label:lang === 'en' ? 'License ACTIVE ✓' : lang === 'ja' ? 'ライセンス アクティブ ✓' : 'Lisensi AKTIF ✓', sub:'NTO-XXXX-XXXX-XXXX', info:lang === 'en' ? 'License-ID unchanged on renewal.' : lang === 'ja' ? '更新時にLicense-IDは変更されません。' : 'License-ID tidak berubah saat renewal. Free = active_free, Paid = active.' },
    ],
    edges: [
      { pts:[[410,47],[410,75]] },
      { pts:[[410,117],[410,151]] },
      { pts:[[410,193],[410,232],[155,232],[155,249]], label:lang === 'en' ? 'Yes (Free)' : lang === 'ja' ? 'はい（無料）' : 'Ya (Free)', lx:256, ly:226 },
      { pts:[[410,193],[410,232],[655,232],[655,249]], label:lang === 'en' ? 'No (Paid)' : lang === 'ja' ? 'いいえ（有料）' : 'Tidak (Paid)', lx:540, ly:226 },
      { pts:[[655,291],[655,325]] },
      { pts:[[655,367],[655,401]] },
      { pts:[[155,291],[155,502],[290,502]] },
      { pts:[[655,443],[655,502],[531,502]] },
    ],
  },

  /* ── 3. SSO LOGIN ────────────────────────────────────────── */
  {
    id: 'sso', emoji: '🔐', title: lang === 'en' ? 'SSO Login' : lang === 'ja' ? 'SSO ログイン' : 'SSO Login',
    vb: '0 0 700 580',
    nodes: [
      { id:'o', cx:350,cy:26, w:220,h:42, kind:'step', label:lang === 'en' ? 'Open SaaS App' : lang === 'ja' ? 'SaaSアプリを開く' : 'Buka Produk SaaS', info:lang === 'en' ? 'User clicks "Open App" from Hub dashboard.' : lang === 'ja' ? 'ユーザーはHubダッシュボードから「アプリを開く」をクリックします。' : 'Member klik "Buka Aplikasi" dari dashboard Hub.' },
      { id:'a', cx:350,cy:96, w:240,h:42, kind:'sys',  label:lang === 'en' ? 'Redirect to /oauth' : lang === 'ja' ? '/oauth にリダイレクト' : 'Redirect ke /oauth/authorize', sub:'PKCE + state + scope', info:lang === 'en' ? 'Hub validates client_id and redirect_uri.' : lang === 'ja' ? 'Hubはclient_idとredirect_uriを検証します。' : 'SaaS mengirim code_challenge PKCE. Hub memvalidasi client_id dan redirect_uri.' },
      { id:'v', cx:350,cy:166,w:240,h:42, kind:'sys',  label:lang === 'en' ? 'Validate Session & License' : lang === 'ja' ? 'セッションとライセンスを検証' : 'Hub validasi sesi & lisensi', info:lang === 'en' ? 'Check: active account and valid license.' : lang === 'ja' ? '確認：アクティブなアカウントと有効なライセンス。' : 'Cek: akun active, lisensi active/active_free/grace_period untuk produk ini.' },
      { id:'q', cx:350,cy:242,w:200,h:42, kind:'dec',  label:lang === 'en' ? 'Access Granted?' : lang === 'ja' ? 'アクセス許可？' : 'Akses diizinkan?', info:lang === 'en' ? 'Suspended or missing license → denied.' : lang === 'ja' ? '一時停止中またはライセンスがない場合 → 拒否。' : 'Lisensi suspended, tidak ada, atau akun non-active → ditolak.' },
      { id:'c', cx:165,cy:334,w:200,h:42, kind:'sys',  label:lang === 'en' ? 'Authorization Code' : lang === 'ja' ? '認証コード' : 'Authorization Code', sub:lang === 'en' ? 'One-time · ~1 min' : lang === 'ja' ? '使い捨て · 約1分' : 'Sekali pakai · ~1 menit', info:lang === 'en' ? 'Code hashed in DB. Bound to client and PKCE.' : lang === 'ja' ? 'コードはDBにハッシュ化されます。クライアントとPKCEにバインドされます。' : 'Code-hash disimpan di DB. Terikat pada client, redirect URI, dan PKCE.' },
      { id:'x', cx:545,cy:334,w:175,h:42, kind:'fail', label:lang === 'en' ? 'Access Denied' : lang === 'ja' ? 'アクセス拒否' : 'Akses Ditolak', sub:'403 license_inactive', info:lang === 'en' ? 'No token issued. SaaS shows error.' : lang === 'ja' ? 'トークンは発行されません。SaaSはエラーを表示します。' : 'Token tidak diterbitkan. SaaS menampilkan pesan error yang sesuai.' },
      { id:'t', cx:165,cy:410,w:200,h:42, kind:'sys',  label:lang === 'en' ? 'Token Exchange' : lang === 'ja' ? 'トークン交換' : 'Token Exchange', sub:'POST /oauth/token', info:lang === 'en' ? 'Code exchanged for access + refresh token.' : lang === 'ja' ? 'アクセスおよびリフレッシュトークンと交換されるコード。' : 'Code ditukar dengan access token + refresh token. Code langsung di-mark used.' },
      { id:'j', cx:165,cy:486,w:200,h:42, kind:'ok',   label:'JWT RS256 ✓', sub:lang === 'en' ? 'Valid for 1 hour' : lang === 'ja' ? '1時間有効' : 'Berlaku 1 jam', info:lang === 'en' ? 'Claims: member_id, license_key. Verified via JWKS.' : lang === 'ja' ? 'クレーム：member_id、license_key。JWKS経由で検証。' : 'Claim: member_id, email, license_key, tier, product. SaaS verifikasi via JWKS.' },
      { id:'ac',cx:165,cy:542,w:200,h:42, kind:'pill', label:lang === 'en' ? '🎉 App Access' : lang === 'ja' ? '🎉 アプリアクセス' : '🎉 Akses Produk', info:lang === 'en' ? 'User accesses SaaS smoothly.' : lang === 'ja' ? 'ユーザーはスムーズにSaaSにアクセスします。' : 'Member menggunakan SaaS tanpa login ulang. Refresh token dapat memperbarui akses.' },
    ],
    edges: [
      { pts:[[350,47],[350,75]] },
      { pts:[[350,117],[350,145]] },
      { pts:[[350,187],[350,221]] },
      { pts:[[350,263],[350,308],[165,308],[165,313]], label:lang === 'en' ? 'Yes' : lang === 'ja' ? 'はい' : 'Ya', lx:238, ly:303 },
      { pts:[[350,263],[350,308],[545,308],[545,313]], label:lang === 'en' ? 'No' : lang === 'ja' ? 'いいえ' : 'Tidak', lx:455, ly:303 },
      { pts:[[165,355],[165,389]] },
      { pts:[[165,431],[165,465]] },
      { pts:[[165,507],[165,521]] },
    ],
  },

  /* ── 4. LIFECYCLE LISENSI ────────────────────────────────── */
  {
    id: 'lc', emoji: '🔄', title: lang === 'ja' ? 'ライフサイクル' : 'Lifecycle',
    vb: '0 0 720 530',
    nodes: [
      { id:'a', cx:360,cy:30, w:220,h:44, kind:'ok',   label:lang === 'en' ? 'License ACTIVE' : lang === 'ja' ? 'ライセンス アクティブ' : 'Lisensi AKTIF', sub:'active / active_free', info:lang === 'en' ? 'License normal. Free Forever never expires.' : lang === 'ja' ? 'ライセンスは正常です。Free Foreverの期限は切れません。' : 'Lisensi berjalan normal. SSO bisa diterbitkan. Free Forever tidak punya expiry.' },
      { id:'q', cx:360,cy:114,w:230,h:42, kind:'dec',  label:lang === 'en' ? 'expired_at reached?' : lang === 'ja' ? 'expired_at に到達？' : 'expired_at tercapai?', info:lang === 'en' ? 'Job scheduler checks daily.' : lang === 'ja' ? 'ジョブスケジューラが毎日チェックします。' : 'Job scheduler berjalan setiap hari untuk memeriksa lisensi yang mendekati expired. Free Forever tidak terpengaruh.' },
      { id:'g', cx:360,cy:210,w:230,h:44, kind:'warn', label:lang === 'en' ? 'Grace Period ⏳' : lang === 'ja' ? '猶予期間 ⏳' : 'Grace Period ⏳', sub:lang === 'en' ? '7 days left · access works' : lang === 'ja' ? '残り7日 · アクセス可能' : '7 hari tersisa · akses masih jalan', info:lang === 'en' ? 'SSO still works. Reminder emails sent.' : lang === 'ja' ? 'SSOはまだ機能します。リマインダーメールが送信されます。' : 'Akses SSO masih berjalan selama grace period. Hub mengirim email pengingat. Banner peringatan tampil di dashboard.' },
      { id:'p', cx:360,cy:300,w:210,h:42, kind:'dec',  label:lang === 'en' ? 'Renewed before end?' : lang === 'ja' ? '終了前に更新？' : 'Diperpanjang sebelum habis?', info:lang === 'en' ? 'Member creates new checkout before grace period ends.' : lang === 'ja' ? 'メンバーは猶予期間が終了する前に新しいチェックアウトを作成します。' : 'Member melakukan checkout baru sebelum grace period berakhir.' },
      { id:'r', cx:155,cy:394,w:190,h:44, kind:'ok',   label:lang === 'en' ? 'Active Again ✓' : lang === 'ja' ? '再びアクティブに ✓' : 'Kembali Aktif ✓', sub:lang === 'en' ? 'expiry recalculated' : lang === 'ja' ? '有効期限を再計算' : 'expiry dihitung ulang', info:lang === 'en' ? 'Status active. License-ID unchanged.' : lang === 'ja' ? 'ステータスがアクティブです。License-IDは変更されません。' : 'Lisensi kembali ke status active. License-ID tetap sama.' },
      { id:'s', cx:560,cy:394,w:185,h:44, kind:'fail', label:lang === 'en' ? 'Suspended ✕' : lang === 'ja' ? '一時停止 ✕' : 'Suspended ✕', sub:lang === 'en' ? 'SSO Blocked' : lang === 'ja' ? 'SSO ブロック' : 'Akses & SSO diblokir', info:lang === 'en' ? 'SSO rejects new tokens.' : lang === 'ja' ? 'SSOは新しいトークンを拒否します。' : 'SSO menolak token baru. Access token yang sudah ada tetap valid hingga exp-nya habis.' },
      { id:'ad',cx:560,cy:478,w:185,h:42, kind:'sys',  label:lang === 'en' ? 'Admin reactivates' : lang === 'ja' ? '管理者が再有効化' : 'Admin reaktifkan', sub:lang === 'en' ? 'or member pays bill' : lang === 'ja' ? 'またはメンバーが請求書を支払う' : 'atau member bayar tagihan', info:lang === 'en' ? 'Super Admin can reactivate manually.' : lang === 'ja' ? 'スーパー管理者は手動で再有効化できます。' : 'Super Admin dapat mengaktifkan kembali lisensi secara manual melalui dashboard admin.' },
    ],
    edges: [
      { pts:[[360,52],[360,93]] },
      { pts:[[360,135],[360,188]], label:lang === 'en' ? 'Yes → paid' : lang === 'ja' ? 'はい → 有料' : 'Ya → paid license', lx:370, ly:158 },
      { pts:[[360,232],[360,279]] },
      { pts:[[360,321],[360,364],[155,364],[155,372]], label:lang === 'en' ? 'Yes' : lang === 'ja' ? 'はい' : 'Ya', lx:234, ly:358 },
      { pts:[[360,321],[360,364],[560,364],[560,372]], label:lang === 'en' ? 'No' : lang === 'ja' ? 'いいえ' : 'Tidak', lx:468, ly:358 },
      { pts:[[155,416],[155,460],[295,460]], back:true, label:lang === 'en' ? '↑ loop to active' : lang === 'ja' ? '↑ アクティブにループ' : '↑ loop ke aktif', lx:80, ly:440 },
      { pts:[[560,438],[560,457]] },
      { pts:[[490,460],[295,460]], label:undefined },
    ],
  },
]

/* ── SVG Node renderer ─────────────────────────────────────── */
function SvgNode({ n, active, onClick }: { n: N; active: boolean; onClick: () => void }) {
  const s = STYLE[n.kind]
  const rx = n.kind === 'pill' ? 20 : 8
  const hasGlow = active
  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={n.label}
    >
      {hasGlow && (
        <rect
          x={n.cx - n.w / 2 - 4} y={n.cy - n.h / 2 - 4}
          width={n.w + 8} height={n.h + 8}
          rx={rx + 2} fill="none"
          stroke={s.stroke} strokeWidth={1.5}
          opacity={0.3}
        />
      )}
      <rect
        x={n.cx - n.w / 2} y={n.cy - n.h / 2}
        width={n.w} height={n.h} rx={rx}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={active ? 1.5 : 1}
      />
      <text
        x={n.cx} y={n.cy - (n.sub ? 6 : 0)}
        textAnchor="middle" dominantBaseline="middle"
        fill={s.text} fontSize={12} fontWeight={600}
        fontFamily="Inter, sans-serif"
      >
        {n.label}
      </text>
      {n.sub && (
        <text
          x={n.cx} y={n.cy + 11}
          textAnchor="middle" dominantBaseline="middle"
          fill={s.sub} fontSize={10} fontFamily="Inter, sans-serif"
        >
          {n.sub}
        </text>
      )}
    </g>
  )
}

/* ── SVG Edge renderer ─────────────────────────────────────── */
function SvgEdge({ e }: { e: E }) {
  const pts = e.pts.map(([x, y]) => `${x},${y}`).join(' ')
  const color = e.back ? 'var(--dim)' : 'var(--muted)'
  const last = e.pts[e.pts.length - 1]
  const prev = e.pts[e.pts.length - 2]
  // compute arrow direction
  const dx = last[0] - prev[0], dy = last[1] - prev[1]
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len, uy = dy / len
  const ax = last[0] - ux * 10, ay = last[1] - uy * 10
  const perp = 4
  const arrow = `M ${last[0]},${last[1]} L ${ax - uy * perp},${ay + ux * perp} L ${ax + uy * perp},${ay - ux * perp} Z`

  return (
    <g>
      <polyline
        points={pts}
        fill="none" stroke={color}
        strokeWidth={1.2}
        strokeDasharray={e.back ? '4 3' : undefined}
      />
      <path d={arrow} fill={color} />
      {e.label && e.lx != null && e.ly != null && (
        <text
          x={e.lx} y={e.ly}
          textAnchor="middle"
          fill="var(--dim)" fontSize={10}
          fontFamily="Inter, sans-serif"
        >
          {e.label}
        </text>
      )}
    </g>
  )
}

/* ── Main component ────────────────────────────────────────── */
export function FlowDiagram({ lang = 'id', defaultTab = 0 }: { lang?: string, defaultTab?: number }) {
  const isEn = lang === 'en'
  const [tab, setTab] = useState(defaultTab)
  const [active, setActive] = useState<string | null>(null)
  const flowData = getFlows(lang)
  const flow = flowData[tab]
  const activeNode = flow.nodes.find(n => n.id === active)

  const handleTabChange = (i: number) => { setTab(i); setActive(null) }

  return (
    <section className="fd-wrap" aria-labelledby="fd-heading">
      <div className="fd-header">
        <div>
          <span className="eyebrow">{lang === 'en' ? 'Interactive Flow Diagram' : lang === 'ja' ? 'インタラクティブフロー図' : 'Diagram Alur Interaktif'}</span>
          <h2 id="fd-heading">{lang === 'en' ? 'Membership System Visualization' : lang === 'ja' ? 'メンバーシップシステムの可視化' : 'Visualisasi Sistem Membership'}</h2>
          <p>{lang === 'en' ? 'Click a node to view technical details of each stage.' : lang === 'ja' ? '各段階の技術的な詳細を見るには、ノードをクリックしてください。' : 'Klik node untuk melihat detail teknis setiap tahap.'}</p>
        </div>
        <nav className="fd-tabs" role="tablist">
          {flowData.map((f, i) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={tab === i}
              className={`fd-tab${tab === i ? ' active' : ''}`}
              onClick={() => handleTabChange(i)}
            >
              <span>{f.emoji}</span> {lang === 'en' ? (i === 0 ? 'Registration' : i === 1 ? 'Activation' : i === 2 ? 'SSO Login' : 'Lifecycle') : lang === 'ja' ? (i === 0 ? '登録' : i === 1 ? 'アクティベーション' : i === 2 ? 'SSO ログイン' : 'ライフサイクル') : f.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="fd-body">
        <div className="fd-svg-wrap">
          <svg
            viewBox={flow.vb}
            width="100%"
            style={{ overflow: 'visible', display: 'block' }}
            aria-label={`Diagram alur ${flow.title}`}
          >
            {/* Edges first (behind nodes) */}
            {flow.edges.map((e, i) => <SvgEdge key={i} e={e} />)}
            {/* Nodes */}
            {flow.nodes.map(n => (
              <SvgNode
                key={n.id} n={n}
                active={active === n.id}
                onClick={() => setActive(active === n.id ? null : n.id)}
              />
            ))}
          </svg>
        </div>

        <aside className="fd-info">
          {activeNode ? (
            <>
              <div className="fd-info-badge" data-kind={activeNode.kind}>
                {activeNode.kind === 'ok' ? (lang === 'en' ? '✓ Success' : lang === 'ja' ? '✓ 成功' : '✓ Sukses')
                  : activeNode.kind === 'fail' ? (lang === 'en' ? '✕ Error' : lang === 'ja' ? '✕ エラー' : '✕ Error')
                  : activeNode.kind === 'warn' ? (lang === 'en' ? '⚠ Warning' : lang === 'ja' ? '⚠ 警告' : '⚠ Peringatan')
                  : activeNode.kind === 'dec' ? (lang === 'en' ? '◆ Decision' : lang === 'ja' ? '◆ 決定' : '◆ Keputusan')
                  : activeNode.kind === 'sys' ? (lang === 'en' ? '⚙ System' : lang === 'ja' ? '⚙ システム' : '⚙ Sistem')
                  : activeNode.kind === 'pill' ? '● Start / End'
                  : (lang === 'en' ? '→ Process' : lang === 'ja' ? '→ プロセス' : '→ Proses')}
              </div>
              <h3>{activeNode.label}</h3>
              {activeNode.sub && <p className="fd-info-sub">{activeNode.sub}</p>}
              <p className="fd-info-desc">{activeNode.info ?? (lang === 'en' ? 'No additional details.' : lang === 'ja' ? '追加の詳細はありません。' : 'Tidak ada keterangan tambahan.')}</p>
            </>
          ) : (
            <div className="fd-info-empty">
              <span>👆</span>
              <p>{lang === 'en' ? 'Click any node to view its technical explanation.' : lang === 'ja' ? 'ノードをクリックして技術的な説明を表示します。' : 'Klik salah satu node untuk melihat penjelasan teknisnya.'}</p>
            </div>
          )}

          <div className="fd-legend">
            <p>{lang === 'en' ? 'Color Legend:' : lang === 'ja' ? '色の凡例:' : 'Keterangan warna:'}</p>
            {([
              ['ok',   lang === 'en' ? 'Success' : lang === 'ja' ? '成功' : 'Berhasil'],
              ['warn', lang === 'en' ? 'Warning' : lang === 'ja' ? '警告' : 'Peringatan'],
              ['fail', lang === 'en' ? 'Error / Blocked' : lang === 'ja' ? 'エラー / ブロック' : 'Error / Blokir'],
              ['sys',  lang === 'en' ? 'System Action' : lang === 'ja' ? 'システムアクション' : 'Aksi Sistem'],
              ['dec',  lang === 'en' ? 'Decision' : lang === 'ja' ? '決定' : 'Keputusan'],
              ['step', lang === 'en' ? 'Process' : lang === 'ja' ? 'プロセス' : 'Proses'],
            ] as [Kind, string][]).map(([k, label]) => (
              <div key={k} className="fd-legend-item">
                <span className="fd-dot" data-kind={k} />
                {label}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
