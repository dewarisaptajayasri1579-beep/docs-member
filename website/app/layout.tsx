import type { Metadata } from 'next'
import './globals.css'
import './flow.css'
import { DocsShell } from '@/components/docs-shell'
import { getNavigation } from '@/lib/docs'

export const metadata: Metadata = {
  title: 'MemberHub Docs',
  description: 'Panduan interaktif Central Membership & SSO Hub',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <DocsShell navigation={getNavigation()}>{children}</DocsShell>
      </body>
    </html>
  )
}
