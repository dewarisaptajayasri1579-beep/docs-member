import type { Document } from '@/lib/docs'
import { FlowDiagram } from './flow-diagram'
import { RolesDiagram } from './roles-diagram'
import { BusinessFlowDiagram } from './business-flow-diagram'
import { LiveEditor } from './live-editor'

function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function MarkdownDocument({ document, lang = 'id' }: { document: Document, lang?: string }) {
  const mins = readingTime(document.html)
  const slugStr = document.slug.join('/')
  
  return (
    <main className="document-page">
      <div className="document-meta">
        <div className="breadcrumb">{document.section}</div>
        <span className="reading-time">📖 {mins} menit baca</span>
      </div>
      
      {slugStr === '01-overview/03-flow' && <FlowDiagram lang={lang} defaultTab={0} />}
      {slugStr === '03-business-flows/00-flow' && <BusinessFlowDiagram lang={lang} defaultTab={0} />}
      {slugStr === '02-users-and-roles/03-roles-flow' && <RolesDiagram lang={lang} />}

      <LiveEditor html={document.html} raw={document.raw} filePath={document.filePath} lang={lang} />
    </main>
  )
}
