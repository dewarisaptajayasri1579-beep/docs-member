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
const getFlows = (isEn: boolean): Flow[] => [
  /* ── 1. REGISTRASI ───────────────────────────────────────── */
  {
    id: 'reg', emoji: '👤', title: isEn ? 'Registration' : 'Registrasi',
    vb: '0 0 680 548',
    nodes: [
      { id:'s', cx:340,cy:26, w:150,h:32, kind:'pill', label:isEn ? 'New User' : 'Pengguna Baru', info:isEn ? 'Potential member opens the platform for the first time.' : 'Calon member membuka platform untuk pertama kali.' },
      { id:'f', cx:340,cy:94, w:280,h:42, kind:'step', label:isEn ? 'Fill Registration Form' : 'Isi Form Registrasi', sub:'Name · Email · Password', info:isEn ? 'Validation: unique email, min 8 chars password. Inline errors.' : 'Validasi: email unik, password min. 8 karakter. Error inline per field.' },
      { id:'c', cx:340,cy:162,w:280,h:42, kind:'sys',  label:isEn ? 'Account Created (Unverified)' : 'Akun dibuat (unverified)', sub:'POST /api/v1/auth/register', info:isEn ? 'Password hashed with Argon2. Cannot login until email is verified.' : 'Password di-hash dengan Argon2. Akun belum bisa login sebelum email diverifikasi.' },
      { id:'e', cx:340,cy:230,w:280,h:42, kind:'sys',  label:isEn ? 'Verification Email Sent' : 'Email verifikasi dikirim', sub:'via BullMQ · expires 24h', info:isEn ? 'Email sent asynchronously. Unique token valid for 24 hours.' : 'Email dikirim secara async. Token unik hanya berlaku sekali dan 24 jam.' },
      { id:'k', cx:340,cy:298,w:280,h:42, kind:'step', label:isEn ? 'Click Verification Link' : 'Klik tautan verifikasi', info:isEn ? 'Member opens link in email. Token is verified on the server.' : 'Member membuka link di email. Token dicocokkan di server.' },
      { id:'v', cx:340,cy:374,w:280,h:42, kind:'dec',  label:isEn ? 'Token valid & unused?' : 'Token valid & belum dipakai?', info:isEn ? 'Checks if token exists, not used_at, and not expired.' : 'Pengecekan: token ada, belum used_at, belum expired.' },
      { id:'a', cx:170,cy:466,w:210,h:42, kind:'ok',   label:isEn ? 'Account ACTIVE ✓' : 'Akun AKTIF ✓', sub:'Status: active', info:isEn ? 'Member can login, activate products, and checkout.' : 'Member dapat login, aktivasi produk, dan checkout.' },
      { id:'r', cx:530,cy:466,w:185,h:42, kind:'warn', label:isEn ? 'Resend Email' : 'Kirim ulang email', sub:'Cooldown: 60 seconds', info:isEn ? 'Old token invalidated. New email sent via queue.' : 'Token lama diinvalidasi. Email baru dikirim via queue.' },
    ],
    edges: [
      { pts:[[340,42],[340,73]] },
      { pts:[[340,115],[340,141]] },
      { pts:[[340,183],[340,209]] },
      { pts:[[340,251],[340,277]] },
      { pts:[[340,319],[340,353]] },
      { pts:[[340,395],[340,436],[170,436],[170,445]], label:isEn ? 'Yes' : 'Ya', lx:240, ly:430 },
      { pts:[[340,395],[340,436],[530,436],[530,445]], label:isEn ? 'No' : 'Tidak', lx:442, ly:430 },
      { pts:[[530,487],[635,487],[635,219],[481,219]], label:isEn ? '↑ try again' : '↑ coba lagi', lx:635, ly:350, back:true },
    ],
  },

  /* ── 2. AKTIVASI LISENSI ─────────────────────────────────── */
  {
    id: 'act', emoji: '🔑', title: isEn ? 'Activation' : 'Aktivasi',
    vb: '0 0 820 570',
    nodes: [
      { id:'p', cx:410,cy:26, w:220,h:42, kind:'step', label:isEn ? 'Select Product' : 'Pilih Produk', sub:isEn ? 'from SaaS Catalog' : 'dari Katalog SaaS', info:isEn ? 'Only active products shown. Purchased products marked as "Active".' : 'Hanya produk aktif yang ditampilkan. Produk yang sudah diaktifkan ditandai "Sudah Aktif".' },
      { id:'t', cx:410,cy:96, w:220,h:42, kind:'step', label:isEn ? 'Select Plan' : 'Pilih Paket', info:isEn ? 'Free Forever, Pro Monthly, or Pro Yearly. Prices are snapshotted.' : 'Free Forever, Pro Monthly, atau Pro Yearly. Harga disimpan sebagai snapshot saat order dibuat.' },
      { id:'q', cx:410,cy:172,w:220,h:42, kind:'dec',  label:isEn ? 'Free Forever Plan?' : 'Paket Free Forever?', info:isEn ? 'Free plans skip payment and activate directly.' : 'Paket free tidak memerlukan pembayaran. Langsung dibuat tanpa order/payment.' },
      { id:'fa',cx:155,cy:270,w:200,h:42, kind:'sys',  label:isEn ? 'Direct Activation' : 'Aktivasi Langsung', sub:'POST /licenses/activate-free', info:isEn ? 'active_free license created. Unique License-ID generated.' : 'Lisensi active_free dibuat. License-ID unik di-generate dan dikirim via email.' },
      { id:'or',cx:655,cy:270,w:210,h:42, kind:'step', label:isEn ? 'Create Order' : 'Buat Order', sub:'Header: Idempotency-Key', info:isEn ? 'Idempotency key prevents duplicates. Status: pending_payment.' : 'Cek idempotency key mencegah order duplikat. Status: pending_payment.' },
      { id:'py',cx:655,cy:346,w:210,h:42, kind:'step', label:isEn ? 'Pay at Gateway' : 'Bayar di Gateway', sub:'Midtrans / Xendit', info:isEn ? 'User redirected to hosted payment page.' : 'Member diarahkan ke hosted payment page. Mendukung Transfer, GoPay, OVO, QRIS.' },
      { id:'wh',cx:655,cy:422,w:210,h:42, kind:'sys',  label:isEn ? 'Webhook Settlement' : 'Webhook Settlement', sub:isEn ? 'Validate signature + amount' : 'Validasi signature + amount', info:isEn ? 'Atomic: payment, order, license updated together.' : 'Atomik: payment, order, license, dan audit log berhasil bersama atau gagal bersama.' },
      { id:'li',cx:410,cy:524,w:240,h:44, kind:'ok',   label:isEn ? 'License ACTIVE ✓' : 'Lisensi AKTIF ✓', sub:'NTO-XXXX-XXXX-XXXX', info:isEn ? 'License-ID unchanged on renewal.' : 'License-ID tidak berubah saat renewal. Free = active_free, Paid = active.' },
    ],
    edges: [
      { pts:[[410,47],[410,75]] },
      { pts:[[410,117],[410,151]] },
      { pts:[[410,193],[410,232],[155,232],[155,249]], label:isEn ? 'Yes (Free)' : 'Ya (Free)', lx:256, ly:226 },
      { pts:[[410,193],[410,232],[655,232],[655,249]], label:isEn ? 'No (Paid)' : 'Tidak (Paid)', lx:540, ly:226 },
      { pts:[[655,291],[655,325]] },
      { pts:[[655,367],[655,401]] },
      { pts:[[155,291],[155,502],[290,502]] },
      { pts:[[655,443],[655,502],[531,502]] },
    ],
  },

  /* ── 3. SSO LOGIN ────────────────────────────────────────── */
  {
    id: 'sso', emoji: '🔐', title: isEn ? 'SSO Login' : 'SSO Login',
    vb: '0 0 700 580',
    nodes: [
      { id:'o', cx:350,cy:26, w:220,h:42, kind:'step', label:isEn ? 'Open SaaS App' : 'Buka Produk SaaS', info:isEn ? 'User clicks "Open App" from Hub dashboard.' : 'Member klik "Buka Aplikasi" dari dashboard Hub.' },
      { id:'a', cx:350,cy:96, w:240,h:42, kind:'sys',  label:isEn ? 'Redirect to /oauth' : 'Redirect ke /oauth/authorize', sub:'PKCE + state + scope', info:isEn ? 'Hub validates client_id and redirect_uri.' : 'SaaS mengirim code_challenge PKCE. Hub memvalidasi client_id dan redirect_uri.' },
      { id:'v', cx:350,cy:166,w:240,h:42, kind:'sys',  label:isEn ? 'Validate Session & License' : 'Hub validasi sesi & lisensi', info:isEn ? 'Check: active account and valid license.' : 'Cek: akun active, lisensi active/active_free/grace_period untuk produk ini.' },
      { id:'q', cx:350,cy:242,w:200,h:42, kind:'dec',  label:isEn ? 'Access Granted?' : 'Akses diizinkan?', info:isEn ? 'Suspended or missing license → denied.' : 'Lisensi suspended, tidak ada, atau akun non-active → ditolak.' },
      { id:'c', cx:165,cy:334,w:200,h:42, kind:'sys',  label:isEn ? 'Authorization Code' : 'Authorization Code', sub:isEn ? 'One-time · ~1 min' : 'Sekali pakai · ~1 menit', info:isEn ? 'Code hashed in DB. Bound to client and PKCE.' : 'Code-hash disimpan di DB. Terikat pada client, redirect URI, dan PKCE.' },
      { id:'x', cx:545,cy:334,w:175,h:42, kind:'fail', label:isEn ? 'Access Denied' : 'Akses Ditolak', sub:'403 license_inactive', info:isEn ? 'No token issued. SaaS shows error.' : 'Token tidak diterbitkan. SaaS menampilkan pesan error yang sesuai.' },
      { id:'t', cx:165,cy:410,w:200,h:42, kind:'sys',  label:isEn ? 'Token Exchange' : 'Token Exchange', sub:'POST /oauth/token', info:isEn ? 'Code exchanged for access + refresh token.' : 'Code ditukar dengan access token + refresh token. Code langsung di-mark used.' },
      { id:'j', cx:165,cy:486,w:200,h:42, kind:'ok',   label:'JWT RS256 ✓', sub:isEn ? 'Valid for 1 hour' : 'Berlaku 1 jam', info:isEn ? 'Claims: member_id, license_key. Verified via JWKS.' : 'Claim: member_id, email, license_key, tier, product. SaaS verifikasi via JWKS.' },
      { id:'ac',cx:165,cy:542,w:200,h:42, kind:'pill', label:isEn ? '🎉 App Access' : '🎉 Akses Produk', info:isEn ? 'User accesses SaaS smoothly.' : 'Member menggunakan SaaS tanpa login ulang. Refresh token dapat memperbarui akses.' },
    ],
    edges: [
      { pts:[[350,47],[350,75]] },
      { pts:[[350,117],[350,145]] },
      { pts:[[350,187],[350,221]] },
      { pts:[[350,263],[350,308],[165,308],[165,313]], label:isEn ? 'Yes' : 'Ya', lx:238, ly:303 },
      { pts:[[350,263],[350,308],[545,308],[545,313]], label:isEn ? 'No' : 'Tidak', lx:455, ly:303 },
      { pts:[[165,355],[165,389]] },
      { pts:[[165,431],[165,465]] },
      { pts:[[165,507],[165,521]] },
    ],
  },

  /* ── 4. LIFECYCLE LISENSI ────────────────────────────────── */
  {
    id: 'lc', emoji: '🔄', title: 'Lifecycle',
    vb: '0 0 720 530',
    nodes: [
      { id:'a', cx:360,cy:30, w:220,h:44, kind:'ok',   label:isEn ? 'License ACTIVE' : 'Lisensi AKTIF', sub:'active / active_free', info:isEn ? 'License normal. Free Forever never expires.' : 'Lisensi berjalan normal. SSO bisa diterbitkan. Free Forever tidak punya expiry.' },
      { id:'q', cx:360,cy:114,w:230,h:42, kind:'dec',  label:isEn ? 'expired_at reached?' : 'expired_at tercapai?', info:isEn ? 'Job scheduler checks daily.' : 'Job scheduler berjalan setiap hari untuk memeriksa lisensi yang mendekati expired. Free Forever tidak terpengaruh.' },
      { id:'g', cx:360,cy:210,w:230,h:44, kind:'warn', label:isEn ? 'Grace Period ⏳' : 'Grace Period ⏳', sub:isEn ? '7 days left · access works' : '7 hari tersisa · akses masih jalan', info:isEn ? 'SSO still works. Reminder emails sent.' : 'Akses SSO masih berjalan selama grace period. Hub mengirim email pengingat. Banner peringatan tampil di dashboard.' },
      { id:'p', cx:360,cy:300,w:210,h:42, kind:'dec',  label:isEn ? 'Renewed before end?' : 'Diperpanjang sebelum habis?', info:isEn ? 'Member creates new checkout before grace period ends.' : 'Member melakukan checkout baru sebelum grace period berakhir.' },
      { id:'r', cx:155,cy:394,w:190,h:44, kind:'ok',   label:isEn ? 'Active Again ✓' : 'Kembali Aktif ✓', sub:isEn ? 'expiry recalculated' : 'expiry dihitung ulang', info:isEn ? 'Status active. License-ID unchanged.' : 'Lisensi kembali ke status active. License-ID tetap sama.' },
      { id:'s', cx:560,cy:394,w:185,h:44, kind:'fail', label:isEn ? 'Suspended ✕' : 'Suspended ✕', sub:isEn ? 'SSO Blocked' : 'Akses & SSO diblokir', info:isEn ? 'SSO rejects new tokens.' : 'SSO menolak token baru. Access token yang sudah ada tetap valid hingga exp-nya habis.' },
      { id:'ad',cx:560,cy:478,w:185,h:42, kind:'sys',  label:isEn ? 'Admin reactivates' : 'Admin reaktifkan', sub:isEn ? 'or member pays bill' : 'atau member bayar tagihan', info:isEn ? 'Super Admin can reactivate manually.' : 'Super Admin dapat mengaktifkan kembali lisensi secara manual melalui dashboard admin.' },
    ],
    edges: [
      { pts:[[360,52],[360,93]] },
      { pts:[[360,135],[360,188]], label:isEn ? 'Yes → paid' : 'Ya → paid license', lx:370, ly:158 },
      { pts:[[360,232],[360,279]] },
      { pts:[[360,321],[360,364],[155,364],[155,372]], label:isEn ? 'Yes' : 'Ya', lx:234, ly:358 },
      { pts:[[360,321],[360,364],[560,364],[560,372]], label:isEn ? 'No' : 'Tidak', lx:468, ly:358 },
      { pts:[[155,416],[155,460],[295,460]], back:true, label:isEn ? '↑ loop to active' : '↑ loop ke aktif', lx:80, ly:440 },
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
export function FlowDiagram({ lang = 'id' }: { lang?: string }) {
  const isEn = lang === 'en'
  const [tab, setTab] = useState(0)
  const [active, setActive] = useState<string | null>(null)
  const flowData = getFlows(isEn)
  const flow = flowData[tab]
  const activeNode = flow.nodes.find(n => n.id === active)

  const handleTabChange = (i: number) => { setTab(i); setActive(null) }

  return (
    <section className="fd-wrap" aria-labelledby="fd-heading">
      <div className="fd-header">
        <div>
          <span className="eyebrow">{isEn ? 'Interactive Flow Diagram' : 'Diagram Alur Interaktif'}</span>
          <h2 id="fd-heading">{isEn ? 'Membership System Visualization' : 'Visualisasi Sistem Membership'}</h2>
          <p>{isEn ? 'Click a node to view technical details of each stage.' : 'Klik node untuk melihat detail teknis setiap tahap.'}</p>
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
              <span>{f.emoji}</span> {isEn ? (i === 0 ? 'Registration' : i === 1 ? 'Activation' : i === 2 ? 'SSO Login' : 'Lifecycle') : f.title}
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
                {activeNode.kind === 'ok' ? (isEn ? '✓ Success' : '✓ Sukses')
                  : activeNode.kind === 'fail' ? (isEn ? '✕ Error' : '✕ Error')
                  : activeNode.kind === 'warn' ? (isEn ? '⚠ Warning' : '⚠ Peringatan')
                  : activeNode.kind === 'dec' ? (isEn ? '◆ Decision' : '◆ Keputusan')
                  : activeNode.kind === 'sys' ? (isEn ? '⚙ System' : '⚙ Sistem')
                  : activeNode.kind === 'pill' ? '● Start / End'
                  : (isEn ? '→ Process' : '→ Proses')}
              </div>
              <h3>{activeNode.label}</h3>
              {activeNode.sub && <p className="fd-info-sub">{activeNode.sub}</p>}
              <p className="fd-info-desc">{activeNode.info ?? (isEn ? 'No additional details.' : 'Tidak ada keterangan tambahan.')}</p>
            </>
          ) : (
            <div className="fd-info-empty">
              <span>👆</span>
              <p>{isEn ? 'Click any node to view its technical explanation.' : 'Klik salah satu node untuk melihat penjelasan teknisnya.'}</p>
            </div>
          )}

          <div className="fd-legend">
            <p>{isEn ? 'Color Legend:' : 'Keterangan warna:'}</p>
            {([
              ['ok',   isEn ? 'Success' : 'Berhasil'],
              ['warn', isEn ? 'Warning' : 'Peringatan'],
              ['fail', isEn ? 'Error / Blocked' : 'Error / Blokir'],
              ['sys',  isEn ? 'System Action' : 'Aksi Sistem'],
              ['dec',  isEn ? 'Decision' : 'Keputusan'],
              ['step', isEn ? 'Process' : 'Proses'],
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
