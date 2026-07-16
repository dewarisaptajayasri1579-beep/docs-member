import { notFound } from 'next/navigation'
import { MarkdownDocument } from '@/components/markdown-document'
import { getAllSlugs, getDocument } from '@/lib/docs'

export async function generateMetadata(props: { params: Promise<{ slug: string[], lang: string }> }) {
  const params = await props.params
  const lang = params.lang || 'id'
  const document = await getDocument(params.slug, lang)
  if (!document) return {}
  return { title: `${document.title} — MemberHub Docs` }
}

export async function generateStaticParams() {
  // Generate for 'id', 'en', and 'ja'
  const idSlugs = getAllSlugs('id').map(slug => ({ slug, lang: 'id' }))
  const enSlugs = getAllSlugs('en').map(slug => ({ slug, lang: 'en' }))
  const jaSlugs = getAllSlugs('ja').map(slug => ({ slug, lang: 'ja' }))
  return [...idSlugs, ...enSlugs, ...jaSlugs]
}

export default async function DocumentPage(props: { params: Promise<{ slug: string[], lang: string }> }) {
  const params = await props.params
  const lang = params.lang || 'id'
  const document = await getDocument(params.slug, lang)
  if (!document) notFound()
  return <MarkdownDocument document={document} lang={lang} />
}
