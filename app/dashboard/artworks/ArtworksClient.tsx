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
  dimensions: string | null
  material: string | null
}

interface ArtworksClientProps {
  initialArtworks: Artwork[]
}

export default function ArtworksClient({ initialArtworks }: ArtworksClientProps) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  async function handleDelete(id: string) {
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
      alert('Bağlantı hatası oluştu.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredArtworks = artworks.filter(art => 
    art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (art.artist && art.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Eserleriniz</h1>
          <p className="page-subtitle">Galerinizde sergilenen tüm eserleri görüntüleyin, düzenleyin veya silin.</p>
        </div>
        <Link href="/dashboard/artworks/new" className="btn btn-primary">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
            <path d="M12 5v14m-7-7h14"/>
          </svg>
          Yeni Eser Ekle
        </Link>
      </div>

      {/* Search Bar */}
      <div className="card mb-6" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: 20, height: 20, color: 'var(--color-text-muted)' }}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="form-input"
            style={{ border: 'none', padding: '6px 0', fontSize: 15, boxShadow: 'none' }}
            placeholder="Eser adı veya sanatçıya göre ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredArtworks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🖼️</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            {searchTerm ? 'Eşleşen Eser Bulunamadı' : 'Henüz Eser Yok'}
          </h3>
          <p className="text-secondary text-sm mb-6">
            {searchTerm ? 'Lütfen arama teriminizi değiştirip tekrar deneyin.' : 'Galeriniz boş duruyor. İlk sanat eserinizi ekleyin.'}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/artworks/new" className="btn btn-primary">
              İlk Eseri Ekle
            </Link>
          )}
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {filteredArtworks.map(artwork => (
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
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12, borderTop: '1px dashed var(--color-border)', paddingTop: 12 }}>
                  {artwork.dimensions && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Boyut:</span>
                      <span>{artwork.dimensions}</span>
                    </div>
                  )}
                  {artwork.material && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Materyal:</span>
                      <span>{artwork.material}</span>
                    </div>
                  )}
                  {artwork.price !== null && (
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span>Fiyat:</span>
                      <span>{artwork.price.toLocaleString('tr-TR')} {artwork.currency}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="artwork-card-actions">
                <Link href={`/dashboard/artworks/${artwork.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  Düzenle
                </Link>
                <button
                  onClick={() => handleDelete(artwork.id)}
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
