import type { Metadata } from 'next'
import Script from 'next/script'
import '../globals.css'
import '../flow.css'
import '../lang.css'
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

export default async function RootLayout(
  props: { children: React.ReactNode, params: Promise<{ lang: string }> }
) {
  const params = await props.params
  const lang = params.lang || 'id'
  
  return (
    <html lang={lang} data-theme="dark" suppressHydrationWarning>
      <head>
      </head>
      <body>
        <Script id="theme-script" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        <DocsShell lang={lang} navigation={getNavigation(lang)}>{props.children}</DocsShell>
      </body>
    </html>
  )
}
