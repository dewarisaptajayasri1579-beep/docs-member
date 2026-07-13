import { RolesDiagram } from '@/components/roles-diagram'

export function generateStaticParams() {
  return [{ lang: 'id' }, { lang: 'en' }]
}

export const metadata = {
  title: 'Roles Flow — MemberHub Docs',
  description: 'Diagram interaktif hierarki roles dan permission',
}

export default async function RolesFlowPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const lang = params.lang || 'id'
  return (
    <main className="document-page">
      <div className="document-meta">
        <div className="breadcrumb">02-users-and-roles</div>
        <span className="reading-time">🖱️ Klik node untuk detail</span>
      </div>
      <RolesDiagram lang={lang} />
    </main>
  )
}
