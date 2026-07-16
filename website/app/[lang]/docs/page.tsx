import { redirect } from 'next/navigation'
import { getNavigation } from '@/lib/docs'

export function generateStaticParams() {
  return [{ lang: 'id' }, { lang: 'en' }, { lang: 'ja' }]
}

export default async function DocsIndexPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const lang = params.lang || 'id'
  const nav = getNavigation(lang)
  if (nav[0]?.items[0]) {
    redirect(`/${lang}/docs/${nav[0].items[0].slug.join('/')}`)
  }
  return <div>No documents found</div>
}
