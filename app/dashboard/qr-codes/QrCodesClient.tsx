'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

interface Artwork {
  id: string
  title: string
  artist: string | null
  imageUrl: string
}

interface QrCodesClientProps {
  gallerySlug: string
  galleryName: string
  galleryType: string
  artworks: Artwork[]
}

export default function QrCodesClient({ gallerySlug, galleryName, galleryType, artworks }: QrCodesClientProps) {
  const [galleryQr, setGalleryQr] = useState('')
  const [artworkQrs, setArtworkQrs] = useState<Record<string, string>>({})

  const galleryUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${gallerySlug}`

  useEffect(() => {
    // Generate gallery QR
    QRCode.toDataURL(galleryUrl, { width: 300, margin: 2 })
      .then(url => setGalleryQr(url))
      .catch(err => console.error('Gallery QR error:', err))

    // Generate artwork QRs
    artworks.forEach(art => {
      const artUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${gallerySlug}/${art.id}`
      QRCode.toDataURL(artUrl, { width: 250, margin: 2 })
        .then(url => {
          setArtworkQrs(prev => ({ ...prev, [art.id]: url }))
        })
        .catch(err => console.error(`Artwork ${art.id} QR error:`, err))
    })
  }, [gallerySlug, artworks, galleryUrl])

  const downloadPdf = (qrDataUrl: string, title: string, subtitle: string) => {
    if (!qrDataUrl) return
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a6', // 105mm x 148mm
    })

    // Label border
    doc.setDrawColor(220, 220, 220)
    doc.rect(5, 5, 95, 138)

    // Main Title
    doc.setTextColor(17, 17, 17)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    const splitTitle = doc.splitTextToSize(title, 85)
    doc.text(splitTitle, 52.5, 20, { align: 'center' })

    // Subtitle
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(subtitle, 52.5, 30, { align: 'center' })

    // QR Image (60mm x 60mm)
    doc.addImage(qrDataUrl, 'PNG', 22.5, 40, 60, 60)

    // Link instructions
    doc.setTextColor(120, 120, 120)
    doc.setFontSize(8)
    doc.text('Kodu tarayarak akilli telefonunuzdan', 52.5, 110, { align: 'center' })
    doc.text('detaylari inceleyebilirsiniz.', 52.5, 114, { align: 'center' })

    // Footer branding
    doc.setTextColor(180, 180, 180)
    doc.setFontSize(7)
    doc.text('gallery.app', 52.5, 134, { align: 'center' })

    doc.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr.pdf`)
  }

  const getGalleryTypeLabel = (type: string) => {
    switch (type) {
      case 'GALLERY': return 'Sanat Galerisi'
      case 'MUSEUM': return 'Müze'
      case 'ARTIST': return 'Sanatçı Portfolyosu'
      case 'CAFE': return 'Sanat Kafe'
      case 'COLLECTOR': return 'Koleksiyoner Seçkisi'
      default: return 'Dijital Sergi'
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">QR Kod Yönetimi</h1>
          <p className="page-subtitle">Ziyaretçilerinizin galerinize veya belirli eserlerinize doğrudan ulaşabilmesi için QR kodları indirin.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start', gridTemplateRows: 'auto' }} className="mb-8">
        
        {/* Gallery QR Code Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Genel Galeri QR Kodu</h2>
          
          <div style={{ padding: 12, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', marginBottom: 16 }}>
            {galleryQr ? (
              <img src={galleryQr} alt="Galeri QR Kodu" style={{ width: 180, height: 180 }} />
            ) : (
              <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
              </div>
            )}
          </div>
          
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16, wordBreak: 'break-all', fontWeight: 500 }}>
            gallery.app/{gallerySlug}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
            <a href={galleryQr} download={`gallery-${gallerySlug}-qr.png`} className="btn btn-primary btn-sm" style={{ display: 'flex', justifyContent: 'center', gap: 4, padding: '8px 4px', fontSize: 12 }}>
              PNG İndir
            </a>
            <button onClick={() => downloadPdf(galleryQr, galleryName, getGalleryTypeLabel(galleryType))} className="btn btn-secondary btn-sm" style={{ display: 'flex', justifyContent: 'center', gap: 4, padding: '8px 4px', fontSize: 12 }}>
              PDF İndir
            </button>
          </div>
        </div>

        {/* Explain Card */}
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>QR Kodlar Nasıl Kullanılır?</h3>
          <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li>
              <strong>Fiziksel Sergi & Kartvizitler:</strong> Genel galeri QR kodunu kartvizitlerinize, broşürlerinize veya sergi girişlerindeki afişlere basarak ziyaretçilerin tüm galerinizi akıllı telefonlerinden gezmesini sağlayabilirsiniz.
            </li>
            <li>
              <strong>Eser Etiketleri:</strong> Sergi salonlarında her eserin yanındaki bilgi kartına o eserin kendi QR kodunu ekleyerek, ziyaretçilerin eserin hikayesini, detaylarını ve varsa satın alma linkini kendi telefonlarında anında görmelerini sağlayabilirsiniz.
            </li>
            <li>
              <strong>Baskı Seçenekleri (PNG / PDF):</strong> Dijital paylaşımlar ve tasarım programları için PNG formatını; doğrudan kesip etiket olarak sergi salonunda kullanmak için A6 boyutunda tasarlanmış hazır PDF formatını indirebilirsiniz.
            </li>
          </ul>
        </div>
      </div>

      {/* Artworks QR Section */}
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Eser QR Kodları</h2>
      
      {artworks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p className="text-secondary text-sm">Henüz eser eklemediniz. Eser QR kodlarının oluşması için önce eser eklemelisiniz.</p>
          <Link href="/dashboard/artworks/new" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
            Eser Ekle
          </Link>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {artworks.map(art => (
            <div key={art.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 16 }}>
              <div style={{
                width: '100%',
                aspectRatio: '1',
                overflow: 'hidden',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 12,
                position: 'relative',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
                border: '1px solid var(--color-border)'
              }}>
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                {art.title}
              </h3>
              
              <div style={{ padding: 8, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                {artworkQrs[art.id] ? (
                  <img src={artworkQrs[art.id]} alt={`${art.title} QR`} style={{ width: 120, height: 120 }} />
                ) : (
                  <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner"></div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%' }}>
                <a href={artworkQrs[art.id]} download={`artwork-${art.title.replace(/\s+/g, '-')}-qr.png`} className="btn btn-secondary btn-sm" style={{ display: 'flex', justifyContent: 'center', gap: 2, fontSize: 11, padding: '6px 2px' }}>
                  PNG
                </a>
                <button onClick={() => downloadPdf(artworkQrs[art.id], art.title, art.artist || 'Sanat Eseri')} className="btn btn-secondary btn-sm" style={{ display: 'flex', justifyContent: 'center', gap: 2, fontSize: 11, padding: '6px 2px' }}>
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
