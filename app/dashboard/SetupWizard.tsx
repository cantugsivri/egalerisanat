'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface SetupWizardProps {
  userName: string
}

export default function SetupWizard({ userName }: SetupWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1: Galeri Adı
  const [galleryName, setGalleryName] = useState('')

  // Step 2: Galeri Türü & Slug
  const [galleryType, setGalleryType] = useState('GALLERY') // GALLERY, MUSEUM, ARTIST, CAFE, COLLECTOR, OTHER
  const [slug, setSlug] = useState('')
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugError, setSlugError] = useState('')

  // Step 3: Logo Yükleme
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)

  // Step 4: Tema Seçimi
  const [theme, setTheme] = useState('MINIMAL') // MINIMAL, LUXURY, MUSEUM, MODERN

  const [artworkTitle, setArtworkTitle] = useState('')
  const [artworkArtist, setArtworkArtist] = useState('')
  const [artworkDescription, setArtworkDescription] = useState('')
  const [artworkWidth, setArtworkWidth] = useState('')
  const [artworkHeight, setArtworkHeight] = useState('')
  const [artworkDiameter, setArtworkDiameter] = useState('')
  const [artworkMaterial, setArtworkMaterial] = useState('')
  const [artworkPrice, setArtworkPrice] = useState('')
  const [artworkCurrency, setArtworkCurrency] = useState('TRY')
  const [artworkExternalUrl, setArtworkExternalUrl] = useState('')
  const [artworkExternalType, setArtworkExternalType] = useState('WEBSITE')
  const [artworkImageUrl, setArtworkImageUrl] = useState<string | null>(null)
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [artworkUploading, setArtworkUploading] = useState(false)
  const [artworkError, setArtworkError] = useState('')

  // Step 6: Özet & Galeriyi Oluştur
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Step 7: QR Kod
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')

  // Check Slug availability on slug input change
  useEffect(() => {
    if (!slug) {
      setSlugAvailable(null)
      setSlugError('')
      return
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (cleanSlug !== slug) {
      setSlug(cleanSlug)
    }

    if (cleanSlug.length < 3) {
      setSlugAvailable(false)
      setSlugError('URL en az 3 karakter olmalıdır.')
      return
    }

    setSlugChecking(true)
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/gallery/check-slug?slug=${cleanSlug}`)
        const data = await res.json()
        if (data.error) {
          setSlugAvailable(false)
          setSlugError(data.error)
        } else {
          setSlugAvailable(data.available)
          setSlugError(data.available ? '' : 'Bu URL zaten kullanımda.')
        }
      } catch {
        setSlugAvailable(false)
        setSlugError('Kontrol edilirken bir hata oluştu.')
      } finally {
        setSlugChecking(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [slug])

  // Helper to auto-fill slug from gallery name
  const handleGalleryNameChange = (val: string) => {
    setGalleryName(val)
    if (step === 1 && !slug) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // spaces to hyphens
        .replace(/-+/g, '-') // collapse multiple hyphens
      setSlug(generatedSlug)
    }
  }

  // Upload handlers
  const handleLogoUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan büyük olamaz.')
      return
    }
    setLogoUploading(true)
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
        alert(data.error || 'Yükleme başarısız.')
      }
    } catch {
      alert('Yükleme hatası.')
    } finally {
      setLogoUploading(false)
    }
  }

  const handleArtworkUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setArtworkError('Dosya boyutu 10MB\'dan büyük olamaz.')
      return
    }
    setArtworkUploading(true)
    setArtworkError('')
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
        setArtworkImageUrl(data.url)
      } else {
        setArtworkError(data.error || 'Yükleme başarısız.')
      }
    } catch {
      setArtworkError('Yükleme hatası.')
    } finally {
      setArtworkUploading(false)
    }
  }

  // Submit gallery & first artwork
  const handleCreateGallery = async () => {
    setSubmitting(true)
    setSubmitError('')

    try {
      // 1. Create Gallery
      const galleryRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: galleryName,
          slug,
          type: galleryType,
          logoUrl,
          theme,
          bio: `${galleryName} dijital sanat galerisine hoş geldiniz.`
        }),
      })

      const galleryData = await galleryRes.json()

      if (!galleryRes.ok) {
        setSubmitError(galleryData.error || 'Galeri oluşturulamadı.')
        setSubmitting(false)
        return
      }

      // 2. Create Artwork (if filled in Step 5)
      if (artworkTitle && artworkImageUrl) {
        const artworkRes = await fetch('/api/artworks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: artworkTitle,
            artist: artworkArtist || null,
            description: artworkDescription || null,
            dimensions: (artworkWidth || artworkHeight || artworkDiameter)
              ? [
                  artworkWidth && artworkHeight ? `${artworkWidth}x${artworkHeight} cm` : artworkWidth ? `En: ${artworkWidth} cm` : artworkHeight ? `Boy: ${artworkHeight} cm` : '',
                  artworkDiameter ? `Çap: ${artworkDiameter} cm` : ''
                ].filter(Boolean).join(' - ')
              : null,
            material: artworkMaterial || null,
            price: artworkPrice ? parseFloat(artworkPrice) : null,
            currency: artworkCurrency,
            externalLinkUrl: artworkExternalUrl || null,
            externalLinkType: artworkExternalUrl ? artworkExternalType : null,
            imageUrl: artworkImageUrl,
          }),
        })

        if (!artworkRes.ok) {
          console.error('Artwork creation failed, but gallery was created.')
        }
      }

      // 3. Generate QR Code client-side
      const targetUrl = `${window.location.origin}/${slug}`
      const QRCodeModule = await import('qrcode')
      const qrDataUrl = await QRCodeModule.toDataURL(targetUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#111111',
          light: '#ffffff'
        }
      })
      setQrCodeDataUrl(qrDataUrl)

      setStep(7)
    } catch (err) {
      console.error(err)
      setSubmitError('Bir sunucu hatası oluştu.')
    } finally {
      setSubmitting(false)
    }
  }

  // Navigation handlers
  const nextStep = () => {
    if (step === 1 && !galleryName.trim()) {
      alert('Lütfen galeri adını girin.')
      return
    }
    if (step === 2 && (!slug || !slugAvailable)) {
      alert('Lütfen geçerli ve benzersiz bir URL girin.')
      return
    }
    if (step === 5 && artworkFile && !artworkImageUrl && !artworkUploading) {
      alert('Lütfen fotoğrafın yüklenmesini bekleyin veya kaldırın.')
      return
    }
    if (step === 5 && artworkTitle && !artworkImageUrl) {
      alert('Eser başlığı girdiyseniz görsel yüklemeniz zorunludur.')
      return
    }
    if (step === 5 && artworkImageUrl && !artworkTitle) {
      alert('Görsel yüklediyseniz eser başlığı girmeniz zorunludur.')
      return
    }
    setStep(prev => prev + 1)
  }

  const prevStep = () => {
    setStep(prev => prev - 1)
  }

  const handleFinish = () => {
    router.push('/dashboard')
    router.refresh()
  }

  const stepsCount = 8

  return (
    <div className="wizard-container">
      {/* Header */}
      <header className="wizard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, background: '#111', borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'serif'
            }}>G</div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Gallery.app</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'var(--color-border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', background: 'var(--color-bg-muted)',
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)'
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              {userName}
            </span>
          </div>
        </div>

        <div className="wizard-progress">
          {Array.from({ length: stepsCount }).map((_, i) => {
            const stepNum = i + 1
            let stateClass = ''
            if (stepNum === step) stateClass = 'active'
            else if (stepNum < step) stateClass = 'completed'
            return (
              <div
                key={stepNum}
                className={`wizard-progress-step ${stateClass}`}
              />
            )
          })}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', background: '#fafafa' }}>
        <div className="wizard-main-layout">
          <div className="wizard-form-col">
            <div className="card animate-fade-in" style={{ width: '100%', boxShadow: 'var(--shadow-md)' }}>
          
          {/* STEP 1: Galeri Adı */}
          {step === 1 && (
            <div>
              <span className="badge badge-info mb-3">Adım 1 / 8</span>
              <h2 className="text-2xl font-bold mb-2">Galeri Adı Belirleyin</h2>
              <p className="text-secondary text-sm mb-6">Dijital galerinizin, müzenizin veya sanat sitenizin adını girin. Bu ismi daha sonra ayarlar sayfasından değiştirebilirsiniz.</p>
              
              <div className="form-group mb-6">
                <label className="form-label" htmlFor="galleryName">Galeri Adı <span className="required">*</span></label>
                <input
                  id="galleryName"
                  type="text"
                  className="form-input"
                  placeholder="X Modern Sanat Galerisi"
                  value={galleryName}
                  onChange={e => handleGalleryNameChange(e.target.value)}
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={nextStep} className="btn btn-primary btn-lg">Devam Et →</button>
              </div>
            </div>
          )}

          {/* STEP 2: Galeri Türü & Slug */}
          {step === 2 && (
            <div>
              <span className="badge badge-info mb-3">Adım 2 / 8</span>
              <h2 className="text-2xl font-bold mb-2">Galeri Türü & URL Tercihi</h2>
              <p className="text-secondary text-sm mb-6">Galerinizi tanımlayan bir kategori seçin ve özelleştirilmiş URL adresinizi belirleyin.</p>

              <div className="form-group mb-6">
                <label className="form-label">Galeri Türü</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                  {[
                    { key: 'GALLERY', label: 'Sanat Galerisi', icon: '🏛️' },
                    { key: 'MUSEUM', label: 'Müze', icon: '🏛️' },
                    { key: 'ARTIST', label: 'Sanatçı / Ressam', icon: '🎨' },
                    { key: 'CAFE', label: 'Sanat Kafe', icon: '☕' },
                    { key: 'COLLECTOR', label: 'Koleksiyoner', icon: '💎' },
                    { key: 'OTHER', label: 'Diğer', icon: '✨' },
                  ].map(t => (
                    <div
                      key={t.key}
                      onClick={() => setGalleryType(t.key)}
                      style={{
                        padding: '16px 12px',
                        border: `2px solid ${galleryType === t.key ? '#111' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: galleryType === t.key ? '#fff' : 'transparent',
                        transition: 'all 200ms ease',
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group mb-6">
                <label className="form-label" htmlFor="slug">Galeri Web Adresi (URL) <span className="required">*</span></label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    background: 'var(--color-bg-muted)',
                    border: '1.5px solid var(--color-border)',
                    borderRight: 'none',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                    fontSize: 14,
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap'
                  }}>
                    gallery.app/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    className="form-input"
                    style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
                    placeholder="galerim"
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  />
                </div>
                {slugChecking && <p className="text-sm text-muted mt-1">URL kontrol ediliyor...</p>}
                {!slugChecking && slugAvailable === true && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-success)' }}>✓ URL kullanılabilir.</p>
                )}
                {!slugChecking && slugAvailable === false && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>✗ {slugError}</p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={prevStep} className="btn btn-secondary btn-lg">← Geri</button>
                <button onClick={nextStep} className="btn btn-primary btn-lg" disabled={!slugAvailable || slugChecking}>Devam Et →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Logo Yükleme */}
          {step === 3 && (
            <div>
              <span className="badge badge-info mb-3">Adım 3 / 8</span>
              <h2 className="text-2xl font-bold mb-2">Galeri Logosu Yükleyin</h2>
              <p className="text-secondary text-sm mb-6">Varsa galerinizin logosunu yükleyin. Logo yüklemek zorunlu değildir, dilediğiniz zaman atlayabilirsiniz.</p>

              <div className="form-group mb-6">
                <label className="form-label">Logo Görseli (Opsiyonel)</label>
                
                {logoUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 20, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
                    <img src={logoUrl} alt="Logo" style={{ maxHeight: 80, objectFit: 'contain' }} />
                    <button onClick={() => setLogoUrl(null)} className="btn btn-danger btn-sm">Görseli Kaldır</button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById('logoInput')?.click()}
                    className={`upload-zone ${logoUploading ? 'drag-over' : ''}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault()
                      if (e.dataTransfer.files?.[0]) handleLogoUpload(e.dataTransfer.files[0])
                    }}
                  >
                    <input
                      id="logoInput"
                      type="file"
                      style={{ display: 'none' }}
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                      onChange={e => {
                        if (e.target.files?.[0]) handleLogoUpload(e.target.files[0])
                      }}
                    />
                    <svg className="upload-zone-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="upload-zone-text">{logoUploading ? 'Logo Yükleniyor...' : 'Logonuzu Sürükleyin veya Dosya Seçin'}</span>
                    <span className="upload-zone-hint">PNG, JPG, WEBP veya SVG · En fazla 5MB</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={prevStep} className="btn btn-secondary btn-lg">← Geri</button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={nextStep} className="btn btn-ghost btn-lg">Atla</button>
                  <button onClick={nextStep} className="btn btn-primary btn-lg" disabled={logoUploading}>Devam Et →</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Tema Seçimi */}
          {step === 4 && (
            <div>
              <span className="badge badge-info mb-3">Adım 4 / 8</span>
              <h2 className="text-2xl font-bold mb-2">Tasarım Teması Seçin</h2>
              <p className="text-secondary text-sm mb-6">Galerinizin duruşuna uygun olan temayı seçin. Temayı sonradan değiştirebilirsiniz.</p>

              <div className="form-group mb-6">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {[
                    { key: 'MINIMAL', name: 'Minimal', bg: '#ffffff', text: '#0d0d0d', border: '#efefef', preview: 'Beyaz, Saf & Hava Dolu', colors: ['#0d0d0d', '#aaaaaa'] },
                    { key: 'LUXURY', name: 'Luxury', bg: '#080808', text: '#e8e0d0', border: '#1f1a14', preview: 'Derin Siyah & Kadife Altın', colors: ['#c9a84c', '#e8e0d0'] },
                    { key: 'MUSEUM', name: 'Museum', bg: '#f6efe4', text: '#1e160a', border: '#c8b89a', preview: 'Krem Tuval & Terrakota', colors: ['#8b3a1f', '#9c7f5e'] },
                    { key: 'MODERN', name: 'Modern', bg: '#111827', text: '#f1f5f9', border: '#1e293b', preview: 'Koyu Çelik & Elektrik Mavisi', colors: ['#38bdf8', '#64748b'] },
                  ].map(t => (
                    <div
                      key={t.key}
                      onClick={() => setTheme(t.key)}
                      style={{
                        border: `2.5px solid ${theme === t.key ? '#111' : 'transparent'}`,
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform var(--transition-fast)',
                        transform: theme === t.key ? 'scale(1.02)' : 'none',
                      }}
                    >
                      <div style={{ background: t.bg, color: t.text, height: 110, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `1px solid ${t.border}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.5 }}>{t.name.toUpperCase()} TEMA</div>
                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: t.key === 'MINIMAL' || t.key === 'MUSEUM' ? 'serif' : 'sans-serif' }}>Sanat Eseri</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.colors[0], border: '1px solid var(--color-border)' }} />
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.colors[1], border: '1px solid var(--color-border)' }} />
                        </div>
                      </div>
                      <div style={{ padding: 12, background: '#fff', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{t.preview}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={prevStep} className="btn btn-secondary btn-lg">← Geri</button>
                <button onClick={nextStep} className="btn btn-primary btn-lg">Devam Et →</button>
              </div>
            </div>
          )}

          {/* STEP 5: İlk Eser Ekleme */}
          {step === 5 && (
            <div>
              <span className="badge badge-info mb-3">Adım 5 / 8</span>
              <h2 className="text-2xl font-bold mb-2">İlk Eserinizi Ekleyin</h2>
              <p className="text-secondary text-sm mb-6">Galerinizi boş açmak yerine ilk sanat eserinizi şimdi yükleyin. Dilerseniz bu adımı geçip eserlerinizi daha sonra ekleyebilirsiniz.</p>

              {artworkError && (
                <div className="alert alert-error mb-4">
                  <span>{artworkError}</span>
                </div>
              )}

              <div className="form-group mb-4">
                <label className="form-label">Eser Fotoğrafı {artworkTitle && <span className="required">*</span>}</label>
                {artworkImageUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 16, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
                    <img src={artworkImageUrl} alt="Eser önizleme" style={{ maxHeight: 150, objectFit: 'contain', borderRadius: 4 }} />
                    <button onClick={() => setArtworkImageUrl(null)} className="btn btn-danger btn-sm">Görseli Kaldır</button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById('artworkInput')?.click()}
                    className={`upload-zone ${artworkUploading ? 'drag-over' : ''}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault()
                      if (e.dataTransfer.files?.[0]) handleArtworkUpload(e.dataTransfer.files[0])
                    }}
                    style={{ padding: '24px 16px' }}
                  >
                    <input
                      id="artworkInput"
                      type="file"
                      style={{ display: 'none' }}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={e => {
                        if (e.target.files?.[0]) handleArtworkUpload(e.target.files[0])
                      }}
                    />
                    <svg className="upload-zone-icon" style={{ width: 36, height: 36 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="upload-zone-text" style={{ fontSize: 13 }}>{artworkUploading ? 'Fotoğraf Yükleniyor...' : 'Fotoğraf sürükleyin veya dosya seçin'}</span>
                    <span className="upload-zone-hint">PNG, JPG veya WEBP · En fazla 10MB</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="artworkTitle">Eser Başlığı {artworkImageUrl && <span className="required">*</span>}</label>
                  <input
                    id="artworkTitle"
                    type="text"
                    className="form-input"
                    placeholder="Bulutların Ötesinde"
                    value={artworkTitle}
                    onChange={e => setArtworkTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="artworkArtist">Sanatçı</label>
                  <input
                    id="artworkArtist"
                    type="text"
                    className="form-input"
                    placeholder="Kendiniz veya başkası"
                    value={artworkArtist}
                    onChange={e => setArtworkArtist(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label" htmlFor="artworkDescription">Eser Açıklaması</label>
                <textarea
                  id="artworkDescription"
                  className="form-input form-textarea"
                  style={{ minHeight: 60 }}
                  placeholder="Eserin ardındaki hikaye, tekniği, kullanılan materyaller vb."
                  value={artworkDescription}
                  onChange={e => setArtworkDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="mb-6">
                <div className="form-group">
                  <label className="form-label" htmlFor="artworkPrice">Fiyat (TRY)</label>
                  <input
                    id="artworkPrice"
                    type="number"
                    className="form-input"
                    placeholder="Örn: 15000"
                    value={artworkPrice}
                    onChange={e => setArtworkPrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Boyutlar (En x Boy / Çap cm)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    <div>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="En"
                        value={artworkWidth}
                        onChange={e => setArtworkWidth(e.target.value)}
                        style={{ padding: '8px' }}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Boy"
                        value={artworkHeight}
                        onChange={e => setArtworkHeight(e.target.value)}
                        style={{ padding: '8px' }}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Çap"
                        value={artworkDiameter}
                        onChange={e => setArtworkDiameter(e.target.value)}
                        style={{ padding: '8px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={prevStep} className="btn btn-secondary btn-lg">← Geri</button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => {
                    // Skip button: clear inputs of artwork and go to summary
                    setArtworkTitle('')
                    setArtworkImageUrl(null)
                    setStep(6)
                  }} className="btn btn-ghost btn-lg">Atla</button>
                  <button onClick={nextStep} className="btn btn-primary btn-lg" disabled={artworkUploading}>Devam Et →</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Özet & Galeriyi Oluştur */}
          {step === 6 && (
            <div>
              <span className="badge badge-info mb-3">Adım 6 / 8</span>
              <h2 className="text-2xl font-bold mb-2">Galeriyi Kurmaya Hazırız</h2>
              <p className="text-secondary text-sm mb-6">Girdiğiniz bilgileri kontrol edin. Her şey hazır olduğunda "Galeriyi Oluştur" butonuna basın.</p>

              {submitError && (
                <div className="alert alert-error mb-4">
                  <span>{submitError}</span>
                </div>
              )}

              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16, background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }} className="mb-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Galeri Adı:</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{galleryName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Galeri Türü:</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{galleryType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>URL Adresi:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-info)' }}>gallery.app/{slug}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Tasarım Teması:</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{theme}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>İlk Eser:</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {artworkImageUrl && artworkTitle ? `✓ ${artworkTitle}` : 'Daha sonra eklenecek'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={prevStep} className="btn btn-secondary btn-lg" disabled={submitting}>← Geri</button>
                <button
                  onClick={handleCreateGallery}
                  className={`btn btn-primary btn-lg ${submitting ? 'btn-loading' : ''}`}
                  disabled={submitting}
                >
                  {submitting ? '' : '✓ Galeriyi Oluştur'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: QR Kod Oluşturma */}
          {step === 7 && (
            <div style={{ textAlign: 'center' }}>
              <span className="badge badge-success mb-3">Adım 7 / 8</span>
              <h2 className="text-2xl font-bold mb-2">QR Kodunuz Hazır!</h2>
              <p className="text-secondary text-sm mb-6">Ziyaretçilerinizin galerinize mobil cihazlarından hızlıca ulaşabilmesi için bir QR kod otomatik oluşturuldu.</p>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ padding: 16, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Gallery QR Code" style={{ width: 220, height: 220 }} />
                  ) : (
                    <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="spinner"></div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
                <a href={qrCodeDataUrl} download={`gallery-${slug}-qr.png`} className="btn btn-secondary">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"/>
                  </svg>
                  PNG Olarak İndir
                </a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={nextStep} className="btn btn-primary btn-lg">Devam Et →</button>
              </div>
            </div>
          )}

          {/* STEP 8: Kutlama / Yayında Ekranı */}
          {step === 8 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h2 className="text-3xl font-bold mb-2" style={{ letterSpacing: '-0.8px' }}>Tebrikler, Yayındasınız!</h2>
              <p className="text-secondary text-sm mb-6">Dijital sanat galeriniz başarıyla oluşturuldu ve internette yayınlandı.</p>

              <div style={{
                background: 'var(--color-bg-subtle)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 40,
                textAlign: 'left'
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 2 }}>GALERİ ADRESİNİZ</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-info)' }}>gallery.app/{slug}</div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
                    alert('Galeri adresi kopyalandı!')
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Adresi Kopyala
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <a
                  href={`/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-lg"
                  style={{ flex: 1 }}
                >
                  Galeriyi Gör
                </a>
                <button
                  onClick={handleFinish}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                >
                  Yönetim Paneline Git
                </button>
              </div>
            </div>
          )}

            </div>
          </div>

          {/* Right Column: Live Mobile Preview */}
          <div className="wizard-preview-col">
            <div className="phone-mockup">
              <div className="phone-notch"></div>
              
              <div 
                className="phone-screen" 
                style={{
                  background: theme === 'MINIMAL' ? '#ffffff' : 
                              theme === 'LUXURY' ? '#080808' : 
                              theme === 'MUSEUM' ? '#f6efe4' : '#111827',
                  color: theme === 'MINIMAL' ? '#0d0d0d' : 
                         theme === 'LUXURY' ? '#e8e0d0' : 
                         theme === 'MUSEUM' ? '#1e160a' : '#f1f5f9',
                  fontFamily: theme === 'MINIMAL' || theme === 'MUSEUM' ? 'Georgia, serif' : 'system-ui, sans-serif',
                  padding: '36px 12px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  overflowY: 'auto',
                }}
              >
                {/* Header inside phone */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 4, 
                  borderBottom: `1px solid ${theme === 'LUXURY' ? '#c9a84c33' : theme === 'MUSEUM' ? '#c8b89a' : theme === 'MODERN' ? '#1e293b' : '#efefef'}`,
                  paddingBottom: 8,
                  textAlign: 'center'
                }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'contain' }} />
                  ) : (
                    <div style={{
                      width: 22, height: 22, 
                      background: theme === 'LUXURY' ? '#c9a84c' : theme === 'MODERN' ? '#38bdf8' : theme === 'MUSEUM' ? '#8b3a1f' : '#111', 
                      borderRadius: theme === 'MODERN' ? 2 : '50%',
                      color: theme === 'LUXURY' || theme === 'MODERN' ? '#000' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700
                    }}>
                      {galleryName ? galleryName.charAt(0).toUpperCase() : 'G'}
                    </div>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: theme === 'LUXURY' ? '1px' : 0 }}>
                    {galleryName || 'Benim Galerim'}
                  </span>
                </div>

                {/* Body inside phone */}
                <div style={{ textAlign: 'center', padding: '4px 0' }}>
                  <div style={{ fontSize: 8, opacity: 0.5, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                    {galleryType === 'GALLERY' ? 'Sanat Galerisi' : 
                     galleryType === 'MUSEUM' ? 'Müze' : 
                     galleryType === 'ARTIST' ? 'Sanatçı' : 
                     galleryType === 'CAFE' ? 'Sanat Kafe' : 
                     galleryType === 'COLLECTOR' ? 'Koleksiyoner' : 'Sergi'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, letterSpacing: theme === 'LUXURY' ? '2px' : '-0.3px' }}>
                    {galleryName || 'Benim Galerim'}
                  </div>
                </div>

                {/* Artworks Grid inside phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1, alignItems: 'start' }}>
                  {/* Card 1: uploaded artwork or placeholder */}
                  <div style={{
                    background: theme === 'MUSEUM' ? '#fff9f2' : theme === 'LUXURY' ? '#0d0b08' : theme === 'MODERN' ? '#1e293b' : '#fff',
                    border: theme === 'MUSEUM' ? '3px solid #c8b89a' : theme === 'LUXURY' ? '1px solid #1f1a14' : theme === 'MODERN' ? 'none' : '1px solid #efefef',
                    borderRadius: theme === 'MODERN' ? 6 : 0,
                    overflow: 'hidden',
                  }}>
                    {artworkImageUrl ? (
                      <>
                        <img src={artworkImageUrl} alt="Eser" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                        <div style={{ padding: 5 }}>
                          <div style={{ fontSize: 8, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: theme === 'MODERN' ? '#f1f5f9' : 'inherit' }}>
                            {artworkTitle || 'İsimsiz Eser'}
                          </div>
                          <div style={{ fontSize: 7, marginTop: 2, color: theme === 'LUXURY' ? '#c9a84c' : theme === 'MODERN' ? '#38bdf8' : '#888' }}>İncele →</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '100%', aspectRatio: '4/3', background: theme === 'LUXURY' ? '#1a1510' : theme === 'MODERN' ? '#0f172a' : '#f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#bbb' }}>
                          🖼️ Eser 1
                        </div>
                        <div style={{ padding: 5 }}>
                          <div style={{ height: 6, width: '70%', background: theme === 'LUXURY' ? '#2a2218' : theme === 'MODERN' ? '#1e293b' : '#e8e4de', borderRadius: 1 }} />
                          <div style={{ height: 4, width: '40%', background: theme === 'LUXURY' ? '#2a2218' : theme === 'MODERN' ? '#1e293b' : '#e8e4de', borderRadius: 1, marginTop: 3 }} />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card 2: always a placeholder */}
                  <div style={{
                    background: theme === 'MUSEUM' ? '#fff9f2' : theme === 'LUXURY' ? '#0d0b08' : theme === 'MODERN' ? '#1e293b' : '#fff',
                    border: theme === 'MUSEUM' ? '3px solid #c8b89a' : theme === 'LUXURY' ? '1px solid #1f1a14' : theme === 'MODERN' ? 'none' : '1px solid #efefef',
                    borderRadius: theme === 'MODERN' ? 6 : 0,
                    overflow: 'hidden',
                    opacity: 0.6,
                  }}>
                    <div style={{ width: '100%', aspectRatio: '4/3', background: theme === 'LUXURY' ? '#1a1510' : theme === 'MODERN' ? '#0f172a' : '#f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#bbb' }}>
                      🖼️ Eser 2
                    </div>
                    <div style={{ padding: 5 }}>
                      <div style={{ height: 6, width: '70%', background: theme === 'LUXURY' ? '#2a2218' : theme === 'MODERN' ? '#1e293b' : '#e8e4de', borderRadius: 1 }} />
                      <div style={{ height: 4, width: '40%', background: theme === 'LUXURY' ? '#2a2218' : theme === 'MODERN' ? '#1e293b' : '#e8e4de', borderRadius: 1, marginTop: 3 }} />
                    </div>
                  </div>
                </div>

                {/* Footer inside phone */}
                <div style={{ 
                  textAlign: 'center', 
                  fontSize: 8, 
                  opacity: 0.5, 
                  borderTop: `1px solid ${theme === 'LUXURY' ? '#222' : theme === 'MUSEUM' ? '#e3dad0' : '#e8e8e8'}`,
                  paddingTop: 8,
                  marginTop: 'auto'
                }}>
                  © 2026 {galleryName || 'Galerim'} · gallery.app
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
