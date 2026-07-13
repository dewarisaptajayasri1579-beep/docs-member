import type { Metadata } from 'next'
import './globals.css'
import './flow.css'
import { DocsShell } from '@/components/docs-shell'
import { getNavigation } from '@/lib/docs'

export const metadata: Metadata = {
  title: 'MemberHub Docs',
  description: 'Panduan interaktif Central Membership & SSO Hub',
}

// Prevent flash of wrong theme before React hydrates
const themeScript = `
  try {
    const t = localStorage.getItem('docs-theme');
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  } catch(e) {}
`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <DocsShell navigation={getNavigation()}>{children}</DocsShell>
      </body>
    </html>
  )
}
