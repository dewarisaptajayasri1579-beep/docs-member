'use client'

import { useState } from 'react'

export function FlowExplorer({ lang = 'id' }: { lang?: string }) {
  const isEn = lang === 'en'
  const steps = isEn ? [
    { title: 'Register', description: 'User provides name, email, and password to create a new account.', detail: 'Account created as unverified. Verification email sent via queue.' },
    { title: 'Verify Email', description: 'User clicks the verification link in their email.', detail: 'Token must be valid and unused. Account status becomes active.' },
    { title: 'Select Product', description: 'User selects a SaaS product and a subscription plan.', detail: 'Free plan creates an active_free license immediately. Paid plan redirects to checkout.' },
    { title: 'Payment', description: 'Payment gateway processes the transaction.', detail: 'System validates webhook from Midtrans/Xendit before activating the license.' },
    { title: 'SSO Access', description: 'User logs into the SaaS app without entering credentials again.', detail: 'Hub issues a JWT RS256 token if the account and license are active.' },
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
          <span className="eyebrow">{isEn ? 'Interactive flow diagram' : 'Diagram alur interaktif'}</span>
          <h2 id="flow-heading">{isEn ? 'How does a member start using a product?' : 'Bagaimana seorang member mulai memakai produk?'}</h2>
        </div>
        <p>{isEn ? 'Select each step to see what happens.' : 'Pilih setiap tahap untuk melihat apa yang terjadi.'}</p>
      </div>
      <div className="flow-track" role="tablist" aria-label={isEn ? 'User journey' : 'Alur pengguna'}>
        {steps.map((item, index) => (
          <button key={item.title} role="tab" aria-selected={active === index} className={active === index ? 'flow-step active' : 'flow-step'} onClick={() => setActive(index)}>
            <b>{index + 1}</b><span>{item.title}</span>
          </button>
        ))}
      </div>
      <article className="flow-detail">
        <span>{isEn ? `Step ${active + 1} of ${steps.length}` : `Tahap ${active + 1} dari ${steps.length}`}</span>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
        <div className="flow-technical">
          <strong>{isEn ? 'Behind the scenes' : 'Di balik layar'}</strong>
          <p>{step.detail}</p>
        </div>
      </article>
    </section>
  )
}
