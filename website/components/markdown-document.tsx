import type { Document } from '@/lib/docs'

export function MarkdownDocument({ document }: { document: Document }) {
  return <main className="document-page">
    <div className="document-meta"><span>{document.section}</span><span>Dokumen aktif · v1.0</span></div>
    <article className="markdown" dangerouslySetInnerHTML={{ __html: document.html }} />
  </main>
}
