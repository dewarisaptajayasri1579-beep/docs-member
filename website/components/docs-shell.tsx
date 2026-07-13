'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { NavSection } from '@/lib/docs'

export function DocsShell({ navigation, children }: { navigation: NavSection[]; children: React.ReactNode }) {
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(false)
  const filtered = useMemo(() => navigation.map((section) => ({ ...section, items: section.items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())) })).filter((section) => section.items.length), [navigation, query])
  return <div className={detail ? 'shell detail-mode' : 'shell'}>
    <aside className="sidebar">
      <Link href="/" className="brand"><span>MemberHub</span> Documentation</Link>
      <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari dokumentasi" /></label>
      <nav>{filtered.map((section) => <section key={section.title}><p>{section.title}</p>{section.items.map((item) => <Link key={item.slug.join('/')} href={`/docs/${item.slug.join('/')}`}>{item.title}</Link>)}</section>)}</nav>
      <div className="sidebar-footer">v1.0 · Offline-ready</div>
    </aside>
    <header className="topbar"><Link href="/">⌂ Beranda</Link><div className="mode"><span>Simple</span><button onClick={() => setDetail((value) => !value)} aria-label="Ganti mode detail" aria-pressed={detail}><i /></button><span>Detail</span></div></header>
    <div className="content">{children}</div>
  </div>
}
