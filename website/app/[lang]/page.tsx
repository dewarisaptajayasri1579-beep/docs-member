import Link from 'next/link'
import { FlowExplorer } from '@/components/flow-explorer'
import { getNavigation } from '@/lib/docs'

export function generateStaticParams() {
  return [{ lang: 'id' }, { lang: 'en' }, { lang: 'ja' }]
}



export default async function HomePage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const lang = params.lang || 'id'
  const isEn = lang === 'en'
  const firstDocument = getNavigation(lang)[0]?.items[0]

  const highlights = lang === 'en' ? [
    ['For everyone', 'Understand registration, licensing, payments, and SSO flows without complex technical jargon.'],
    ['For developers', 'Access API details, database schemas, NestJS architecture, Redis/BullMQ, OAuth2, and testing scenarios.'],
    ['Always tracked', 'View change history and select the documentation version that fits your integration needs.'],
  ] : lang === 'ja' ? [
    ['すべての人のために', '複雑な技術用語なしで、登録、ライセンス、支払い、SSOフローを理解できます。'],
    ['開発者のために', 'APIの詳細、データベーススキーマ、NestJSアーキテクチャ、Redis/BullMQ、OAuth2、およびテストシナリオにアクセスします。'],
    ['常に追跡', '変更履歴を表示し、統合のニーズに合ったドキュメントバージョンを選択します。'],
  ] : [
    ['Untuk semua orang', 'Pahami alur registrasi, lisensi, pembayaran, dan SSO tanpa istilah teknis yang rumit.'],
    ['Untuk developer', 'Akses detail API, database, arsitektur NestJS, Redis/BullMQ, OAuth2, dan skenario testing.'],
    ['Selalu terlacak', 'Lihat riwayat perubahan dan pilih versi dokumentasi sesuai kebutuhan integrasi.'],
  ]

  return (
    <main className="home">
      <section className="hero">
        <span className="eyebrow">Central Membership & SSO Hub</span>
        <h1>{lang === 'en' ? 'Documentation that is easy to read, without missing technical details.' : lang === 'ja' ? '技術的な詳細を省くことなく、読みやすいドキュメント。' : 'Dokumentasi yang mudah dibaca, tanpa mengurangi detail penting.'}</h1>
        <p>{lang === 'en' ? 'Start with a simple overview of the system, then dive into technical details when you need them.' : lang === 'ja' ? 'システムの簡単な概要から始めて、必要なときに技術的な詳細に飛び込みます。' : 'Mulai dari gambaran sederhana sistem, lalu buka detail teknis saat Anda membutuhkannya.'}</p>
        <div className="hero-actions">
          <Link
            className="button primary"
            href={firstDocument ? `/${lang}/docs/${firstDocument.slug.join('/')}` : `/${lang}/docs`}
          >
            {lang === 'en' ? 'Start reading →' : lang === 'ja' ? '読み始める →' : 'Mulai membaca →'}
          </Link>
          <Link className="button secondary" href={`/${lang}/docs/12-web-documents`}>
            {lang === 'en' ? 'About this portal' : lang === 'ja' ? 'このポータルについて' : 'Tentang portal ini'}
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
          <span className="eyebrow">{lang === 'en' ? 'Main flow' : lang === 'ja' ? 'メインフロー' : 'Alur utama'}</span>
          <h2>{lang === 'en' ? 'From new account to product access.' : lang === 'ja' ? '新規アカウントから製品アクセスまで。' : 'Dari akun baru sampai akses produk.'}</h2>
        </div>
        <ol>
          <li>{lang === 'en' ? 'Register and verify email' : lang === 'ja' ? '登録してメールを確認する' : 'Daftar dan verifikasi email'}</li>
          <li>{lang === 'en' ? 'Select product and activate license' : lang === 'ja' ? '製品を選択してライセンスを有効にする' : 'Pilih produk dan aktifkan lisensi'}</li>
          <li>{lang === 'en' ? 'Pay if choosing a paid plan' : lang === 'ja' ? '有料プランを選択した場合は支払う' : 'Bayar jika memilih paket berbayar'}</li>
          <li>{lang === 'en' ? 'Access all apps via SSO' : lang === 'ja' ? 'SSO経由ですべてのアプリにアクセスする' : 'Akses semua aplikasi melalui SSO'}</li>
        </ol>
      </section>

      <FlowExplorer lang={lang} />
    </main>
  )
}
