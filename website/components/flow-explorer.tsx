'use client'

import { useState } from 'react'

const steps = [
  { title: 'Daftar', description: 'Member mengisi nama, email, dan kata sandi untuk membuat akun baru.', detail: 'Akun dibuat dengan status unverified. Sistem mengirim email verifikasi melalui queue.' },
  { title: 'Verifikasi', description: 'Member membuka tautan verifikasi dari email.', detail: 'Token harus valid, belum dipakai, dan belum kedaluwarsa. Akun lalu menjadi active.' },
  { title: 'Aktifkan produk', description: 'Member memilih produk dan paket yang ingin digunakan.', detail: 'Paket Free langsung membuat lisensi active_free. Paket paid menuju checkout.' },
  { title: 'Pembayaran', description: 'Payment gateway memproses pembayaran paket berbayar.', detail: 'Midtrans atau Xendit mengirim webhook yang divalidasi sebelum lisensi aktif.' },
  { title: 'Akses lewat SSO', description: 'Member masuk ke aplikasi SaaS tanpa login ulang.', detail: 'Hub menerbitkan JWT RS256 bila akun dan lisensi masih memenuhi syarat akses.' },
]

export function FlowExplorer() {
  const [active, setActive] = useState(0)
  const step = steps[active]
  return <section className="flow-explorer" aria-labelledby="flow-heading">
    <div className="flow-heading"><div><span className="eyebrow">Diagram alur interaktif</span><h2 id="flow-heading">Bagaimana seorang member mulai memakai produk?</h2></div><p>Pilih setiap tahap untuk melihat apa yang terjadi.</p></div>
    <div className="flow-track" role="tablist" aria-label="Alur pengguna">
      {steps.map((item, index) => <button key={item.title} role="tab" aria-selected={active === index} className={active === index ? 'flow-step active' : 'flow-step'} onClick={() => setActive(index)}><b>{index + 1}</b><span>{item.title}</span></button>)}
    </div>
    <article className="flow-detail"><span>Tahap {active + 1} dari {steps.length}</span><h3>{step.title}</h3><p>{step.description}</p><div className="flow-technical"><strong>Di balik layar</strong><p>{step.detail}</p></div></article>
  </section>
}
