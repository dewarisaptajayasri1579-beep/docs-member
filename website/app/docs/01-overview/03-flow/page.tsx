import { FlowDiagram } from '@/components/flow-diagram'

export const metadata = {
  title: 'Diagram Alur — MemberHub Docs',
  description: 'Diagram alur interaktif sistem Central Membership & SSO Hub',
}

export default function FlowPage() {
  return (
    <main className="document-page">
      <div className="document-meta">
        <div className="breadcrumb">01-overview</div>
        <span className="reading-time">🖱️ Klik node untuk detail</span>
      </div>
      <FlowDiagram />
    </main>
  )
}
