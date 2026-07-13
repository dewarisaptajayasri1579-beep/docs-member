import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

// Determine __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '..')
const ID_DIR = path.join(ROOT_DIR, 'id')
const EN_DIR = path.join(ROOT_DIR, 'en')
const CACHE_FILE = path.join(__dirname, '.translate-cache.json')

// Load .env manually to avoid extra dependencies if possible
const envPath = path.join(ROOT_DIR, '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) process.env[match[1]] = match[2]
  })
}

const API_KEY = process.env.GEMINI_API_KEY
if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in .env')
  process.exit(1)
}

function getMd5(content: string) {
  return crypto.createHash('md5').update(content).digest('hex')
}

function walk(directory: string): string[] {
  let files: string[] = []
  const entries = fs.readdirSync(directory, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(walk(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

async function translateMarkdown(text: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`
  const prompt = `You are an expert technical translator. Translate the following documentation from Indonesian to English.
CRITICAL RULES:
1. Maintain exactly the same markdown formatting (headings, lists, bolding, italics).
2. DO NOT translate anything inside \`\`\` code blocks or inline \`code\`.
3. Keep technical terms intact (e.g., SSO, Grace Period, Webhook, License-ID).
4. Do not output any conversational wrapper text. Return only the translated markdown.
5. If the document is a "README.md", translate it normally but keep the filename as "README.md".

Here is the markdown:
${text}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 }
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API Error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

async function run() {
  console.log('🔍 Memeriksa perubahan dokumen...')
  
  // Load cache
  let cache: Record<string, string> = {}
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
  }

  const idFiles = walk(ID_DIR)
  let translatedCount = 0

  for (const idFilePath of idFiles) {
    const relPath = path.relative(ID_DIR, idFilePath)
    const enFilePath = path.join(EN_DIR, relPath)
    
    const content = fs.readFileSync(idFilePath, 'utf8')
    const hash = getMd5(content)

    // Check if translation is needed
    if (cache[relPath] === hash && fs.existsSync(enFilePath)) {
      continue // No change
    }

    console.log(`⏳ Menerjemahkan: ${relPath}`)
    
    try {
      const translated = await translateMarkdown(content)
      
      // Ensure EN directory exists
      fs.mkdirSync(path.dirname(enFilePath), { recursive: true })
      fs.writeFileSync(enFilePath, translated, 'utf8')
      
      // Update cache
      cache[relPath] = hash
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8')
      
      console.log(`✅ Selesai: ${relPath}`)
      translatedCount++
      
      // Sleep a bit to avoid rate limits
      await new Promise(r => setTimeout(r, 2000))
    } catch (err: any) {
      console.error(`❌ Gagal menerjemahkan ${relPath}: ${err.message}`)
    }
  }

  if (translatedCount === 0) {
    console.log('✨ Semua dokumen bahasa Inggris sudah up-to-date.')
  } else {
    console.log(`🎉 Selesai menerjemahkan ${translatedCount} dokumen.`)
  }
}

run()
