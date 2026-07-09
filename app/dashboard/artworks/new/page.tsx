'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewArtworkPage() {
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [description, setDescription] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [diameter, setDiameter] = useState('')
  const [material, setMaterial] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('TRY')
  const [externalLinkUrl, setExternalLinkUrl] = useState('')
  const [externalLinkType, setExternalLinkType] = useState('WEBSITE')
  
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleFileUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'ı geçemez.')
      return
    }
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'artwork')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setImageUrl(data.url)
      } else {
        setError(data.error || 'Dosya yüklenemedi.')
      }
    } catch {
      setError('Yükleme sırasında bir ağ hatası oluştu.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title) {
      setError('Eser başlığı zorunludur.')
      return
    }

    if (!imageUrl) {
      setError('Eser fotoğrafı zorunludur.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          artist: artist || null,
          description: description || null,
          dimensions: (width || height || diameter)
            ? [
                width && height ? `${width}x${height} cm` : width ? `En: ${width} cm` : height ? `Boy: ${height} cm` : '',
                diameter ? `Çap: ${diameter} cm` : ''
              ].filter(Boolean).join(' - ')
            : null,
          material: material || null,
          price: price ? parseFloat(price) : null,
          currency,
          externalLinkUrl: externalLinkUrl || null,
          externalLinkType: externalLinkUrl ? externalLinkType : null,
          imageUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Eser eklenemedi.')
      } else {
        router.push('/dashboard/artworks')
        router.refresh()
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <Link href="/dashboard/artworks" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 500 }}>
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: 12, height: 12 }}><polyline points="15 18 9 12 15 6"/></svg>
            Eserlere Dön
          </Link>
          <h1 className="page-title">Yeni Eser Ekle</h1>
          <p className="page-subtitle">Galerinizde sergilenmek üzere yeni bir sanat eseri yükleyin.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Artwork Photo Upload */}
        <div className="form-group">
          <label className="form-label">Eser Fotoğrafı <span className="required">*</span></label>
          
          {imageUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 20, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
              <img src={imageUrl} alt="Eser" style={{ maxHeight: 220, borderRadius: 8, objectFit: 'contain' }} />
              <button type="button" onClick={() => setImageUrl(null)} className="btn btn-danger btn-sm">Görseli Değiştir</button>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById('artworkUploadInput')?.click()}
              className={`upload-zone ${uploading ? 'drag-over' : ''}`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0])
              }}
            >
              <input
                id="artworkUploadInput"
                type="file"
                style={{ display: 'none' }}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={e => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0])
                }}
              />
              <svg className="upload-zone-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="upload-zone-text">{uploading ? 'Fotoğraf Yükleniyor...' : 'Görsel Sürükleyin veya Dosya Seçin'}</span>
              <span className="upload-zone-hint">PNG, JPG, JPEG veya WEBP · En fazla 10MB</span>
            </div>
          )}
        </div>

        {/* Title & Artist */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Eser Başlığı <span className="required">*</span></label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="Bulutların Ötesinde"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="artist">Sanatçı</label>
            <input
              id="artist"
              type="text"
              className="form-input"
              placeholder="Ahmet Yılmaz (Kendi eseriniz ise boş bırakabilirsiniz)"
              value={artist}
              onChange={e => setArtist(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="description">Eser Açıklaması</label>
          <textarea
            id="description"
            className="form-input form-textarea"
            placeholder="Eserin arkasındaki hikaye, kullanılan teknik veya ilham kaynağı..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Dimensions & Material */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Boyutlar (En x Boy / Çap cm)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div>
                <input
                  type="number"
                  className="form-input"
                  placeholder="En"
                  value={width}
                  onChange={e => setWidth(e.target.value)}
                  style={{ padding: '8px' }}
                />
              </div>
              <div>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Boy"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  style={{ padding: '8px' }}
                />
              </div>
              <div>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Çap"
                  value={diameter}
                  onChange={e => setDiameter(e.target.value)}
                  style={{ padding: '8px' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="material">Kullanılan Materyal / Teknik</label>
            <input
              id="material"
              type="text"
              className="form-input"
              placeholder="Örn: Tuval Üzerine Yağlıboya"
              value={material}
              onChange={e => setMaterial(e.target.value)}
            />
          </div>
        </div>

        {/* Price & Currency */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="price">Fiyat (Opsiyonel)</label>
            <input
              id="price"
              type="number"
              className="form-input"
              placeholder="Örn: 15000"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="currency">Para Birimi</label>
            <select
              id="currency"
              className="form-input"
              style={{ width: 100, minHeight: 43 }}
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              <option value="TRY">TRY (₺)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* External E-Commerce Links */}
        <div className="divider" style={{ margin: '8px 0' }} />
        
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Harici Satış & Satın Alma Bağlantısı</h3>
          <p className="text-muted text-sm mb-4">Eseriniz Shopify, Etsy, Instagram veya başka bir adreste satışta ise linkini buraya ekleyebilirsiniz.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="externalLinkUrl">Satın Alma Bağlantısı (URL)</label>
              <input
                id="externalLinkUrl"
                type="url"
                className="form-input"
                placeholder="https://etsy.com/listing/..."
                value={externalLinkUrl}
                onChange={e => setExternalLinkUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="externalLinkType">Bağlantı Türü</label>
              <select
                id="externalLinkType"
                className="form-input"
                style={{ minHeight: 43 }}
                value={externalLinkType}
                onChange={e => setExternalLinkType(e.target.value)}
              >
                <option value="WEBSITE">Kişisel Web Sitesi</option>
                <option value="SHOPIFY">Shopify Mağazası</option>
                <option value="ETSY">Etsy Mağazası</option>
                <option value="INSTAGRAM">Instagram Profili / Gönderisi</option>
                <option value="OTHER">Diğer Link</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divider" style={{ margin: '8px 0' }} />

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Link href="/dashboard/artworks" className="btn btn-secondary">
            İptal
          </Link>
          <button
            type="submit"
            className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`}
            disabled={submitting || uploading}
          >
            {submitting ? '' : 'Eseri Kaydet'}
          </button>
        </div>

      </form>
    </div>
  )
}
