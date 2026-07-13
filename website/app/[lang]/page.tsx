import Link from 'next/link'
import { FlowExplorer } from '@/components/flow-explorer'
import { getNavigation } from '@/lib/docs'

export function generateStaticParams() {
  return [{ lang: 'id' }, { lang: 'en' }]
}



export default async function HomePage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const lang = params.lang || 'id'
  const isEn = lang === 'en'
  const firstDocument = getNavigation(lang)[0]?.items[0]

  const highlights = isEn ? [
    ['For everyone', 'Understand registration, licensing, payments, and SSO flows without complex technical jargon.'],
    ['For developers', 'Access API details, database schemas, NestJS architecture, Redis/BullMQ, OAuth2, and testing scenarios.'],
    ['Always tracked', 'View change history and select the documentation version that fits your integration needs.'],
  ] : [
    ['Untuk semua orang', 'Pahami alur registrasi, lisensi, pembayaran, dan SSO tanpa istilah teknis yang rumit.'],
    ['Untuk developer', 'Akses detail API, database, arsitektur NestJS, Redis/BullMQ, OAuth2, dan skenario testing.'],
    ['Selalu terlacak', 'Lihat riwayat perubahan dan pilih versi dokumentasi sesuai kebutuhan integrasi.'],
  ]

  return (
    <main className="home">
      <section className="hero">
        <span className="eyebrow">{isEn ? 'Central Membership & SSO Hub' : 'Central Membership & SSO Hub'}</span>
        <h1>{isEn ? 'Documentation that is easy to read, without missing technical details.' : 'Dokumentasi yang mudah dibaca, tanpa mengurangi detail penting.'}</h1>
        <p>{isEn ? 'Start with a simple overview of the system, then dive into technical details when you need them.' : 'Mulai dari gambaran sederhana sistem, lalu buka detail teknis saat Anda membutuhkannya.'}</p>
        <div className="hero-actions">
          <Link
            className="button primary"
            href={firstDocument ? `/${lang}/docs/${firstDocument.slug.join('/')}` : `/${lang}/docs`}
          >
            {isEn ? 'Start reading →' : 'Mulai membaca →'}
          </Link>
          <Link className="button secondary" href={`/${lang}/docs/12-web-documents`}>
            {isEn ? 'About this portal' : 'Tentang portal ini'}
          </Link>
        </div>
      </section>

      <section className="highlight-grid">
        {highlights.map(([title, description], i) => (
          <article className="highlight" key={title}>
            <span>0{i + 1}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="journey">
        <div>
          <span className="eyebrow">{isEn ? 'Main flow' : 'Alur utama'}</span>
          <h2>{isEn ? 'From new account to product access.' : 'Dari akun baru sampai akses produk.'}</h2>
        </div>
        <ol>
          <li>{isEn ? 'Register and verify email' : 'Daftar dan verifikasi email'}</li>
          <li>{isEn ? 'Select product and activate license' : 'Pilih produk dan aktifkan lisensi'}</li>
          <li>{isEn ? 'Pay if choosing a paid plan' : 'Bayar jika memilih paket berbayar'}</li>
          <li>{isEn ? 'Access all apps via SSO' : 'Akses semua aplikasi melalui SSO'}</li>
        </ol>
      </section>

      <FlowExplorer lang={lang} />
    </main>
  )
}
