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
const FLOWS: TabFlow[] = [
  /* ── 1. HIERARKI ─────────────────────────────────────────── */
  {
    id: 'hier', emoji: '👥', title: 'Hierarki Role',
    vb: '0 0 700 420',
    nodes: [
      { id: 'g', cx: 350, cy: 40, w: 220, h: 42, kind: 'guest', label: 'Guest (Unregistered)', info: 'Hanya dapat melihat halaman publik seperti katalog produk SaaS dan halaman registrasi.' },
      { id: 'u', cx: 350, cy: 120, w: 220, h: 42, kind: 'guest', label: 'Unverified Member', info: 'Pengguna yang sudah mendaftar tetapi belum verifikasi email. Belum bisa login.' },
      { id: 'm', cx: 350, cy: 220, w: 260, h: 46, kind: 'member', label: 'Member (Active)', sub: 'Pemilik Data', info: 'Dapat mengelola profil, checkout paket, aktivasi produk, dan login SSO ke aplikasi SaaS.' },
      { id: 'a', cx: 350, cy: 340, w: 260, h: 46, kind: 'admin', label: 'Super Admin', sub: 'Pengelola Platform', info: 'Dapat mengelola produk, paket, melihat semua transaksi, dan mengaktifkan/menangguhkan member manual.' },
      { id: 'sy',cx: 120, cy: 220, w: 140, h: 46, kind: 'sys', label: 'System Backend', sub: 'Otomasi', info: 'Menerima callback payment, menerbitkan JWT, dan menghitung expiry. Tidak punya UI.' },
      { id: 'sa',cx: 580, cy: 220, w: 140, h: 46, kind: 'sys', label: 'SaaS App', sub: 'Target SSO', info: 'Aplikasi eksternal yang menerima login dari Member melalui Hub.' },
    ],
    edges: [
      { pts: [[350, 61], [350, 99]], label: 'Register', lx: 385, ly: 84 },
      { pts: [[350, 141], [350, 197]], label: 'Verify Email', lx: 395, ly: 174 },
      { pts: [[350, 243], [350, 317]], label: 'Promote/Manage', lx: 405, ly: 284, back: true },
      { pts: [[480, 220], [510, 220]], label: 'SSO Login', lx: 495, ly: 210 },
      { pts: [[480, 340], [580, 340], [580, 243]], label: 'Kelola Integrasi', lx: 630, ly: 300, back: true },
      { pts: [[220, 220], [190, 220]], label: 'Automate', lx: 205, ly: 210, back: true },
    ],
  },
  
  /* ── 2. IZIN & BATASAN ───────────────────────────────────── */
  {
    id: 'perm', emoji: '🛡️', title: 'Matriks Akses',
    vb: '0 0 720 480',
    nodes: [
      { id: 'rm', cx: 160, cy: 80,  w: 180, h: 42, kind: 'member', label: 'Member Role', info: 'Hanya bisa mengakses datanya sendiri.' },
      { id: 'ra', cx: 560, cy: 80,  w: 180, h: 42, kind: 'admin',  label: 'Admin Role', info: 'Akses penuh ke konfigurasi platform.' },
      
      { id: 'p1', cx: 360, cy: 160, w: 260, h: 36, kind: 'ok',   label: '✓ Ubah Profil & Password', info: 'Member HANYA bisa mengubah profil sendiri. Admin BISA mengubah profil member.' },
      { id: 'p2', cx: 360, cy: 210, w: 260, h: 36, kind: 'ok',   label: '✓ Lihat License-ID Sendiri', info: 'Member dapat melihat secret key lisensinya sendiri.' },
      { id: 'p3', cx: 360, cy: 260, w: 260, h: 36, kind: 'fail', label: '✕ Lihat License-ID Orang Lain', info: 'Data Ownership: Member tidak bisa melihat data member lain.' },
      { id: 'p4', cx: 360, cy: 310, w: 260, h: 36, kind: 'sys',  label: '⚙ Kelola Produk & Paket', info: 'Hanya Admin yang dapat membuat dan mengubah harga produk SaaS.' },
      { id: 'p5', cx: 360, cy: 360, w: 260, h: 36, kind: 'warn', label: '⚠ Suspend Member Manual', info: 'Admin dapat memblokir akses member jika melanggar ketentuan.' },
      { id: 'p6', cx: 360, cy: 410, w: 260, h: 36, kind: 'fail', label: '✕ Lihat Password User', info: 'Bahkan Admin tidak bisa melihat password member (di-hash dengan Argon2).' },
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
    id: 'life', emoji: '🔄', title: 'Siklus Akun',
    vb: '0 0 700 460',
    nodes: [
      { id: 'r', cx: 350, cy: 40,  w: 200, h: 42, kind: 'guest',  label: 'Registered', info: 'POST /api/v1/auth/register dipanggil.' },
      { id: 'v', cx: 350, cy: 120, w: 200, h: 42, kind: 'sys',    label: 'Email Verification', sub: 'Token Exp: 24 jam', info: 'Menunggu klik tautan verifikasi.' },
      { id: 'a', cx: 350, cy: 220, w: 240, h: 46, kind: 'member', label: 'Active Member', sub: 'Status: active', info: 'Siap melakukan checkout dan login SSO.' },
      { id: 'w', cx: 160, cy: 320, w: 200, h: 42, kind: 'warn',   label: 'Violation Detected', info: 'Pelanggaran ToS atau abuse sistem.' },
      { id: 's', cx: 350, cy: 400, w: 200, h: 46, kind: 'fail',   label: 'Suspended', sub: 'Akses SSO ditolak', info: 'Admin memblokir member. Semua sesi aktif digugurkan.' },
      { id: 'x', cx: 540, cy: 320, w: 200, h: 42, kind: 'ok',     label: 'Admin Review', info: 'Admin meninjau akun.' },
    ],
    edges: [
      { pts: [[350, 61], [350, 99]] },
      { pts: [[350, 141], [350, 197]], label: 'Klik Tautan', lx: 390, ly: 175 },
      { pts: [[350, 243], [350, 320], [260, 320]] },
      { pts: [[160, 341], [160, 400], [250, 400]], label: 'Block', lx: 185, ly: 380 },
      { pts: [[450, 400], [540, 400], [540, 341]], label: 'Appeal', lx: 510, ly: 380 },
      { pts: [[540, 299], [540, 220], [470, 220]], label: 'Unblock', lx: 510, ly: 250 },
      { pts: [[350, 141], [480, 141], [480, 40], [450, 40]], label: 'Resend', lx: 450, ly: 130, back: true },
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
export function RolesDiagram() {
  const [tab, setTab] = useState(0)
  const [active, setActive] = useState<string | null>(null)
  const flow = FLOWS[tab]
  const activeNode = flow.nodes.find(n => n.id === active)

  const handleTab = (i: number) => { setTab(i); setActive(null) }

  return (
    <section className="fd-wrap">
      <div className="fd-header">
        <div>
          <span className="eyebrow">Diagram Hak Akses & Peran</span>
          <h2>Users & Roles</h2>
          <p>Klik node untuk melihat detail aturan akses.</p>
        </div>
        <nav className="fd-tabs">
          {FLOWS.map((f, i) => (
            <button key={f.id} className={`fd-tab${tab === i ? ' active' : ''}`} onClick={() => handleTab(i)}>
              <span>{f.emoji}</span> {f.title}
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
              <p>Klik salah satu peran atau node untuk melihat batas hak akses.</p>
            </div>
          )}
          
          <div className="fd-legend">
            <p>Role Colors:</p>
            <div className="fd-legend-item"><span className="fd-dot" data-kind="admin" /> Super Admin</div>
            <div className="fd-legend-item"><span className="fd-dot" data-kind="member" style={{ background: '#a78bfa' }} /> Member / Data Owner</div>
            <div className="fd-legend-item"><span className="fd-dot" data-kind="sys" /> System / Bot</div>
          </div>
        </aside>
      </div>
    </section>
  )
}
