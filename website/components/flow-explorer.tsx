'use client'

import { useState } from 'react'

export function FlowExplorer({ lang = 'id' }: { lang?: string }) {
  const isEn = lang === 'en'
  const steps = lang === 'en' ? [
    { title: 'Register', description: 'User provides name, email, and password to create a new account.', detail: 'Account created as unverified. Verification email sent via queue.' },
    { title: 'Verify Email', description: 'User clicks the verification link in their email.', detail: 'Token must be valid and unused. Account status becomes active.' },
    { title: 'Select Product', description: 'User selects a SaaS product and a subscription plan.', detail: 'Free plan creates an active_free license immediately. Paid plan redirects to checkout.' },
    { title: 'Payment', description: 'Payment gateway processes the transaction.', detail: 'System validates webhook from Midtrans/Xendit before activating the license.' },
    { title: 'SSO Access', description: 'User logs into the SaaS app without entering credentials again.', detail: 'Hub issues a JWT RS256 token if the account and license are active.' },
  ] : lang === 'ja' ? [
    { title: '登録', description: 'ユーザーは名前、メールアドレス、パスワードを提供して新しいアカウントを作成します。', detail: 'アカウントは未検証として作成されます。キューを介して検証メールが送信されます。' },
    { title: 'メール確認', description: 'ユーザーはメール内の確認リンクをクリックします。', detail: 'トークンは有効で未使用である必要があります。アカウントのステータスがアクティブになります。' },
    { title: '製品の選択', description: 'ユーザーはSaaS製品とサブスクリプションプランを選択します。', detail: '無料プランではすぐにactive_freeライセンスが作成されます。有料プランはチェックアウトにリダイレクトされます。' },
    { title: '支払い', description: '支払いゲートウェイがトランザクションを処理します。', detail: 'ライセンスをアクティベートする前に、Midtrans/XenditからのWebhookをシステムが検証します。' },
    { title: 'SSOアクセス', description: 'ユーザーは資格情報を再度入力することなくSaaSアプリにログインします。', detail: 'アカウントとライセンスがアクティブな場合、HubはJWT RS256トークンを発行します。' },
  ] : [
    { title: 'Daftar', description: 'Member mengisi nama, email, dan kata sandi untuk membuat akun baru.', detail: 'Akun dibuat dengan status unverified. Sistem mengirim email verifikasi melalui queue.' },
    { title: 'Verifikasi', description: 'Member membuka tautan verifikasi dari email.', detail: 'Token harus valid, belum dipakai, dan belum kedaluwarsa. Akun lalu menjadi active.' },
    { title: 'Aktifkan produk', description: 'Member memilih produk dan paket yang ingin digunakan.', detail: 'Paket Free langsung membuat lisensi active_free. Paket paid menuju checkout.' },
    { title: 'Pembayaran', description: 'Payment gateway memproses pembayaran paket berbayar.', detail: 'Midtrans atau Xendit mengirim webhook yang divalidasi sebelum lisensi aktif.' },
    { title: 'Akses lewat SSO', description: 'Member masuk ke aplikasi SaaS tanpa login ulang.', detail: 'Hub menerbitkan JWT RS256 bila akun dan lisensi masih memenuhi syarat akses.' },
  ]

  const [active, setActive] = useState(0)
  const step = steps[active]

  return (
    <section className="flow-explorer" aria-labelledby="flow-heading">
      <div className="flow-heading">
        <div>
          <span className="eyebrow">{lang === 'en' ? 'Interactive flow diagram' : lang === 'ja' ? 'インタラクティブなフロー図' : 'Diagram alur interaktif'}</span>
          <h2 id="flow-heading">{lang === 'en' ? 'How does a member start using a product?' : lang === 'ja' ? 'メンバーはどのように製品を使い始めますか？' : 'Bagaimana seorang member mulai memakai produk?'}</h2>
        </div>
        <p>{lang === 'en' ? 'Select each step to see what happens.' : lang === 'ja' ? '各ステップを選択して何が起こるかを確認してください。' : 'Pilih setiap tahap untuk melihat apa yang terjadi.'}</p>
      </div>
      <div className="flow-track" role="tablist" aria-label={lang === 'en' ? 'User journey' : lang === 'ja' ? 'ユーザージャーニー' : 'Alur pengguna'}>
        {steps.map((item, index) => (
          <button key={item.title} role="tab" aria-selected={active === index} className={active === index ? 'flow-step active' : 'flow-step'} onClick={() => setActive(index)}>
            <b>{index + 1}</b><span>{item.title}</span>
          </button>
        ))}
      </div>
      <article className="flow-detail">
        <span>{lang === 'en' ? `Step ${active + 1} of ${steps.length}` : lang === 'ja' ? `ステップ ${active + 1} / ${steps.length}` : `Tahap ${active + 1} dari ${steps.length}`}</span>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
        <div className="flow-technical">
          <strong>{lang === 'en' ? 'Behind the scenes' : lang === 'ja' ? '舞台裏' : 'Di balik layar'}</strong>
          <p>{step.detail}</p>
        </div>
      </article>
    </section>
  )
}
