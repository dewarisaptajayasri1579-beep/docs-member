import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { filePath, content, pin } = await req.json()

    // Validasi PIN
    const correctPin = process.env.EDITOR_PIN
    if (!correctPin || correctPin === '') {
      return NextResponse.json({ error: 'Sistem editor belum dikonfigurasi. Harap set EDITOR_PIN.' }, { status: 500 })
    }
    if (pin !== correctPin) {
      return NextResponse.json({ error: 'PIN yang Anda masukkan salah.' }, { status: 401 })
    }

    // Validasi GitHub Token
    const githubToken = process.env.GITHUB_PAT
    if (!githubToken) {
      return NextResponse.json({ error: 'GITHUB_PAT belum dikonfigurasi di server.' }, { status: 500 })
    }

    if (!filePath || !content) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
    }

    // Pastikan ada tag <!-- manual --> agar tidak ditimpa oleh skrip otomatis
    let finalContent = content
    if (!finalContent.includes('<!-- manual -->')) {
      finalContent = `<!-- manual -->\n\n${finalContent.replace(/^<!-- manual -->\s*/, '')}`
    }

    const repoOwner = 'dewarisaptajayasri1579-beep'
    const repoName = 'docs-member'
    const branch = 'main'
    
    // filePath dari frontend adalah relatif terhadap folder website, misal: 'ja/01-overview/01-application-overview.md'
    // Di GitHub repo, path-nya adalah 'website/ja/01-overview/01-application-overview.md'
    const githubFilePath = `website/${filePath}`
    
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${githubFilePath}`

    // 1. Dapatkan SHA file saat ini (diperlukan GitHub untuk melakukan update file yang sudah ada)
    const getRes = await fetch(apiUrl + `?ref=${branch}`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    let sha = ''
    if (getRes.ok) {
      const getJson = await getRes.json()
      sha = getJson.sha
    } else if (getRes.status !== 404) {
      const errorText = await getRes.text()
      throw new Error(`Gagal membaca file dari GitHub: ${errorText}`)
    }

    // 2. Lakukan Commit & Push (PUT request)
    const updateRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `docs: update ${filePath} via live editor`,
        content: Buffer.from(finalContent).toString('base64'),
        sha: sha || undefined,
        branch
      })
    })

    if (!updateRes.ok) {
      const errorText = await updateRes.text()
      throw new Error(`Gagal menyimpan ke GitHub: ${errorText}`)
    }

    return NextResponse.json({ success: true, message: 'Berhasil disimpan' })

  } catch (error: any) {
    console.error('Save error:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal server' }, { status: 500 })
  }
}
