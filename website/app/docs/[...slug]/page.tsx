import { notFound } from 'next/navigation'
import { MarkdownDocument } from '@/components/markdown-document'
import { getAllSlugs, getDocument } from '@/lib/docs'

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const document = await getDocument(slug)
  if (!document) notFound()
  return <MarkdownDocument document={document} />
}
