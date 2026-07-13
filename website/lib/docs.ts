import fs from 'node:fs'
import path from 'node:path'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const DOCS_ROOT = path.resolve(process.cwd(), '..')
const ignoredDirectories = new Set(['.git', 'website', 'versions', 'node_modules'])

export type NavItem = { title: string; slug: string[] }
export type NavSection = { title: string; items: NavItem[] }
export type Document = { title: string; html: string; slug: string[]; section: string }

function titleFromFilename(file: string) {
  return file.replace(/\.md$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function walk(directory: string, relative = ''): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return ignoredDirectories.has(entry.name) ? [] : walk(path.join(directory, entry.name), path.join(relative, entry.name))
    return entry.isFile() && entry.name.endsWith('.md') ? [path.join(relative, entry.name)] : []
  })
}

export function getAllSlugs() {
  return walk(DOCS_ROOT).map((file) => file.replace(/\.md$/, '').split(path.sep).filter((part) => part !== 'README'))
}

export function getNavigation(): NavSection[] {
  const groups = new Map<string, NavItem[]>()
  for (const file of walk(DOCS_ROOT)) {
    const parts = file.replace(/\.md$/, '').split(path.sep)
    const section = parts[0] === 'README' ? 'Dokumentasi' : parts[0]
    const slug = parts.filter((part) => part !== 'README')
    const title = parts.at(-1) === 'README' ? titleFromFilename(section) : titleFromFilename(parts.at(-1) ?? '')
    const items = groups.get(section) ?? []
    items.push({ title, slug })
    groups.set(section, items)
  }
  return [...groups].map(([title, items]) => ({ title, items: items.sort((a, b) => a.title.localeCompare(b.title)) }))
}

export async function getDocument(slug: string[]): Promise<Document | null> {
  const candidates = [path.join(DOCS_ROOT, ...slug) + '.md', path.join(DOCS_ROOT, ...slug, 'README.md')]
  const filePath = candidates.find((candidate) => fs.existsSync(candidate))
  if (!filePath || !filePath.startsWith(DOCS_ROOT)) return null
  const source = fs.readFileSync(filePath, 'utf8')
  const html = String(await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(source))
  const heading = source.match(/^#\s+(.+)$/m)?.[1] ?? titleFromFilename(path.basename(filePath))
  return { title: heading, html, slug, section: path.relative(DOCS_ROOT, filePath).split(path.sep)[0] }
}
