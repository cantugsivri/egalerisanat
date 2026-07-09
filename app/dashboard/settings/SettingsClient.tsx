'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface GalleryData {
  name: string
  type: string
  logoUrl: string | null
  bio: string | null
  contactEmail: string | null
  website: string | null
  showArtworkName: boolean
  showArtworkNumber: boolean
  showArtworkPrice: boolean
}

interface SettingsClientProps {
  gallery: GalleryData
}

export default function SettingsClient({ gallery }: SettingsClientProps) {
  const router = useRouter()
  
  const [name, setName] = useState(gallery.name)
  const [type, setType] = useState(gallery.type)
  const [bio, setBio] = useState(gallery.bio || '')
  const [contactEmail, setContactEmail] = useState(gallery.contactEmail || '')
  const [website, setWebsite] = useState(gallery.website || '')
  
  const [logoUrl, setLogoUrl] = useState<string | null>(gallery.logoUrl)
  const [logoUploading, setLogoUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Display preferences
  const [showArtworkName, setShowArtworkName] = useState(gallery.showArtworkName)
  const [showArtworkNumber, setShowArtworkNumber] = useState(gallery.showArtworkNumber)
  const [showArtworkPrice, setShowArtworkPrice] = useState(gallery.showArtworkPrice)

  async function handleLogoUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo boyutu 5MB\'ı geçemez.')
      return
    }
    setLogoUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'logo')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setLogoUrl(data.url)
      } else {
        setError(data.error || 'Logo yüklenemedi.')
      }
    } catch {
      setError('Ağ hatası. Logo yüklenemedi.')
    } finally {
      setLogoUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          logoUrl,
          bio: bio || null,
          contactEmail: contactEmail || null,
          website: website || null,
          showArtworkName,
          showArtworkNumber,
          showArtworkPrice,
        }),
      })

      if (res.ok) {
        setMessage('Galeri ayarları başarıyla güncellendi.')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Ayarlar güncellenemedi.')
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Site Ayarları</h1>
          <p className="page-subtitle">Galerinizin genel bilgilerini, logo görselini ve iletişim adreslerini güncelleyin.</p>
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Gallery Info Section */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Galeri Bilgileri</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }} className="mb-4">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Galeri Adı <span className="required">*</span></label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="type">Kategori / Tür</label>
              <select
                id="type"
                className="form-input"
                style={{ minHeight: 43 }}
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="GALLERY">Sanat Galerisi</option>
                <option value="MUSEUM">Müze</option>
                <option value="ARTIST">Sanatçı / Ressam</option>
                <option value="CAFE">Sanat Kafe</option>
                <option value="COLLECTOR">Koleksiyoner</option>
                <option value="OTHER">Diğer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bio">Galeri Açıklaması / Bio</label>
            <textarea
              id="bio"
              className="form-input form-textarea"
              style={{ minHeight: 80 }}
              placeholder="Sanat galeriniz, tarihçeniz veya sanat anlayışınız hakkında kısa bilgi..."
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>
        </div>

        {/* Gallery Logo Section */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Galeri Logosu</h2>
          <p className="text-muted text-sm mb-4">Galerinizin üst kısmında ve paylaşımlarda görünecek logo görseli.</p>

          <div className="form-group">
            {logoUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 16, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
                <img src={logoUrl} alt="Logo" style={{ maxHeight: 60, objectFit: 'contain' }} />
                <button type="button" onClick={() => setLogoUrl(null)} className="btn btn-danger btn-sm">Logoyu Kaldır</button>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById('logoUploadInput')?.click()}
                className={`upload-zone ${logoUploading ? 'drag-over' : ''}`}
                style={{ padding: '24px 16px' }}
              >
                <input
                  id="logoUploadInput"
                  type="file"
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  onChange={e => {
                    if (e.target.files?.[0]) handleLogoUpload(e.target.files[0])
                  }}
                />
                <svg className="upload-zone-icon" style={{ width: 32, height: 32 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="upload-zone-text" style={{ fontSize: 13 }}>{logoUploading ? 'Yükleniyor...' : 'Görsel Sürükleyin veya Dosya Seçin'}</span>
                <span className="upload-zone-hint">PNG, JPG, WEBP veya SVG · En fazla 5MB</span>
              </div>
            )}
          </div>
        </div>

        {/* Display Preferences Section */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Galeri Anasayfa Görünümü</h2>
          <p className="text-muted text-sm mb-5">Ziyaretçilerin eser kartlarında hangi bilgilerin görüneceğini seçin. Eser detay sayfasında tüm bilgiler her zaman görünür.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Eser Adı */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              border: `2px solid ${showArtworkName ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              background: showArtworkName ? 'rgba(var(--color-primary-rgb, 0,0,0), 0.03)' : '#fff',
              transition: 'all 200ms ease',
            }}>
              <input
                type="checkbox"
                checked={showArtworkName}
                onChange={e => setShowArtworkName(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Eser Adı</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  Kart üzerinde eserin başlığını gösterir (örn. "Bulutların Ötesinde")
                </div>
              </div>
            </label>

            {/* Eser Numarası */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              border: `2px solid ${showArtworkNumber ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              background: showArtworkNumber ? 'rgba(var(--color-primary-rgb, 0,0,0), 0.03)' : '#fff',
              transition: 'all 200ms ease',
            }}>
              <input
                type="checkbox"
                checked={showArtworkNumber}
                onChange={e => setShowArtworkNumber(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Eser Numarası</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  İlk eklenen eser #1, ikinci #2 olarak galeriye ekleniş sırasına göre numaralanır
                </div>
              </div>
            </label>

            {/* Eser Fiyatı */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              border: `2px solid ${showArtworkPrice ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              background: showArtworkPrice ? 'rgba(var(--color-primary-rgb, 0,0,0), 0.03)' : '#fff',
              transition: 'all 200ms ease',
            }}>
              <input
                type="checkbox"
                checked={showArtworkPrice}
                onChange={e => setShowArtworkPrice(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Eser Fiyatı</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  Fiyat girilmiş eserlerde fiyatı kart üzerinde gösterir (örn. "15.000 TRY")
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>İletişim Bilgileri</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="contactEmail">İletişim E-postası (Ziyaretçiler için)</label>
              <input
                id="contactEmail"
                type="email"
                className="form-input"
                placeholder="iletisim@galerim.com"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="website">Harici Web Siteniz (İsteğe bağlı)</label>
              <input
                id="website"
                type="url"
                className="form-input"
                placeholder="https://www.benimsitem.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Custom Domain Section (Faz 2 Placeholder) */}
        <div className="card" style={{ opacity: 0.7, background: '#f5f5f5', cursor: 'not-allowed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Özel Alan Adı (Custom Domain)</h2>
            <span className="badge badge-warning">Faz 2 (Yakında)</span>
          </div>
          <p className="text-muted text-sm">
            Galerinizi kendi özel alan adınızda (örn: <code>galerim.com</code>) yayınlayın. Çok yakında aktif edilecektir.
          </p>
          <input
            type="text"
            className="form-input"
            style={{ marginTop: 12, pointerEvents: 'none' }}
            placeholder="www.galerim.com"
            disabled
          />
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className={`btn btn-primary btn-lg ${saving ? 'btn-loading' : ''}`}
            disabled={saving}
          >
            {saving ? '' : 'Ayarları Kaydet'}
          </button>
        </div>

      </form>
    </div>
  )
}
