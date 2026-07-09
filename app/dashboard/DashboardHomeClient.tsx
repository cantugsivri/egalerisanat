'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Artwork {
  id: string
  title: string
  artist: string | null
  imageUrl: string
  price: number | null
  currency: string
}

interface Gallery {
  id: string
  name: string
  slug: string
  type: string
  isPublished: boolean
}

interface User {
  name: string
  email: string
}

interface DashboardHomeClientProps {
  user: User
  gallery: Gallery
  initialArtworks: Artwork[]
}

export default function DashboardHomeClient({ user, gallery, initialArtworks }: DashboardHomeClientProps) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks)
  const [copied, setCopied] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const galleryUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${gallery.slug}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(galleryUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDeleteArtwork(id: string) {
    if (!confirm('Bu eseri silmek istediğinize emin misiniz?')) return
    setDeletingId(id)

    try {
      const res = await fetch(`/api/artworks/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setArtworks(prev => prev.filter(item => item.id !== id))
      } else {
        alert('Eser silinemedi.')
      }
    } catch {
      alert('Bir bağlantı hatası oluştu.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Merhaba, {user.name} 👋</h1>
          <p className="page-subtitle">Galerinizi yönetin, yeni eserler ekleyin ve yayını kontrol edin.</p>
        </div>
        <Link href="/dashboard/artworks/new" className="btn btn-primary">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
            <path d="M12 5v14m-7-7h14"/>
          </svg>
          Yeni Eser Ekle
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>TOPLAM ESER</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{artworks.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>GALERİ TÜRÜ</div>
          <div style={{ fontSize: 20, fontWeight: 600, textTransform: 'capitalize', marginTop: 8 }}>
            {gallery.type.toLowerCase() === 'gallery' ? '🏛️ Sanat Galerisi' : 
             gallery.type.toLowerCase() === 'museum' ? '🏛️ Müze' : 
             gallery.type.toLowerCase() === 'artist' ? '🎨 Sanatçı' : 
             gallery.type.toLowerCase() === 'cafe' ? '☕ Sanat Kafe' : 
             gallery.type.toLowerCase() === 'collector' ? '💎 Koleksiyoner' : '✨ Diğer'}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>DURUM</div>
          <div style={{ marginTop: 8 }}>
            {gallery.isPublished ? (
              <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>● Yayında</span>
            ) : (
              <span className="badge badge-warning" style={{ padding: '6px 12px', fontSize: 12 }}>● Taslak</span>
            )}
          </div>
        </div>
      </div>

      {/* Share / URL Section */}
      <div className="card mb-8">
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Galeri Web Adresiniz</h2>
        <p className="text-secondary text-sm mb-4">Aşağıdaki bağlantıyı sosyal medya profillerinizde veya QR kodlar aracılığıyla ziyaretçilerinizle paylaşabilirsiniz.</p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--color-bg-subtle)',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: 500, color: 'var(--color-info)', flex: 1, minWidth: 200, wordBreak: 'break-all' }}>
            {galleryUrl}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copyToClipboard} className="btn btn-secondary btn-sm">
              {copied ? 'Kopyalandı!' : 'Adresi Kopyala'}
            </button>
            <a href={`/${gallery.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              Ziyaret Et
            </a>
          </div>
        </div>
      </div>

      {/* Artworks List Section */}
      <div className="mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Son Eklenen Eserler</h2>
        <Link href="/dashboard/artworks" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Tümünü Gör →
        </Link>
      </div>

      {artworks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px', background: '#fff' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🖼️</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Henüz Eser Eklenmedi</h3>
          <p className="text-secondary text-sm mb-6" style={{ maxWidth: 360, margin: '0 auto 24px' }}>Galerinizde sergilenmek üzere ilk sanat eserinizi hemen ekleyin.</p>
          <Link href="/dashboard/artworks/new" className="btn btn-primary">
            İlk Eseri Ekle
          </Link>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
          {artworks.slice(0, 4).map(artwork => (
            <div key={artwork.id} className="artwork-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '100%',
                aspectRatio: '4/3',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                borderBottom: '1px solid var(--color-border)',
                overflow: 'hidden'
              }}>
                <img 
                  src={artwork.imageUrl} 
                  alt={artwork.title} 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: 'transform 300ms ease',
                  }}
                />
              </div>
              <div className="artwork-card-body" style={{ flex: 1 }}>
                <h4 className="artwork-card-title">{artwork.title}</h4>
                <p className="artwork-card-artist">{artwork.artist || 'Bilinmeyen Sanatçı'}</p>
                {artwork.price !== null && (
                  <p style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                    {artwork.price.toLocaleString('tr-TR')} {artwork.currency}
                  </p>
                )}
              </div>
              <div className="artwork-card-actions">
                <Link href={`/dashboard/artworks/${artwork.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  Düzenle
                </Link>
                <button
                  onClick={() => handleDeleteArtwork(artwork.id)}
                  disabled={deletingId === artwork.id}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '6px 10px' }}
                >
                  {deletingId === artwork.id ? '...' : 'Sil'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
