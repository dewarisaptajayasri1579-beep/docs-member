import { RolesDiagram } from '@/components/roles-diagram'

export function generateStaticParams() {
  return [{ lang: 'id' }, { lang: 'en' }]
}

export const metadata = {
  title: 'Roles Flow — MemberHub Docs',
  description: 'Diagram interaktif hierarki roles dan permission',
}

export default function RolesFlowPage() {
  return (
    <main className="document-page">
      <div className="document-meta">
        <div className="breadcrumb">02-users-and-roles</div>
        <span className="reading-time">🖱️ Klik node untuk detail</span>
      </div>
      <RolesDiagram />
    </main>
  )
}
