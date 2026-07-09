'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ThemePageClientProps {
  initialTheme: string
}

export default function ThemePageClient({ initialTheme }: ThemePageClientProps) {
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = useState(initialTheme)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSaveTheme() {
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: selectedTheme }),
      })

      if (res.ok) {
        setMessage('Tema başarıyla güncellendi.')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Tema güncellenemedi.')
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  const themes = [
    {
      key: 'MINIMAL',
      name: 'Minimal',
      bg: '#ffffff',
      text: '#0d0d0d',
      border: '#efefef',
      palette: ['#ffffff', '#0d0d0d', '#aaaaaa'],
      preview: 'Sade & Bol Boşluk',
      description: 'Klasik beyaz arka plan, zarif serif başlıklar ve geniş boşluklar ile sanat eserlerinizi ön plana çıkaran minimalist yaklaşım.'
    },
    {
      key: 'LUXURY',
      name: 'Luxury',
      bg: '#080808',
      text: '#e8e0d0',
      border: '#1f1a14',
      palette: ['#080808', '#c9a84c', '#e8e0d0'],
      preview: 'Karanlık & Altın Aksan',
      description: 'Zengin koyu lacivert/siyah tonlar, krem rengi metinler ve altın rengi detaylar ile premium bir deneyim sunan lüks tasarım.'
    },
    {
      key: 'MUSEUM',
      name: 'Museum',
      bg: '#f6efe4',
      text: '#1e160a',
      border: '#c8b89a',
      palette: ['#f6efe4', '#8b3a1f', '#9c7f5e'],
      preview: 'Klasik & Prestijli',
      description: 'Krem ve bej tonlarındaki arka planı, klasik grid düzeni ve profesyonel tipografisiyle geleneksel sanat galerisi hissi verir.'
    },
    {
      key: 'MODERN',
      name: 'Modern',
      bg: '#111827',
      text: '#f1f5f9',
      border: '#1e293b',
      palette: ['#111827', '#38bdf8', '#f1f5f9'],
      preview: 'Dinamik & Güncel',
      description: 'Açık gri tonlar, keskin sans-serif tipografi, asimetrik yerleşimler ve modern hatlar ile yenilikçi galeriler için ideal.'
    }
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tema Seçimi</h1>
          <p className="page-subtitle">Ziyaretçilerinizin göreceği public galerinizin tasarım stilini belirleyin.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success mb-6" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {message}
        </div>
      )}

      <div className="card mb-8">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }} className="mb-8">
          {themes.map(t => {
            const isSelected = selectedTheme === t.key
            return (
              <div
                key={t.key}
                onClick={() => setSelectedTheme(t.key)}
                style={{
                  border: `2.5px solid ${isSelected ? '#111' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transition: 'all 200ms ease',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  background: '#fff'
                }}
              >
                {/* Visual Preview */}
                <div style={{
                  background: t.bg,
                  color: t.text,
                  height: 140,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${t.border}`
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, letterSpacing: '1px' }}>
                    {t.name.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: t.key === 'MINIMAL' || t.key === 'MUSEUM' ? 'serif' : 'inherit'
                  }}>
                    Sanat Eseri
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {t.palette.map((color, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: color,
                          border: '1px solid var(--color-border)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</span>
                    {isSelected && (
                      <span className="badge badge-success">Seçili</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
                    {t.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
          <button
            onClick={handleSaveTheme}
            className={`btn btn-primary btn-lg ${saving ? 'btn-loading' : ''}`}
            disabled={saving || selectedTheme === initialTheme}
          >
            {saving ? '' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
