import { FlowDiagram } from '@/components/flow-diagram'

export function generateStaticParams() {
  return [{ lang: 'id' }, { lang: 'en' }]
}

export const metadata = {
  title: 'Diagram Alur — MemberHub Docs',
  description: 'Diagram alur interaktif sistem Central Membership & SSO Hub',
}

export default async function FlowPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const lang = params.lang || 'id'
  return (
    <main className="document-page">
      <div className="document-meta">
        <div className="breadcrumb">01-overview</div>
        <span className="reading-time">🖱️ Klik node untuk detail</span>
      </div>
      <FlowDiagram lang={lang} />
    </main>
  )
}
