import type { Document } from '@/lib/docs'

function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function MarkdownDocument({ document }: { document: Document }) {
  const mins = readingTime(document.html)
  return (
    <main className="document-page">
      <div className="document-meta">
        <div className="breadcrumb">{document.section}</div>
        <span className="reading-time">📖 {mins} menit baca</span>
      </div>
      <article className="markdown" dangerouslySetInnerHTML={{ __html: document.html }} />
    </main>
  )
}
