import Link from 'next/link'
import { FlowExplorer } from '@/components/flow-explorer'
import { getNavigation } from '@/lib/docs'

const highlights = [
  ['Untuk semua orang', 'Pahami alur registrasi, lisensi, pembayaran, dan SSO tanpa istilah teknis yang rumit.'],
  ['Untuk developer', 'Akses detail API, database, arsitektur NestJS, Redis/BullMQ, OAuth2, dan skenario testing.'],
  ['Selalu terlacak', 'Lihat riwayat perubahan dan pilih versi dokumentasi sesuai kebutuhan integrasi.'],
]

export default function HomePage() {
  const firstDocument = getNavigation()[0]?.items[0]
  return (
    <main className="home">
      <section className="hero">
        <span className="eyebrow">Central Membership &amp; SSO Hub</span>
        <h1>Dokumentasi yang mudah dibaca, tanpa mengurangi detail penting.</h1>
        <p>Mulai dari gambaran sederhana sistem, lalu buka detail teknis saat Anda membutuhkannya.</p>
        <div className="hero-actions">
          <Link
            className="button primary"
            href={firstDocument ? `/docs/${firstDocument.slug.join('/')}` : '/docs'}
          >
            Mulai membaca →
          </Link>
          <Link className="button secondary" href="/docs/12-web-documents">
            Tentang portal ini
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
          <span className="eyebrow">Alur utama</span>
          <h2>Dari akun baru sampai akses produk.</h2>
        </div>
        <ol>
          <li>Daftar dan verifikasi email</li>
          <li>Pilih produk dan aktifkan lisensi</li>
          <li>Bayar jika memilih paket berbayar</li>
          <li>Akses semua aplikasi melalui SSO</li>
        </ol>
      </section>

      <FlowExplorer />
    </main>
  )
}
