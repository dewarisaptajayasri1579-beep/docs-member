'use client'
import { useState } from 'react'

/* ── Types ─────────────────────────────────────────────────── */
type Kind = 'admin' | 'member' | 'guest' | 'sys' | 'ok' | 'fail' | 'warn'

interface N {
  id: string; cx: number; cy: number; w: number; h: number
  kind: Kind; label: string; sub?: string; info?: string
}
interface E {
  pts: number[][]; label?: string; lx?: number; ly?: number; back?: boolean
}
interface TabFlow {
  id: string; emoji: string; title: string
  vb: string; nodes: N[]; edges: E[]
}

/* ── Palette ───────────────────────────────────────────────── */
const STYLE: Record<Kind, { fill: string; stroke: string; text: string; sub: string }> = {
  admin:  { fill: '#2a1a00', stroke: '#f59e0b', text: '#fcd34d', sub: '#b8882a' },
  member: { fill: '#1a1430', stroke: '#a78bfa', text: '#a78bfa', sub: '#7c6dc4' },
  guest:  { fill: '#181820', stroke: '#3a3a50', text: '#f0eeff', sub: '#8886a4' },
  sys:    { fill: '#0f172a', stroke: '#3b82f6', text: '#93c5fd', sub: '#5e8ab4' },
  ok:     { fill: '#052e1a', stroke: '#10b981', text: '#6ee7b7', sub: '#2d8a5e' },
  warn:   { fill: '#2a1a00', stroke: '#f59e0b', text: '#fcd34d', sub: '#b8882a' },
  fail:   { fill: '#2a0a0a', stroke: '#ef4444', text: '#fca5a5', sub: '#b83434' },
}

/* ── Flow data ─────────────────────────────────────────────── */
const getFlows = (lang: string): TabFlow[] => [
  /* ── 1. HIERARKI ─────────────────────────────────────────── */
  {
    id: 'hier', emoji: '👥', title: lang === 'en' ? 'Role Hierarchy' : lang === 'ja' ? 'ロール階層' : 'Hierarki Role',
    vb: '0 0 700 420',
    nodes: [
      { id: 'g', cx: 350, cy: 40, w: 220, h: 42, kind: 'guest', label: lang === 'en' ? 'Guest (Unregistered)' : lang === 'ja' ? 'ゲスト（未登録）' : 'Guest (Unregistered)', info: lang === 'en' ? 'Can only see public pages like SaaS product catalog and registration.' : lang === 'ja' ? 'SaaS製品カタログや登録などの公開ページのみを表示できます。' : 'Hanya dapat melihat halaman publik seperti katalog produk SaaS dan halaman registrasi.' },
      { id: 'u', cx: 350, cy: 120, w: 220, h: 42, kind: 'guest', label: lang === 'en' ? 'Unverified Member' : lang === 'ja' ? '未確認メンバー' : 'Unverified Member', info: lang === 'en' ? 'Registered user but email not yet verified. Cannot login.' : lang === 'ja' ? '登録済みですが、メールが未確認です。ログインできません。' : 'Pengguna yang sudah mendaftar tetapi belum verifikasi email. Belum bisa login.' },
      { id: 'm', cx: 350, cy: 220, w: 260, h: 46, kind: 'member', label: lang === 'en' ? 'Member (Active)' : lang === 'ja' ? 'メンバー（アクティブ）' : 'Member (Active)', sub: lang === 'en' ? 'Data Owner' : lang === 'ja' ? 'データ所有者' : 'Pemilik Data', info: lang === 'en' ? 'Can manage profile, checkout plans, activate products, and SSO login to SaaS apps.' : lang === 'ja' ? 'プロファイルの管理、プランのチェックアウト、製品のアクティブ化、SaaSアプリへのSSOログインが可能です。' : 'Dapat mengelola profil, checkout paket, aktivasi produk, dan login SSO ke aplikasi SaaS.' },
      { id: 'a', cx: 350, cy: 340, w: 260, h: 46, kind: 'admin', label: lang === 'en' ? 'Super Admin' : lang === 'ja' ? 'スーパー管理者' : 'Super Admin', sub: lang === 'en' ? 'Platform Manager' : lang === 'ja' ? 'プラットフォームマネージャー' : 'Pengelola Platform', info: lang === 'en' ? 'Can manage products, plans, view all transactions, and manually suspend members.' : lang === 'ja' ? '製品やプランの管理、すべてのトランザクションの表示、メンバーの手動一時停止が可能です。' : 'Dapat mengelola produk, paket, melihat semua transaksi, dan mengaktifkan/menangguhkan member manual.' },
      { id: 'sy',cx: 120, cy: 220, w: 140, h: 46, kind: 'sys', label: lang === 'en' ? 'System Backend' : lang === 'ja' ? 'システムバックエンド' : 'System Backend', sub: lang === 'en' ? 'Automation' : lang === 'ja' ? '自動化' : 'Otomasi', info: lang === 'en' ? 'Receives payment callbacks, issues JWTs, calculates expiry. No UI.' : lang === 'ja' ? '支払いコールバックの受信、JWTの発行、有効期限の計算を行います。UIはありません。' : 'Menerima callback payment, menerbitkan JWT, dan menghitung expiry. Tidak punya UI.' },
      { id: 'sa',cx: 580, cy: 220, w: 140, h: 46, kind: 'sys', label: lang === 'en' ? 'SaaS App' : lang === 'ja' ? 'SaaSアプリ' : 'SaaS App', sub: lang === 'en' ? 'SSO Target' : lang === 'ja' ? 'SSOターゲット' : 'Target SSO', info: lang === 'en' ? 'External application receiving logins from Member via Hub.' : lang === 'ja' ? 'Hub経由でメンバーからのログインを受け取る外部アプリケーション。' : 'Aplikasi eksternal yang menerima login dari Member melalui Hub.' },
    ],
    edges: [
      { pts: [[350, 61], [350, 99]], label: lang === 'en' ? 'Register' : lang === 'ja' ? '登録' : 'Register', lx: 385, ly: 84 },
      { pts: [[350, 141], [350, 197]], label: lang === 'en' ? 'Verify Email' : lang === 'ja' ? 'メール確認' : 'Verify Email', lx: 395, ly: 174 },
      { pts: [[350, 243], [350, 317]], label: lang === 'en' ? 'Promote/Manage' : lang === 'ja' ? '昇格/管理' : 'Promote/Manage', lx: 405, ly: 284, back: true },
      { pts: [[480, 220], [510, 220]], label: lang === 'en' ? 'SSO Login' : lang === 'ja' ? 'SSOログイン' : 'SSO Login', lx: 495, ly: 210 },
      { pts: [[480, 340], [580, 340], [580, 243]], label: lang === 'en' ? 'Manage Integration' : lang === 'ja' ? '統合を管理' : 'Kelola Integrasi', lx: 630, ly: 300, back: true },
      { pts: [[220, 220], [190, 220]], label: lang === 'en' ? 'Automate' : lang === 'ja' ? '自動化' : 'Automate', lx: 205, ly: 210, back: true },
    ],
  },
  
  /* ── 2. IZIN & BATASAN ───────────────────────────────────── */
  {
    id: 'perm', emoji: '🛡️', title: lang === 'en' ? 'Access Matrix' : lang === 'ja' ? 'アクセスマトリックス' : 'Matriks Akses',
    vb: '0 0 720 480',
    nodes: [
      { id: 'rm', cx: 160, cy: 80,  w: 180, h: 42, kind: 'member', label: lang === 'en' ? 'Member Role' : lang === 'ja' ? 'メンバーロール' : 'Member Role', info: lang === 'en' ? 'Can only access their own data.' : lang === 'ja' ? '自分のデータにのみアクセスできます。' : 'Hanya bisa mengakses datanya sendiri.' },
      { id: 'ra', cx: 560, cy: 80,  w: 180, h: 42, kind: 'admin',  label: lang === 'en' ? 'Admin Role' : lang === 'ja' ? '管理者ロール' : 'Admin Role', info: lang === 'en' ? 'Full access to platform configuration.' : lang === 'ja' ? 'プラットフォーム構成へのフルアクセス。' : 'Akses penuh ke konfigurasi platform.' },
      
      { id: 'p1', cx: 360, cy: 160, w: 260, h: 36, kind: 'ok',   label: lang === 'en' ? '✓ Edit Profile & Password' : lang === 'ja' ? '✓ プロファイルとパスワードの編集' : '✓ Ubah Profil & Password', info: lang === 'en' ? 'Member can ONLY edit own profile. Admin CAN edit member profile.' : lang === 'ja' ? 'メンバーは自分のプロファイルのみを編集できます。管理者はメンバーのプロファイルを編集できます。' : 'Member HANYA bisa mengubah profil sendiri. Admin BISA mengubah profil member.' },
      { id: 'p2', cx: 360, cy: 210, w: 260, h: 36, kind: 'ok',   label: lang === 'en' ? '✓ View Own License-ID' : lang === 'ja' ? '✓ 自分のLicense-IDを表示' : '✓ Lihat License-ID Sendiri', info: lang === 'en' ? 'Member can view their own license secret key.' : lang === 'ja' ? 'メンバーは自分のライセンスシークレットキーを表示できます。' : 'Member dapat melihat secret key lisensinya sendiri.' },
      { id: 'p3', cx: 360, cy: 260, w: 260, h: 36, kind: 'fail', label: lang === 'en' ? '✕ View Other License-ID' : lang === 'ja' ? '✕ 他人のLicense-IDを表示' : '✕ Lihat License-ID Orang Lain', info: lang === 'en' ? 'Data Ownership: Member cannot view other members data.' : lang === 'ja' ? 'データの所有権：メンバーは他のメンバーのデータを表示できません。' : 'Data Ownership: Member tidak bisa melihat data member lain.' },
      { id: 'p4', cx: 360, cy: 310, w: 260, h: 36, kind: 'sys',  label: lang === 'en' ? '⚙ Manage Products & Plans' : lang === 'ja' ? '⚙ 製品とプランの管理' : '⚙ Kelola Produk & Paket', info: lang === 'en' ? 'Only Admin can create and change SaaS product prices.' : lang === 'ja' ? '管理者のみがSaaS製品の価格を作成および変更できます。' : 'Hanya Admin yang dapat membuat dan mengubah harga produk SaaS.' },
      { id: 'p5', cx: 360, cy: 360, w: 260, h: 36, kind: 'warn', label: lang === 'en' ? '⚠ Suspend Member' : lang === 'ja' ? '⚠ メンバーを一時停止' : '⚠ Suspend Member Manual', info: lang === 'en' ? 'Admin can block member access if terms are violated.' : lang === 'ja' ? '規約に違反した場合、管理者はメンバーのアクセスをブロックできます。' : 'Admin dapat memblokir akses member jika melanggar ketentuan.' },
      { id: 'p6', cx: 360, cy: 410, w: 260, h: 36, kind: 'fail', label: lang === 'en' ? '✕ View User Password' : lang === 'ja' ? '✕ ユーザーパスワードを表示' : '✕ Lihat Password User', info: lang === 'en' ? 'Even Admin cannot see member password (hashed with Argon2).' : lang === 'ja' ? '管理者でもメンバーのパスワードを見ることはできません（Argon2でハッシュ化）。' : 'Bahkan Admin tidak bisa melihat password member (di-hash dengan Argon2).' },
    ],
    edges: [
      { pts: [[160, 101], [160, 160], [230, 160]] },
      { pts: [[160, 160], [160, 210], [230, 210]] },
      { pts: [[160, 210], [160, 260], [230, 260]], back: true },
      
      { pts: [[560, 101], [560, 160], [490, 160]] },
      { pts: [[560, 160], [560, 310], [490, 310]] },
      { pts: [[560, 310], [560, 360], [490, 360]] },
      { pts: [[560, 360], [560, 410], [490, 410]], back: true },
    ],
  },

  /* ── 3. LIFECYCLE AKUN ───────────────────────────────────── */
  {
    id: 'life', emoji: '🔄', title: lang === 'en' ? 'Account Lifecycle' : lang === 'ja' ? 'アカウントライフサイクル' : 'Siklus Akun',
    vb: '0 0 700 460',
    nodes: [
      { id: 'r', cx: 350, cy: 40,  w: 200, h: 42, kind: 'guest',  label: lang === 'en' ? 'Registered' : lang === 'ja' ? '登録済み' : 'Registered', info: lang === 'en' ? 'POST /api/v1/auth/register called.' : lang === 'ja' ? 'POST /api/v1/auth/register が呼び出されました。' : 'POST /api/v1/auth/register dipanggil.' },
      { id: 'v', cx: 350, cy: 120, w: 200, h: 42, kind: 'sys',    label: lang === 'en' ? 'Email Verification' : lang === 'ja' ? 'メール確認' : 'Email Verification', sub: lang === 'en' ? 'Token Exp: 24h' : lang === 'ja' ? 'トークン期限: 24時間' : 'Token Exp: 24 jam', info: lang === 'en' ? 'Waiting for verification link click.' : lang === 'ja' ? '確認リンクのクリックを待っています。' : 'Menunggu klik tautan verifikasi.' },
      { id: 'a', cx: 350, cy: 220, w: 240, h: 46, kind: 'member', label: lang === 'en' ? 'Active Member' : lang === 'ja' ? 'アクティブメンバー' : 'Active Member', sub: lang === 'en' ? 'Status: active' : lang === 'ja' ? 'ステータス: アクティブ' : 'Status: active', info: lang === 'en' ? 'Ready to checkout and SSO login.' : lang === 'ja' ? 'チェックアウトとSSOログインの準備完了。' : 'Siap melakukan checkout dan login SSO.' },
      { id: 'w', cx: 160, cy: 320, w: 200, h: 42, kind: 'warn',   label: lang === 'en' ? 'Violation Detected' : lang === 'ja' ? '違反を検出' : 'Violation Detected', info: lang === 'en' ? 'ToS violation or system abuse.' : lang === 'ja' ? '利用規約違反またはシステムの悪用。' : 'Pelanggaran ToS atau abuse sistem.' },
      { id: 's', cx: 350, cy: 400, w: 200, h: 46, kind: 'fail',   label: lang === 'en' ? 'Suspended' : lang === 'ja' ? '一時停止' : 'Suspended', sub: lang === 'en' ? 'SSO access denied' : lang === 'ja' ? 'SSOアクセス拒否' : 'Akses SSO ditolak', info: lang === 'en' ? 'Admin blocks member. All active sessions terminated.' : lang === 'ja' ? '管理者がメンバーをブロックします。すべてのアクティブなセッションが終了します。' : 'Admin memblokir member. Semua sesi aktif digugurkan.' },
      { id: 'x', cx: 540, cy: 320, w: 200, h: 42, kind: 'ok',     label: lang === 'en' ? 'Admin Review' : lang === 'ja' ? '管理者レビュー' : 'Admin Review', info: lang === 'en' ? 'Admin reviews account.' : lang === 'ja' ? '管理者がアカウントを確認します。' : 'Admin meninjau akun.' },
    ],
    edges: [
      { pts: [[350, 61], [350, 99]] },
      { pts: [[350, 141], [350, 197]], label: lang === 'en' ? 'Click Link' : lang === 'ja' ? 'リンクをクリック' : 'Klik Tautan', lx: 390, ly: 175 },
      { pts: [[350, 243], [350, 320], [260, 320]] },
      { pts: [[160, 341], [160, 400], [250, 400]], label: lang === 'en' ? 'Block' : lang === 'ja' ? 'ブロック' : 'Block', lx: 185, ly: 380 },
      { pts: [[450, 400], [540, 400], [540, 341]], label: lang === 'en' ? 'Appeal' : lang === 'ja' ? '申し立て' : 'Appeal', lx: 510, ly: 380 },
      { pts: [[540, 299], [540, 220], [470, 220]], label: lang === 'en' ? 'Unblock' : lang === 'ja' ? 'ブロック解除' : 'Unblock', lx: 510, ly: 250 },
      { pts: [[350, 141], [480, 141], [480, 40], [450, 40]], label: lang === 'en' ? 'Resend' : lang === 'ja' ? '再送' : 'Resend', lx: 450, ly: 130, back: true },
    ],
  }
]

/* ── SVG Renderers ─────────────────────────────────────────── */
function SvgNode({ n, active, onClick }: { n: N; active: boolean; onClick: () => void }) {
  const s = STYLE[n.kind]
  const rx = 8
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }} role="button">
      {active && <rect x={n.cx - n.w / 2 - 4} y={n.cy - n.h / 2 - 4} width={n.w + 8} height={n.h + 8} rx={rx + 2} fill="none" stroke={s.stroke} strokeWidth={1.5} opacity={0.3} />}
      <rect x={n.cx - n.w / 2} y={n.cy - n.h / 2} width={n.w} height={n.h} rx={rx} fill={s.fill} stroke={s.stroke} strokeWidth={active ? 1.5 : 1} />
      <text x={n.cx} y={n.cy - (n.sub ? 6 : 0)} textAnchor="middle" dominantBaseline="middle" fill={s.text} fontSize={12} fontWeight={600} fontFamily="Inter, sans-serif">{n.label}</text>
      {n.sub && <text x={n.cx} y={n.cy + 11} textAnchor="middle" dominantBaseline="middle" fill={s.sub} fontSize={10} fontFamily="Inter, sans-serif">{n.sub}</text>}
    </g>
  )
}

function SvgEdge({ e }: { e: E }) {
  const pts = e.pts.map(([x, y]) => `${x},${y}`).join(' ')
  const color = e.back ? 'var(--dim)' : 'var(--muted)'
  const last = e.pts[e.pts.length - 1], prev = e.pts[e.pts.length - 2]
  const dx = last[0] - prev[0], dy = last[1] - prev[1]
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len, uy = dy / len
  const ax = last[0] - ux * 8, ay = last[1] - uy * 8
  const arrow = `M ${last[0]},${last[1]} L ${ax - uy * 4},${ay + ux * 4} L ${ax + uy * 4},${ay - ux * 4} Z`
  return (
    <g>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.2} strokeDasharray={e.back ? '4 3' : undefined} />
      <path d={arrow} fill={color} />
      {e.label && <text x={e.lx} y={e.ly} textAnchor="middle" fill="var(--dim)" fontSize={10} fontFamily="Inter, sans-serif">{e.label}</text>}
    </g>
  )
}

/* ── Main Component ────────────────────────────────────────── */
export function RolesDiagram({ lang = 'id' }: { lang?: string }) {
  const isEn = lang === 'en'
  const [tab, setTab] = useState(0)
  const [active, setActive] = useState<string | null>(null)
  const flowData = getFlows(lang)
  const flow = flowData[tab]
  const activeNode = flow.nodes.find(n => n.id === active)

  const handleTab = (i: number) => { setTab(i); setActive(null) }

  return (
    <section className="fd-wrap">
      <div className="fd-header">
        <div>
          <span className="eyebrow">{lang === 'en' ? 'Access & Role Diagram' : lang === 'ja' ? 'アクセスとロール図' : 'Diagram Hak Akses & Peran'}</span>
          <h2>{lang === 'ja' ? 'ユーザーとロール' : 'Users & Roles'}</h2>
          <p>{lang === 'en' ? 'Click a node to view access details.' : lang === 'ja' ? 'アクセス詳細を表示するにはノードをクリックしてください。' : 'Klik node untuk melihat detail aturan akses.'}</p>
        </div>
        <nav className="fd-tabs">
          {flowData.map((f, i) => (
            <button key={f.id} className={`fd-tab${tab === i ? ' active' : ''}`} onClick={() => handleTab(i)}>
              <span>{f.emoji}</span> {lang === 'en' ? (i === 0 ? 'Role Hierarchy' : i === 1 ? 'Access Matrix' : 'Account Lifecycle') : lang === 'ja' ? (i === 0 ? 'ロール階層' : i === 1 ? 'アクセスマトリックス' : 'アカウントライフサイクル') : f.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="fd-body">
        <div className="fd-svg-wrap">
          <svg viewBox={flow.vb} width="100%" style={{ overflow: 'visible', display: 'block' }}>
            {flow.edges.map((e, i) => <SvgEdge key={i} e={e} />)}
            {flow.nodes.map(n => <SvgNode key={n.id} n={n} active={active === n.id} onClick={() => setActive(active === n.id ? null : n.id)} />)}
          </svg>
        </div>

        <aside className="fd-info">
          {activeNode ? (
            <>
              <div className="fd-info-badge" data-kind={activeNode.kind}>{activeNode.kind.toUpperCase()}</div>
              <h3>{activeNode.label}</h3>
              {activeNode.sub && <p className="fd-info-sub">{activeNode.sub}</p>}
              <p className="fd-info-desc">{activeNode.info}</p>
            </>
          ) : (
            <div className="fd-info-empty">
              <span>👆</span>
              <p>{lang === 'en' ? 'Click a role or node to view access limits.' : lang === 'ja' ? 'ロールまたはノードをクリックしてアクセス制限を表示します。' : 'Klik salah satu peran atau node untuk melihat batas hak akses.'}</p>
            </div>
          )}
          
          <div className="fd-legend">
            <p>{lang === 'en' ? 'Role Colors:' : lang === 'ja' ? 'ロールの色:' : 'Warna Peran:'}</p>
            <div className="fd-legend-item"><span className="fd-dot" data-kind="admin" /> {lang === 'en' ? 'Super Admin' : lang === 'ja' ? 'スーパー管理者' : 'Super Admin'}</div>
            <div className="fd-legend-item"><span className="fd-dot" data-kind="member" style={{ background: '#a78bfa' }} /> {lang === 'en' ? 'Member' : lang === 'ja' ? 'メンバー' : 'Member'} / {lang === 'en' ? 'Data Owner' : lang === 'ja' ? 'データ所有者' : 'Pemilik Data'}</div>
            <div className="fd-legend-item"><span className="fd-dot" data-kind="sys" /> {lang === 'en' ? 'System / Bot' : lang === 'ja' ? 'システム / ボット' : 'System / Bot'}</div>
          </div>
        </aside>
      </div>
    </section>
  )
}
