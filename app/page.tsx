import Link from 'next/link'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Gallery.app — Dijital Sanat Galerinizi Dakikalar İçinde Açın',
  description: 'Kod yazmadan profesyonel dijital sanat galerisi oluşturun. Sanatçılar, galeriler, müzeler ve koleksiyonerler için.',
}

export default async function LandingPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (token) {
    const payload = await verifyToken(token)
    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      })
      if (!user) {
        cookieStore.delete('auth-token')
      }
    } else {
      cookieStore.delete('auth-token')
    }
  }
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* NAV */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, background: '#111', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'serif'
          }}>G</div>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.3px' }}>Gallery.app</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/login" className="btn btn-ghost btn-sm">Giriş Yap</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Ücretsiz Başla</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '96px 24px 80px', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        <div className="landing-hero-eyebrow">
          ✦ Sanatçılar, Galeriler, Müzeler için
        </div>
        <h1 className="landing-hero-title">
          Dijital Galerini<br />
          <span style={{ color: '#888' }}>Dakikalar İçinde</span> Aç
        </h1>
        <div className="landing-hero-subtitle" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <strong>Bir eser yükle, galerini aç — hepsi 1 dakika içinde.</strong>
          <em style={{ fontWeight: 'normal', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
            Galerine özel QR kod otomatik oluşturulur.
          </em>
          <em style={{ fontWeight: 'normal', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
            Renk, tema, iletişim bilgileri? Hepsini yönetim panelinden istediğin zaman düzenlersin.
          </em>
        </div>
        <div className="landing-hero-cta">
          <Link href="/register" className="btn btn-primary btn-lg">
            Ücretsiz Galeri Oluştur →
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Giriş Yap
          </Link>
        </div>
        <p style={{ marginTop: 24, fontSize: 12, color: '#bbb' }}>
          Kredi kartı gerekmez · 5 dakikada yayında
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 24px', background: '#fafafa', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p className="landing-section-label">Nasıl çalışır</p>
          <h2 className="landing-section-title">3 adımda yayında</h2>
          <p className="landing-section-subtitle">Teknik bilgiye gerek yok. İlk galerinizi bugün açın.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { n: 1, title: 'Kayıt Ol', desc: 'E-posta adresinizle saniyeler içinde hesap oluşturun. Kredi kartı gerekmez.' },
              { n: 2, title: 'Galerini Kişiselleştir', desc: 'Adım adım sihirbazla galeri adını, temasını ve ilk eserlerini ekle.' },
              { n: 3, title: 'Yayına Al', desc: 'Galerini gallery.app/senin-adın adresinde anında paylaş. QR kod otomatik oluşturulur.' },
            ].map(s => (
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THEMES */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p className="landing-section-label">Temalar</p>
          <h2 className="landing-section-title">Kişiliğine uygun tasarım</h2>
          <p className="landing-section-subtitle">4 farklı profesyonel temadan birini seç. İstediğin zaman değiştir.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { name: 'Minimal', bg: '#ffffff', text: '#111', accent: '#111', preview: 'Sade & Temiz' },
              { name: 'Luxury', bg: '#0a0a0a', text: '#f0ede6', accent: '#c9a84c', preview: 'Zarif & Premium' },
              { name: 'Museum', bg: '#f5f0eb', text: '#2d2417', accent: '#5c4a32', preview: 'Klasik & Prestijli' },
              { name: 'Modern', bg: '#f0f0f0', text: '#1a1a1a', accent: '#1a1a1a', preview: 'Dinamik & Güncel' },
            ].map(t => (
              <div key={t.name} className="landing-theme-card">
                <div style={{ background: t.bg, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                  <div style={{ width: 40, height: 52, background: t.accent, borderRadius: 4, opacity: 0.85 }} />
                  <div style={{ width: 60, height: 2, background: t.accent, opacity: 0.3, borderRadius: 99 }} />
                </div>
                <div style={{ padding: '12px 16px', background: '#fff' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{t.preview}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section style={{ padding: '80px 24px', background: '#fafafa', borderTop: '1px solid #eee' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="landing-section-title">Kim kullanabilir?</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 40 }}>
            {['🎨 Sanatçılar', '🏛 Sanat Galerileri', '🖼 Müzeler', '☕ Sanat Kafeler', '💎 Koleksiyonerler'].map(u => (
              <div key={u} style={{
                padding: '12px 24px', border: '1.5px solid #e8e8e8', borderRadius: 99,
                fontSize: 14, fontWeight: 500, background: '#fff',
                color: '#333',
              }}>{u}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section style={{ padding: '96px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 16 }}>
            Galerinizi bugün açın
          </h2>
          <p style={{ fontSize: 16, color: '#888', marginBottom: 40, lineHeight: 1.7 }}>
            Ücretsiz başlayın. Eserleri ekleyin. Dünyanızla paylaşın.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Ücretsiz Galeri Oluştur →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #eee', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, background: '#111', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, fontFamily: 'serif' }}>G</div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Gallery.app</span>
        </div>
        <p style={{ fontSize: 12, color: '#bbb' }}>© 2026 Gallery.app — Dijital Sanat Galerisi Platformu</p>
      </footer>
    </div>
  )
}
