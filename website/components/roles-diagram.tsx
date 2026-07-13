'use client'
import { useState } from 'react'

type Kind = 'admin' | 'member' | 'guest' | 'sys'

interface N {
  id: string; cx: number; cy: number; w: number; h: number
  kind: Kind; label: string; sub?: string; info?: string
}
interface E {
  pts: number[][]; label?: string; lx?: number; ly?: number; back?: boolean
}

const STYLE: Record<Kind, { fill: string; stroke: string; text: string; sub: string }> = {
  admin: { fill: '#2a1a00', stroke: '#f59e0b', text: '#fcd34d', sub: '#b8882a' },
  member: { fill: '#1a1430', stroke: '#a78bfa', text: '#a78bfa', sub: '#7c6dc4' },
  guest: { fill: '#181820', stroke: '#3a3a50', text: '#f0eeff', sub: '#8886a4' },
  sys: { fill: '#0f172a', stroke: '#3b82f6', text: '#93c5fd', sub: '#5e8ab4' },
}

const NODES: N[] = [
  { id: 'g', cx: 300, cy: 40, w: 200, h: 42, kind: 'guest', label: 'Guest (Unregistered)', info: 'Pengguna yang belum mendaftar. Hanya dapat melihat halaman publik (katalog produk).' },
  { id: 'u', cx: 300, cy: 120, w: 200, h: 42, kind: 'guest', label: 'Unverified Member', info: 'Pengguna yang sudah mendaftar tetapi belum verifikasi email. Tidak bisa login/akses layanan.' },
  { id: 'm', cx: 300, cy: 220, w: 240, h: 46, kind: 'member', label: 'Member (Active)', sub: 'Default role saat verifikasi', info: 'Dapat mengelola profil, checkout paket, aktivasi produk, dan login SSO ke aplikasi lain.' },
  { id: 'a', cx: 300, cy: 320, w: 240, h: 46, kind: 'admin', label: 'Super Admin', sub: 'Akses Penuh', info: 'Dapat mengelola produk, paket langganan, melihat semua transaksi, dan memblokir member.' },
  { id: 's', cx: 580, cy: 220, w: 180, h: 42, kind: 'sys', label: 'SaaS Applications', info: 'Menerima login dari Member melalui SSO (OAuth2). Tidak mengelola user sendiri.' },
]

const EDGES: E[] = [
  { pts: [[300, 61], [300, 99]], label: 'Register', lx: 340, ly: 84 },
  { pts: [[300, 141], [300, 197]], label: 'Verifikasi Email', lx: 350, ly: 174 },
  { pts: [[300, 243], [300, 297]], label: 'Promote by System/Admin', lx: 385, ly: 274, back: true },
  { pts: [[420, 220], [490, 220]], label: 'SSO Login', lx: 455, ly: 210 },
  { pts: [[420, 320], [580, 320], [580, 241]], label: 'Kelola Integrasi', lx: 510, ly: 310, back: true },
]

function SvgNode({ n, active, onClick }: { n: N; active: boolean; onClick: () => void }) {
  const s = STYLE[n.kind]
  const rx = 10
  const hasGlow = active
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }} role="button">
      {hasGlow && (
        <rect x={n.cx - n.w / 2 - 4} y={n.cy - n.h / 2 - 4} width={n.w + 8} height={n.h + 8} rx={rx + 2} fill="none" stroke={s.stroke} strokeWidth={1.5} opacity={0.3} />
      )}
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
  const ax = last[0] - ux * 10, ay = last[1] - uy * 10
  const arrow = `M ${last[0]},${last[1]} L ${ax - uy * 4},${ay + ux * 4} L ${ax + uy * 4},${ay - ux * 4} Z`
  return (
    <g>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.2} strokeDasharray={e.back ? '4 3' : undefined} />
      <path d={arrow} fill={color} />
      {e.label && <text x={e.lx} y={e.ly} textAnchor="middle" fill="var(--dim)" fontSize={10} fontFamily="Inter, sans-serif">{e.label}</text>}
    </g>
  )
}

export function RolesDiagram() {
  const [active, setActive] = useState<string | null>(null)
  const activeNode = NODES.find(n => n.id === active)

  return (
    <section className="fd-wrap">
      <div className="fd-header">
        <div>
          <span className="eyebrow">Diagram Hierarki & Interaksi</span>
          <h2>Users & Roles</h2>
          <p>Klik peran untuk melihat detail izin aksesnya.</p>
        </div>
      </div>
      <div className="fd-body" style={{ minHeight: '400px' }}>
        <div className="fd-svg-wrap">
          <svg viewBox="0 0 700 380" width="100%" style={{ overflow: 'visible', display: 'block' }}>
            {EDGES.map((e, i) => <SvgEdge key={i} e={e} />)}
            {NODES.map(n => <SvgNode key={n.id} n={n} active={active === n.id} onClick={() => setActive(active === n.id ? null : n.id)} />)}
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
              <p>Klik salah satu peran untuk melihat batas hak akses.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
