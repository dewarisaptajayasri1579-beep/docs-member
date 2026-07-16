'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { NavSection } from '@/lib/docs'

function ScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? (el.scrollTop / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="scroll-progress" style={{ width: `${pct}%` }} />
}

export function DocsShell({ lang, navigation, children }: { lang: string; navigation: NavSection[]; children: React.ReactNode }) {
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(false)
  const [dark, setDark] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem('docs-theme')
    if (saved === 'light') setDark(false)
  }, [])

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('docs-theme', dark ? 'dark' : 'light')
  }, [dark])

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const filtered = useMemo(() =>
    navigation
      .map(s => ({ ...s, items: s.items.filter(i => i.title.toLowerCase().includes(query.toLowerCase())) }))
      .filter(s => s.items.length),
    [navigation, query]
  )

  const toggleSection = (title: string) => setCollapsed(prev => {
    const next = new Set(prev)
    next.has(title) ? next.delete(title) : next.add(title)
    return next
  })

  const cls = ['shell', detail && 'detail-mode', mobileOpen && 'mobile-open'].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <ScrollProgress />
      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}

      <aside className="sidebar">
        <div className="sidebar-top">
          <Link href="/" className="brand">
            <span>MemberHub</span>
            Documentation
          </Link>
          <label className="search">
            <span>⌕</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search documentation…' : lang === 'ja' ? 'ドキュメントを検索…' : 'Cari dokumentasi…'}
            />
            {query && (
              <button className="search-clear" type="button" onClick={() => setQuery('')}>✕</button>
            )}
          </label>
        </div>

        <nav>
          {filtered.map(section => {
            const isOpen = !collapsed.has(section.title)
            return (
              <section key={section.title}>
                <button className="section-toggle" onClick={() => toggleSection(section.title)}>
                  <span>{section.title}</span>
                  <i className={`chevron${isOpen ? '' : ' collapsed'}`}>›</i>
                </button>
                {isOpen && (
                  <div className="section-items">
                    {section.items.map(item => {
                      const href = `/${lang}/docs/${item.slug.join('/')}`
                      const isActive = pathname === href
                      return (
                        <Link key={href} href={href} className={`nav-link${isActive ? ' active' : ''}`}>
                          {isActive && <span className="active-dot" />}
                          {item.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <span>v1.0</span><span>·</span><span>Offline-ready</span>
        </div>
      </aside>

      <header className="topbar">
        <div className="topbar-left">
          <button
            className="hamburger"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={lang === 'en' ? 'Open menu' : lang === 'ja' ? 'メニューを開く' : 'Buka menu'}
          >
            <span /><span /><span />
          </button>
          <Link href={`/${lang}`} className="topbar-home">⌂ {lang === 'en' ? 'Home' : lang === 'ja' ? 'ホーム' : 'Beranda'}</Link>
        </div>
        <div className="topbar-right">
          <div className="lang-switcher">
            <Link href={pathname.replace(`/${lang}`, '/id')} className={lang === 'id' ? 'active' : ''}>ID</Link>
            <span className="sep">/</span>
            <Link href={pathname.replace(`/${lang}`, '/en')} className={lang === 'en' ? 'active' : ''}>EN</Link>
            <span className="sep">/</span>
            <Link href={pathname.replace(`/${lang}`, '/ja')} className={lang === 'ja' ? 'active' : ''}>JA</Link>
          </div>
          <div className="mode-toggle">
            <span>Simple</span>
            <button
              className="toggle-btn"
              onClick={() => setDetail(v => !v)}
              aria-pressed={detail}
              aria-label={lang === 'en' ? 'Toggle mode' : lang === 'ja' ? 'モード切替' : 'Ganti mode'}
            >
              <i className={`knob${detail ? ' on' : ''}`} />
            </button>
            <span>Detail</span>
          </div>
          <button
            className="theme-btn"
            onClick={() => setDark(v => !v)}
            aria-label={dark ? (lang === 'en' ? 'Light mode' : lang === 'ja' ? 'ライトモード' : 'Mode terang') : (lang === 'en' ? 'Dark mode' : lang === 'ja' ? 'ダークモード' : 'Mode gelap')}
          >
            {dark ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <div className="content">{children}</div>
    </div>
  )
}
