import { redirect } from 'next/navigation'
import { getNavigation } from '@/lib/docs'

export default function DocsIndexPage() {
  const first = getNavigation()[0]?.items[0]
  redirect(first ? `/docs/${first.slug.join('/')}` : '/')
}
