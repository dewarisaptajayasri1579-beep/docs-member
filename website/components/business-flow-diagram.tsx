'use client'
import { useState } from 'react'

/* ── Types ─────────────────────────────────────────────────── */
type Kind = 'pill' | 'step' | 'sys' | 'dec' | 'ok' | 'warn' | 'fail'

interface N {
  id: string; cx: number; cy: number; w: number; h: number
  kind: Kind; label: string; sub?: string; info?: string
}
interface E {
  pts: number[][]; label?: string; lx?: number; ly?: number; back?: boolean
}
interface Flow {
  id: string; emoji: string; title: string
  vb: string; nodes: N[]; edges: E[]
}

/* ── Palette ───────────────────────────────────────────────── */
const STYLE: Record<Kind, { fill: string; stroke: string; text: string; sub: string }> = {
  pill: { fill: '#1a1430', stroke: '#a78bfa', text: '#a78bfa', sub: '#7c6dc4' },
  step: { fill: '#181820', stroke: '#3a3a50', text: '#f0eeff', sub: '#8886a4' },
  sys:  { fill: '#0f172a', stroke: '#3b82f6', text: '#93c5fd', sub: '#5e8ab4' },
  dec:  { fill: '#1c1500', stroke: '#f59e0b', text: '#fcd34d', sub: '#b8882a' },
  ok:   { fill: '#052e1a', stroke: '#10b981', text: '#6ee7b7', sub: '#2d8a5e' },
  warn: { fill: '#2a1a00', stroke: '#f59e0b', text: '#fcd34d', sub: '#b8882a' },
  fail: { fill: '#2a0a0a', stroke: '#ef4444', text: '#fca5a5', sub: '#b83434' },
}

/* ── Flow data ─────────────────────────────────────────────── */
const getFlows = (lang: string): Flow[] => [
  /* ── 1. CHECKOUT & PAYMENT ───────────────────────────────── */
  {
    id: 'chk', emoji: '🛒', title: lang === 'en' ? 'Checkout Flow' : lang === 'ja' ? 'チェックアウトフロー' : 'Checkout Flow',
    vb: '0 0 820 570',
    nodes: [
      { id:'p', cx:410,cy:26, w:220,h:42, kind:'step', label:lang === 'en' ? 'Select Product' : lang === 'ja' ? '製品を選択' : 'Pilih Produk', sub:lang === 'en' ? 'from SaaS Catalog' : lang === 'ja' ? 'SaaSカタログから' : 'dari Katalog SaaS', info:lang === 'en' ? 'Only active products shown. Purchased products marked as "Active".' : lang === 'ja' ? 'アクティブな製品のみが表示されます。購入済みの製品は「アクティブ」とマークされます。' : 'Hanya produk aktif yang ditampilkan. Produk yang sudah diaktifkan ditandai "Sudah Aktif".' },
      { id:'t', cx:410,cy:96, w:220,h:42, kind:'step', label:lang === 'en' ? 'Select Plan' : lang === 'ja' ? 'プランを選択' : 'Pilih Paket', info:lang === 'en' ? 'Free Forever, Pro Monthly, or Pro Yearly. Prices are snapshotted.' : lang === 'ja' ? 'Free Forever、Pro Monthly、またはPro Yearly。価格はスナップショットされます。' : 'Free Forever, Pro Monthly, atau Pro Yearly. Harga disimpan sebagai snapshot saat order dibuat.' },
      { id:'q', cx:410,cy:172,w:220,h:42, kind:'dec',  label:lang === 'en' ? 'Free Forever Plan?' : lang === 'ja' ? 'Free Foreverプラン？' : 'Paket Free Forever?', info:lang === 'en' ? 'Free plans skip payment and activate directly.' : lang === 'ja' ? '無料プランは支払いをスキップして直接アクティブ化します。' : 'Paket free tidak memerlukan pembayaran. Langsung dibuat tanpa order/payment.' },
      { id:'fa',cx:155,cy:270,w:200,h:42, kind:'sys',  label:lang === 'en' ? 'Direct Activation' : lang === 'ja' ? '直接アクティベーション' : 'Aktivasi Langsung', sub:'POST /licenses/activate-free', info:lang === 'en' ? 'active_free license created. Unique License-ID generated.' : lang === 'ja' ? 'active_freeライセンスが作成されました。一意のLicense-IDが生成されます。' : 'Lisensi active_free dibuat. License-ID unik di-generate dan dikirim via email.' },
      { id:'or',cx:655,cy:270,w:210,h:42, kind:'step', label:lang === 'en' ? 'Create Order' : lang === 'ja' ? '注文を作成' : 'Buat Order', sub:'Header: Idempotency-Key', info:lang === 'en' ? 'Idempotency key prevents duplicates. Status: pending_payment.' : lang === 'ja' ? 'べき等キーにより重複を防ぎます。ステータス：支払い保留中。' : 'Cek idempotency key mencegah order duplikat. Status: pending_payment.' },
      { id:'py',cx:655,cy:346,w:210,h:42, kind:'step', label:lang === 'en' ? 'Pay at Gateway' : lang === 'ja' ? 'ゲートウェイで支払い' : 'Bayar di Gateway', sub:'Midtrans / Xendit', info:lang === 'en' ? 'User redirected to hosted payment page.' : lang === 'ja' ? 'ユーザーはホストされた支払いページにリダイレクトされます。' : 'Member diarahkan ke hosted payment page. Mendukung Transfer, GoPay, OVO, QRIS.' },
      { id:'wh',cx:655,cy:422,w:210,h:42, kind:'sys',  label:lang === 'en' ? 'Webhook Settlement' : lang === 'ja' ? 'Webhook 決済' : 'Webhook Settlement', sub:lang === 'en' ? 'Validate signature + amount' : lang === 'ja' ? '署名と金額の検証' : 'Validasi signature + amount', info:lang === 'en' ? 'Atomic: payment, order, license updated together.' : lang === 'ja' ? 'アトミック：支払い、注文、ライセンスが一緒に更新されます。' : 'Atomik: payment, order, license, dan audit log berhasil bersama atau gagal bersama.' },
      { id:'li',cx:410,cy:524,w:240,h:44, kind:'ok',   label:lang === 'en' ? 'License ACTIVE ✓' : lang === 'ja' ? 'ライセンス アクティブ ✓' : 'Lisensi AKTIF ✓', sub:'NTO-XXXX-XXXX-XXXX', info:lang === 'en' ? 'License-ID unchanged on renewal.' : lang === 'ja' ? '更新時にLicense-IDは変更されません。' : 'License-ID tidak berubah saat renewal. Free = active_free, Paid = active.' },
    ],
    edges: [
      { pts:[[410,47],[410,75]] },
      { pts:[[410,117],[410,151]] },
      { pts:[[410,193],[410,232],[155,232],[155,249]], label:lang === 'en' ? 'Yes (Free)' : lang === 'ja' ? 'はい（無料）' : 'Ya (Free)', lx:256, ly:226 },
      { pts:[[410,193],[410,232],[655,232],[655,249]], label:lang === 'en' ? 'No (Paid)' : lang === 'ja' ? 'いいえ（有料）' : 'Tidak (Paid)', lx:540, ly:226 },
      { pts:[[655,291],[655,325]] },
      { pts:[[655,367],[655,401]] },
      { pts:[[155,291],[155,502],[290,502]] },
      { pts:[[655,443],[655,502],[531,502]] },
    ],
  },

  /* ── 2. EXCEPTION FLOW ───────────────────────────────────── */
  {
    id: 'exc', emoji: '⚠️', title: lang === 'en' ? 'Exception Flow' : lang === 'ja' ? '例外フロー' : 'Exception Flow',
    vb: '0 0 740 520',
    nodes: [
      { id:'in', cx:370,cy:26, w:220,h:42, kind:'step', label:lang === 'en' ? 'System Request' : lang === 'ja' ? 'システムリクエスト' : 'Permintaan Sistem', sub:lang === 'en' ? 'Login / Checkout / Webhook' : lang === 'ja' ? 'ログイン/チェックアウト/Webhook' : 'Login / Checkout / Webhook', info:lang === 'en' ? 'Any process that requires validation or external calls.' : lang === 'ja' ? '検証または外部呼び出しを必要とする任意のプロセス。' : 'Permintaan masuk (contoh: mencoba login, bayar order, SSO).' },
      { id:'val',cx:370,cy:110,w:260,h:42, kind:'dec',  label:lang === 'en' ? 'Validation Check' : lang === 'ja' ? '検証チェック' : 'Pengecekan Validasi', info:lang === 'en' ? 'Check business rules, credentials, data validity.' : lang === 'ja' ? 'ビジネスルール、資格情報、データの有効性を確認します。' : 'Mengecek apakah email valid, order belum expired, atau signature cocok.' },
      { id:'ok', cx:160,cy:220,w:200,h:42, kind:'ok',   label:lang === 'en' ? 'Process Success' : lang === 'ja' ? 'プロセス成功' : 'Proses Sukses', info:lang === 'en' ? 'Normal happy path execution.' : lang === 'ja' ? '通常のハッピーパス実行。' : 'Proses berjalan lancar sesuai harapan (Happy Path).' },
      { id:'err',cx:580,cy:220,w:220,h:42, kind:'fail', label:lang === 'en' ? 'Validation Failed' : lang === 'ja' ? '検証失敗' : 'Validasi Gagal', sub:lang === 'en' ? 'Invalid, Expired, Missing' : lang === 'ja' ? '無効、期限切れ、欠落' : 'Tidak valid, Expired, Salah', info:lang === 'en' ? 'Exception triggered: EX-PAY-01, EX-LOGIN-01, etc.' : lang === 'ja' ? '例外トリガー: EX-PAY-01、EX-LOGIN-01 など。' : 'Pengecualian terjadi. Kode EX-PAY-01, EX-SSO-03, dll.' },
      { id:'log',cx:580,cy:310,w:220,h:42, kind:'sys',  label:lang === 'en' ? 'Record to Audit Log' : lang === 'ja' ? '監査ログに記録' : 'Catat di Audit Log', info:lang === 'en' ? 'Save internal trace details for Super Admin debugging.' : lang === 'ja' ? 'Super Admin のデバッグ用に内部トレースの詳細を保存します。' : 'Catat log internal, tidak ditampilkan ke user. Berguna untuk audit.' },
      { id:'res',cx:580,cy:400,w:220,h:44, kind:'warn', label:lang === 'en' ? 'Informative Error' : lang === 'ja' ? '情報提供エラー' : 'Error Informatif', sub:'HTTP 4xx / 5xx', info:lang === 'en' ? 'Fail gracefully. Provide actionable feedback to user.' : lang === 'ja' ? '正常に失敗します。ユーザーに実用的なフィードバックを提供します。' : 'Kembalikan pesan yang sopan dan jelas agar user tahu apa yang harus dilakukan.' },
      { id:'rt', cx:370,cy:400,w:140,h:42, kind:'step', label:lang === 'en' ? 'User Retry' : lang === 'ja' ? 'ユーザー再試行' : 'User Coba Lagi', info:lang === 'en' ? 'User fixes input and tries again.' : lang === 'ja' ? 'ユーザーは入力を修正して再試行します。' : 'User memperbaiki kesalahan lalu mengulang request.' }
    ],
    edges: [
      { pts:[[370,47],[370,89]] },
      { pts:[[370,131],[370,175],[160,175],[160,199]], label:lang === 'en' ? 'Valid' : lang === 'ja' ? '有効' : 'Valid', lx:250, ly:168 },
      { pts:[[370,131],[370,175],[580,175],[580,199]], label:lang === 'en' ? 'Invalid' : lang === 'ja' ? '無効' : 'Tidak Valid', lx:490, ly:168 },
      { pts:[[580,241],[580,289]] },
      { pts:[[580,331],[580,378]] },
      { pts:[[470,400],[440,400]], back:true },
      { pts:[[300,400],[100,400],[100,26],[260,26]], back:true, label:lang === 'en' ? '↑ Restart Flow' : lang === 'ja' ? '↑ フロー再開' : '↑ Ulangi Flow', lx:100, ly:200 }
    ]
  },

  /* ── 3. SSO LOGIN ────────────────────────────────────────── */
  {
    id: 'sso', emoji: '🔐', title: lang === 'en' ? 'SSO Login Flow' : lang === 'ja' ? 'SSO ログイン フロー' : 'SSO Login Flow',
    vb: '0 0 700 580',
    nodes: [
      { id:'o', cx:350,cy:26, w:220,h:42, kind:'step', label:lang === 'en' ? 'Open SaaS App' : lang === 'ja' ? 'SaaSアプリを開く' : 'Buka Produk SaaS', info:lang === 'en' ? 'User clicks "Open App" from Hub dashboard.' : lang === 'ja' ? 'ユーザーはHubダッシュボードから「アプリを開く」をクリックします。' : 'Member klik "Buka Aplikasi" dari dashboard Hub.' },
      { id:'a', cx:350,cy:96, w:240,h:42, kind:'sys',  label:lang === 'en' ? 'Redirect to /oauth' : lang === 'ja' ? '/oauth にリダイレクト' : 'Redirect ke /oauth/authorize', sub:'PKCE + state + scope', info:lang === 'en' ? 'Hub validates client_id and redirect_uri.' : lang === 'ja' ? 'Hubはclient_idとredirect_uriを検証します。' : 'SaaS mengirim code_challenge PKCE. Hub memvalidasi client_id dan redirect_uri.' },
      { id:'v', cx:350,cy:166,w:240,h:42, kind:'sys',  label:lang === 'en' ? 'Validate Session & License' : lang === 'ja' ? 'セッションとライセンスを検証' : 'Hub validasi sesi & lisensi', info:lang === 'en' ? 'Check: active account and valid license.' : lang === 'ja' ? '確認：アクティブなアカウントと有効なライセンス。' : 'Cek: akun active, lisensi active/active_free/grace_period untuk produk ini.' },
      { id:'q', cx:350,cy:242,w:200,h:42, kind:'dec',  label:lang === 'en' ? 'Access Granted?' : lang === 'ja' ? 'アクセス許可？' : 'Akses diizinkan?', info:lang === 'en' ? 'Suspended or missing license → denied.' : lang === 'ja' ? '一時停止中またはライセンスがない場合 → 拒否。' : 'Lisensi suspended, tidak ada, atau akun non-active → ditolak.' },
      { id:'c', cx:165,cy:334,w:200,h:42, kind:'sys',  label:lang === 'en' ? 'Authorization Code' : lang === 'ja' ? '認証コード' : 'Authorization Code', sub:lang === 'en' ? 'One-time · ~1 min' : lang === 'ja' ? '使い捨て · 約1分' : 'Sekali pakai · ~1 menit', info:lang === 'en' ? 'Code hashed in DB. Bound to client and PKCE.' : lang === 'ja' ? 'コードはDBにハッシュ化されます。クライアントとPKCEにバインドされます。' : 'Code-hash disimpan di DB. Terikat pada client, redirect URI, dan PKCE.' },
      { id:'x', cx:545,cy:334,w:175,h:42, kind:'fail', label:lang === 'en' ? 'Access Denied' : lang === 'ja' ? 'アクセス拒否' : 'Akses Ditolak', sub:'403 license_inactive', info:lang === 'en' ? 'No token issued. SaaS shows error.' : lang === 'ja' ? 'トークンは発行されません。SaaSはエラーを表示します。' : 'Token tidak diterbitkan. SaaS menampilkan pesan error yang sesuai.' },
      { id:'t', cx:165,cy:410,w:200,h:42, kind:'sys',  label:lang === 'en' ? 'Token Exchange' : lang === 'ja' ? 'トークン交換' : 'Token Exchange', sub:'POST /oauth/token', info:lang === 'en' ? 'Code exchanged for access + refresh token.' : lang === 'ja' ? 'アクセスおよびリフレッシュトークンと交換されるコード。' : 'Code ditukar dengan access token + refresh token. Code langsung di-mark used.' },
      { id:'j', cx:165,cy:486,w:200,h:42, kind:'ok',   label:'JWT RS256 ✓', sub:lang === 'en' ? 'Valid for 1 hour' : lang === 'ja' ? '1時間有効' : 'Berlaku 1 jam', info:lang === 'en' ? 'Claims: member_id, license_key. Verified via JWKS.' : lang === 'ja' ? 'クレーム：member_id、license_key。JWKS経由で検証。' : 'Claim: member_id, email, license_key, tier, product. SaaS verifikasi via JWKS.' },
      { id:'ac',cx:165,cy:542,w:200,h:42, kind:'pill', label:lang === 'en' ? '🎉 App Access' : lang === 'ja' ? '🎉 アプリアクセス' : '🎉 Akses Produk', info:lang === 'en' ? 'User accesses SaaS smoothly.' : lang === 'ja' ? 'ユーザーはスムーズにSaaSにアクセスします。' : 'Member menggunakan SaaS tanpa login ulang. Refresh token dapat memperbarui akses.' },
    ],
    edges: [
      { pts:[[350,47],[350,75]] },
      { pts:[[350,117],[350,145]] },
      { pts:[[350,187],[350,221]] },
      { pts:[[350,263],[350,308],[165,308],[165,313]], label:lang === 'en' ? 'Yes' : lang === 'ja' ? 'はい' : 'Ya', lx:238, ly:303 },
      { pts:[[350,263],[350,308],[545,308],[545,313]], label:lang === 'en' ? 'No' : lang === 'ja' ? 'いいえ' : 'Tidak', lx:455, ly:303 },
      { pts:[[165,355],[165,389]] },
      { pts:[[165,431],[165,465]] },
      { pts:[[165,507],[165,521]] },
    ],
  },
]

/* ── SVG Node renderer ─────────────────────────────────────── */
function SvgNode({ n, active, onClick }: { n: N; active: boolean; onClick: () => void }) {
  const s = STYLE[n.kind]
  const rx = n.kind === 'pill' ? 20 : 8
  const hasGlow = active
  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={n.label}
    >
      {hasGlow && (
        <rect
          x={n.cx - n.w / 2 - 4} y={n.cy - n.h / 2 - 4}
          width={n.w + 8} height={n.h + 8}
          rx={rx + 2} fill="none"
          stroke={s.stroke} strokeWidth={1.5}
          opacity={0.3}
        />
      )}
      <rect
        x={n.cx - n.w / 2} y={n.cy - n.h / 2}
        width={n.w} height={n.h} rx={rx}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={active ? 1.5 : 1}
      />
      <text
        x={n.cx} y={n.cy - (n.sub ? 6 : 0)}
        textAnchor="middle" dominantBaseline="middle"
        fill={s.text} fontSize={12} fontWeight={600}
        fontFamily="Inter, sans-serif"
      >
        {n.label}
      </text>
      {n.sub && (
        <text
          x={n.cx} y={n.cy + 11}
          textAnchor="middle" dominantBaseline="middle"
          fill={s.sub} fontSize={10} fontFamily="Inter, sans-serif"
        >
          {n.sub}
        </text>
      )}
    </g>
  )
}

/* ── SVG Edge renderer ─────────────────────────────────────── */
function SvgEdge({ e }: { e: E }) {
  const pts = e.pts.map(([x, y]) => `${x},${y}`).join(' ')
  const color = e.back ? 'var(--dim)' : 'var(--muted)'
  const last = e.pts[e.pts.length - 1]
  const prev = e.pts[e.pts.length - 2]
  // compute arrow direction
  const dx = last[0] - prev[0], dy = last[1] - prev[1]
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len, uy = dy / len
  const ax = last[0] - ux * 10, ay = last[1] - uy * 10
  const perp = 4
  const arrow = `M ${last[0]},${last[1]} L ${ax - uy * perp},${ay + ux * perp} L ${ax + uy * perp},${ay - ux * perp} Z`

  return (
    <g>
      <polyline
        points={pts}
        fill="none" stroke={color}
        strokeWidth={1.2}
        strokeDasharray={e.back ? '4 3' : undefined}
      />
      <path d={arrow} fill={color} />
      {e.label && e.lx != null && e.ly != null && (
        <text
          x={e.lx} y={e.ly}
          textAnchor="middle"
          fill="var(--dim)" fontSize={10}
          fontFamily="Inter, sans-serif"
        >
          {e.label}
        </text>
      )}
    </g>
  )
}

/* ── Main component ────────────────────────────────────────── */
export function BusinessFlowDiagram({ lang = 'id', defaultTab = 0 }: { lang?: string, defaultTab?: number }) {
  const isEn = lang === 'en'
  const [tab, setTab] = useState(defaultTab)
  const [active, setActive] = useState<string | null>(null)
  const flowData = getFlows(lang)
  const flow = flowData[tab]
  const activeNode = flow.nodes.find(n => n.id === active)

  const handleTabChange = (i: number) => { setTab(i); setActive(null) }

  return (
    <section className="fd-wrap" aria-labelledby="fd-heading">
      <div className="fd-header">
        <div>
          <span className="eyebrow">{lang === 'en' ? 'Interactive Flow Diagram' : lang === 'ja' ? 'インタラクティブフロー図' : 'Diagram Alur Interaktif'}</span>
          <h2 id="fd-heading">{lang === 'en' ? 'Membership System Visualization' : lang === 'ja' ? 'メンバーシップシステムの可視化' : 'Visualisasi Sistem Membership'}</h2>
          <p>{lang === 'en' ? 'Click a node to view technical details of each stage.' : lang === 'ja' ? '各段階の技術的な詳細を見るには、ノードをクリックしてください。' : 'Klik node untuk melihat detail teknis setiap tahap.'}</p>
        </div>
        <nav className="fd-tabs" role="tablist">
          {flowData.map((f, i) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={tab === i}
              className={`fd-tab${tab === i ? ' active' : ''}`}
              onClick={() => handleTabChange(i)}
            >
              <span>{f.emoji}</span> {lang === 'en' ? (i === 0 ? 'Registration' : i === 1 ? 'Activation' : i === 2 ? 'SSO Login' : 'Lifecycle') : lang === 'ja' ? (i === 0 ? '登録' : i === 1 ? 'アクティベーション' : i === 2 ? 'SSO ログイン' : 'ライフサイクル') : f.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="fd-body">
        <div className="fd-svg-wrap">
          <svg
            viewBox={flow.vb}
            width="100%"
            style={{ overflow: 'visible', display: 'block' }}
            aria-label={`Diagram alur ${flow.title}`}
          >
            {/* Edges first (behind nodes) */}
            {flow.edges.map((e, i) => <SvgEdge key={i} e={e} />)}
            {/* Nodes */}
            {flow.nodes.map(n => (
              <SvgNode
                key={n.id} n={n}
                active={active === n.id}
                onClick={() => setActive(active === n.id ? null : n.id)}
              />
            ))}
          </svg>
        </div>

        <aside className="fd-info">
          {activeNode ? (
            <>
              <div className="fd-info-badge" data-kind={activeNode.kind}>
                {activeNode.kind === 'ok' ? (lang === 'en' ? '✓ Success' : lang === 'ja' ? '✓ 成功' : '✓ Sukses')
                  : activeNode.kind === 'fail' ? (lang === 'en' ? '✕ Error' : lang === 'ja' ? '✕ エラー' : '✕ Error')
                  : activeNode.kind === 'warn' ? (lang === 'en' ? '⚠ Warning' : lang === 'ja' ? '⚠ 警告' : '⚠ Peringatan')
                  : activeNode.kind === 'dec' ? (lang === 'en' ? '◆ Decision' : lang === 'ja' ? '◆ 決定' : '◆ Keputusan')
                  : activeNode.kind === 'sys' ? (lang === 'en' ? '⚙ System' : lang === 'ja' ? '⚙ システム' : '⚙ Sistem')
                  : activeNode.kind === 'pill' ? '● Start / End'
                  : (lang === 'en' ? '→ Process' : lang === 'ja' ? '→ プロセス' : '→ Proses')}
              </div>
              <h3>{activeNode.label}</h3>
              {activeNode.sub && <p className="fd-info-sub">{activeNode.sub}</p>}
              <p className="fd-info-desc">{activeNode.info ?? (lang === 'en' ? 'No additional details.' : lang === 'ja' ? '追加の詳細はありません。' : 'Tidak ada keterangan tambahan.')}</p>
            </>
          ) : (
            <div className="fd-info-empty">
              <span>👆</span>
              <p>{lang === 'en' ? 'Click any node to view its technical explanation.' : lang === 'ja' ? 'ノードをクリックして技術的な説明を表示します。' : 'Klik salah satu node untuk melihat penjelasan teknisnya.'}</p>
            </div>
          )}

          <div className="fd-legend">
            <p>{lang === 'en' ? 'Color Legend:' : lang === 'ja' ? '色の凡例:' : 'Keterangan warna:'}</p>
            {([
              ['ok',   lang === 'en' ? 'Success' : lang === 'ja' ? '成功' : 'Berhasil'],
              ['warn', lang === 'en' ? 'Warning' : lang === 'ja' ? '警告' : 'Peringatan'],
              ['fail', lang === 'en' ? 'Error / Blocked' : lang === 'ja' ? 'エラー / ブロック' : 'Error / Blokir'],
              ['sys',  lang === 'en' ? 'System Action' : lang === 'ja' ? 'システムアクション' : 'Aksi Sistem'],
              ['dec',  lang === 'en' ? 'Decision' : lang === 'ja' ? '決定' : 'Keputusan'],
              ['step', lang === 'en' ? 'Process' : lang === 'ja' ? 'プロセス' : 'Proses'],
            ] as [Kind, string][]).map(([k, label]) => (
              <div key={k} className="fd-legend-item">
                <span className="fd-dot" data-kind={k} />
                {label}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
