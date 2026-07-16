import fs from 'node:fs'
import path from 'node:path'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const DOCS_ROOT = process.cwd()
const ignoredDirectories = new Set(['.git', 'website', 'versions', 'node_modules'])

export type NavItem = { title: string; slug: string[]; sortKey: string }
export type NavSection = { title: string; items: NavItem[]; sortKey: string }
export type Document = { title: string; html: string; raw: string; filePath: string; slug: string[]; section: string }

function titleFromFilename(file: string) {
  return file
    .replace(/\.md$/, '')
    .replace(/^\d+-/, '') // strip leading digits and dash (e.g., '01-')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function walk(directory: string, relative = ''): string[] {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return ignoredDirectories.has(entry.name) ? [] : walk(path.join(directory, entry.name), path.join(relative, entry.name))
    return entry.isFile() && entry.name.endsWith('.md') ? [path.join(relative, entry.name)] : []
  })
}

function getDocsRoot(lang: string) {
  return path.resolve(DOCS_ROOT, lang === 'en' ? 'en' : (lang === 'ja' ? 'ja' : 'id'))
}

export function getAllSlugs(lang: string = 'id') {
  return walk(getDocsRoot(lang)).map((file) => file.replace(/\.md$/, '').split(path.sep).filter((part) => part !== 'README'))
}

export function getNavigation(lang: string = 'id'): NavSection[] {
  const groups = new Map<string, { items: NavItem[], sortKey: string }>()
  const root = getDocsRoot(lang)
  
  const sectionTranslations: Record<string, Record<string, string>> = {
    '01-overview': { id: 'Gambaran Umum', en: 'Overview', ja: '概要' },
    '02-users-and-roles': { id: 'Pengguna dan Peran', en: 'Users and Roles', ja: 'ユーザーと役割' },
    '03-business-flows': { id: 'Alur Bisnis', en: 'Business Flows', ja: 'ビジネスフロー' },
    '04-features': { id: 'Fitur', en: 'Features', ja: '機能' },
    '05-business-rules': { id: 'Aturan Bisnis', en: 'Business Rules', ja: 'ビジネスルール' },
    '06-ui-ux': { id: 'UI/UX', en: 'UI/UX', ja: 'UI/UX' },
    '07-database': { id: 'Basis Data', en: 'Database', ja: 'データベース' },
    '08-api': { id: 'API', en: 'API', ja: 'API' },
    '09-technical': { id: 'Teknis', en: 'Technical', ja: '技術情報' },
    '10-testing': { id: 'Pengujian', en: 'Testing', ja: 'テスト' },
    '11-changelog': { id: 'Log Perubahan', en: 'Changelog', ja: '変更履歴' },
    '12-web-documents': { id: 'Dokumen Web', en: 'Web Documents', ja: 'Webドキュメント' },
  }
  
  for (const file of walk(root)) {
    const parts = file.replace(/\.md$/, '').split(path.sep)
    
    // Skip the root README.md so it doesn't create a 'Dokumentasi' section in the sidebar
    if (parts.length === 1 && parts[0] === 'README') continue

    const sectionRaw = parts[0]
    const slug = parts.filter((part) => part !== 'README')
    
    // Extract H1 from the file content for the true translated title
    const filePath = path.join(root, file)
    let title = ''
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const match = content.match(/^#\s+(.+)$/m)
      if (match) {
        title = match[1].replace(/\s+[-—]\s+Central Membership & SSO Hub$/i, '')
      } else {
        title = titleFromFilename(parts.at(-1) ?? '')
      }
    } catch (e) {
      title = titleFromFilename(parts.at(-1) ?? '')
    }
    
    // For README.md, if the H1 is extracted correctly, we just use it!
    // But if there's no H1, it will fallback to titleFromFilename above.
    
    const sortKey = parts.at(-1) ?? ''
    
    const group = groups.get(sectionRaw) ?? { items: [], sortKey: sectionRaw }
    group.items.push({ title, slug, sortKey })
    groups.set(sectionRaw, group)
  }
  
  return [...groups].map(([sectionRaw, group]) => {
    let title = titleFromFilename(sectionRaw)
    if (sectionRaw === 'Dokumentasi') {
      title = lang === 'en' ? 'Documentation' : lang === 'ja' ? 'ドキュメント' : 'Dokumentasi'
    } else if (sectionTranslations[sectionRaw]) {
      title = sectionTranslations[sectionRaw][lang] || sectionTranslations[sectionRaw]['en']
    }
    
    return {
      title,
      sortKey: group.sortKey,
      items: group.items.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    }
  }).sort((a, b) => {
    const isDocA = a.title === 'Dokumentasi' || a.title === 'Documentation' || a.title === 'ドキュメント'
    const isDocB = b.title === 'Dokumentasi' || b.title === 'Documentation' || b.title === 'ドキュメント'
    if (isDocA) return -1;
    if (isDocB) return 1;
    return a.sortKey.localeCompare(b.sortKey);
  })
}

export async function getDocument(slug: string[], lang: string = 'id'): Promise<Document | null> {
  const root = getDocsRoot(lang)
  const candidates = [path.join(root, ...slug) + '.md', path.join(root, ...slug, 'README.md')]
  const filePath = candidates.find((candidate) => fs.existsSync(candidate))
  
  if (!filePath || !filePath.startsWith(root)) return null
  
  const source = fs.readFileSync(filePath, 'utf8')
  const html = String(await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(source))
  const rawHeading = source.match(/^#\s+(.+)$/m)?.[1] ?? titleFromFilename(path.basename(filePath))
  const heading = rawHeading.replace(/\s+[-—]\s+Central Membership & SSO Hub$/i, '')
  const sectionRaw = path.relative(root, filePath).split(path.sep)[0]
  
  const sectionTitle = sectionRaw === 'README.md' 
    ? (lang === 'en' ? 'Documentation' : lang === 'ja' ? 'ドキュメント' : 'Dokumentasi') 
    : titleFromFilename(sectionRaw)
    
  const relativeFilePath = path.relative(DOCS_ROOT, filePath)
    
  return { title: heading, html, raw: source, filePath: relativeFilePath, slug, section: sectionTitle }
}
