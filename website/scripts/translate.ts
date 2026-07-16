import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

// Determine __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '..')
const ID_DIR = path.join(ROOT_DIR, 'id')
const TARGET_LANGS = [
  { code: 'en', dir: path.join(ROOT_DIR, 'en'), name: 'English' },
  { code: 'ja', dir: path.join(ROOT_DIR, 'ja'), name: 'Japanese' }
]
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

const API_KEY = process.env.GROQ_API_KEY
if (!API_KEY) {
  console.error('Error: GROQ_API_KEY is not set in .env')
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

async function translateMarkdown(text: string, targetLangName: string): Promise<string> {
  const url = `https://api.groq.com/openai/v1/chat/completions`
  const prompt = `You are an expert technical translator. Translate the following documentation from Indonesian to ${targetLangName}.
CRITICAL RULES:
1. Maintain exactly the same markdown formatting (headings, lists, bolding, italics).
2. DO NOT translate anything inside \`\`\` code blocks or inline \`code\`.
3. Keep technical terms intact (e.g., SSO, Grace Period, Webhook, License-ID).
4. Do not output any conversational wrapper text. Return only the translated markdown.
5. If the document is a "README.md", translate it normally but keep the filename as "README.md".
6. IMPORTANT: You MUST completely translate the main title / H1 heading (the very first line starting with "# ") into ${targetLangName}. Do NOT leave it in Indonesian or English!

Here is the markdown:
${text}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API Error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
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

  for (const lang of TARGET_LANGS) {
    console.log(`\n🌐 Memproses bahasa: ${lang.name}...`)
    
    for (const idFilePath of idFiles) {
      const relPath = path.relative(ID_DIR, idFilePath)
      const targetFilePath = path.join(lang.dir, relPath)
      const cacheKey = `${lang.code}:${relPath}`
      
      const content = fs.readFileSync(idFilePath, 'utf8')
      const hash = getMd5(content)

      // Check if translation is needed
      if (cache[cacheKey] === hash && fs.existsSync(targetFilePath)) {
        continue // No change
      }
      
      // Check if target file exists and has manual override
      if (fs.existsSync(targetFilePath)) {
        const targetContent = fs.readFileSync(targetFilePath, 'utf8')
        if (targetContent.includes('<!-- manual -->')) {
          console.log(`🔒 Melewati (dikunci manual): ${relPath}`)
          continue
        }
      }

      console.log(`⏳ Menerjemahkan ke ${lang.code}: ${relPath}`)
      
      let success = false
      let attempts = 0
      while (!success && attempts < 3) {
        try {
          const translated = await translateMarkdown(content, lang.name)
          
          fs.mkdirSync(path.dirname(targetFilePath), { recursive: true })
          fs.writeFileSync(targetFilePath, translated, 'utf8')
          
          cache[cacheKey] = hash
          fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8')
          
          console.log(`✅ Selesai: ${relPath}`)
          translatedCount++
          success = true
          
          await new Promise(r => setTimeout(r, 3000))
        } catch (err: any) {
          attempts++
          console.error(`❌ Gagal menerjemahkan ${relPath} (Percobaan ${attempts}/3): ${err.message}`)
          if (attempts < 3) {
            console.log(`Menunggu 10 detik sebelum mencoba lagi...`)
            await new Promise(r => setTimeout(r, 10000))
          } else {
            console.log(`Menyerah pada file ini setelah 3x gagal.`)
          }
        }
      }
    }
  }

  if (translatedCount === 0) {
    console.log('\n✨ Semua dokumen sudah up-to-date.')
  } else {
    console.log(`\n🎉 Selesai menerjemahkan ${translatedCount} dokumen.`)
  }
}

run()
