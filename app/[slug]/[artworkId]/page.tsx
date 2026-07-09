import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PublicArtworkPageProps {
  params: Promise<{ slug: string; artworkId: string }>
}

export default async function PublicArtworkPage({ params }: PublicArtworkPageProps) {
  const { slug, artworkId } = await params

  const gallery = await prisma.gallery.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!gallery) {
    notFound()
  }

  const artwork = await prisma.artwork.findFirst({
    where: {
      id: artworkId,
      galleryId: gallery.id,
    },
  })

  if (!artwork) {
    notFound()
  }

  const themeKey = gallery.theme.toLowerCase() // minimal, luxury, museum, modern
  


  return (
    <div
      data-theme={themeKey}
      style={{
        background: 'var(--gallery-bg)',
        color: 'var(--gallery-text)',
        fontFamily: 'var(--gallery-font)',
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* HEADER / BACK */}
      <header
        style={{
          borderBottom: '1px solid var(--gallery-border)',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href={`/${gallery.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--gallery-text)',
              textDecoration: 'none',
            }}
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Galeriye Dön
          </Link>
          <span style={{ fontSize: 13, color: 'var(--gallery-text-muted)', fontWeight: 500 }}>
            {gallery.name}
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ padding: '60px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'start' }}>
          
          {/* Eser Fotoğrafı (Left Column) */}
          <div
            style={{
              padding: themeKey === 'museum' ? 16 : 0,
              border: themeKey === 'museum' 
                ? '12px solid #8b7355' 
                : themeKey === 'luxury' 
                  ? '1px solid #222' 
                  : themeKey === 'modern' 
                    ? '1px solid #e2e2e2' 
                    : 'none',
              borderRadius: themeKey === 'modern' ? 8 : 0,
              background: themeKey === 'museum' ? '#fff' : 'transparent',
              boxShadow: themeKey === 'museum' 
                ? '0 10px 30px rgba(0,0,0,0.15)' 
                : themeKey === 'modern' 
                  ? '0 8px 24px rgba(0,0,0,0.04)' 
                  : 'none',
              overflow: 'hidden',
            }}
          >
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              style={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          {/* Eser Detayları (Right Column) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--gallery-title-font)',
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: '-0.8px',
                  margin: '0 0 8px',
                }}
              >
                {artwork.title}
              </h1>
              {artwork.artist && (
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: 'var(--gallery-text-muted)',
                  }}
                >
                  {artwork.artist}
                </p>
              )}
            </div>

            {/* Price section */}
            {artwork.price !== null && (
              <div
                style={{
                  borderBottom: '1px solid var(--gallery-border)',
                  paddingBottom: 16,
                  color: 'var(--gallery-text)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gallery-text-muted)', marginBottom: 4 }}>
                  Fiyat
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gallery-accent)' }}>
                  {artwork.price.toLocaleString('tr-TR')} {artwork.currency}
                </div>
              </div>
            )}

            {/* Description */}
            {artwork.description && (
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gallery-text-muted)', marginBottom: 8 }}>
                  Açıklama
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                    opacity: 0.9,
                  }}
                >
                  {artwork.description}
                </p>
              </div>
            )}

            {/* Metadata attributes */}
            {(artwork.dimensions || artwork.material) && (
              <div style={{ borderTop: '1px solid var(--gallery-border)', borderBottom: '1px solid var(--gallery-border)', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {artwork.dimensions && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: 'var(--gallery-text-muted)' }}>Boyutlar:</span>
                    <span style={{ fontWeight: 550 }}>{artwork.dimensions}</span>
                  </div>
                )}
                {artwork.material && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: 'var(--gallery-text-muted)' }}>Materyal / Teknik:</span>
                    <span style={{ fontWeight: 550 }}>{artwork.material}</span>
                  </div>
                )}
              </div>
            )}

            {/* Purchase CTA */}
            {artwork.externalLinkUrl && (
              <a
                href={artwork.externalLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  background: 'var(--gallery-accent)',
                  color: themeKey === 'luxury' ? '#000' : '#fff',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: themeKey === 'modern' ? 6 : 0,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxShadow: themeKey === 'luxury' ? '0 4px 12px rgba(201,168,76,0.15)' : 'none',
                  transition: 'all 200ms ease',
                }}
              >
                {artwork.externalLinkType === 'SHOPIFY' ? 'Shopify\'da Satın Al ↗' :
                 artwork.externalLinkType === 'ETSY' ? 'Etsy\'de Satın Al ↗' :
                 artwork.externalLinkType === 'INSTAGRAM' ? 'Instagram\'dan Satın Al ↗' : 'Satın Alma Sayfasına Git ↗'}
              </a>
            )}

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid var(--gallery-border)',
          padding: '40px 24px',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--gallery-text-muted)',
        }}
      >
        <p>© 2026 {gallery.name} · Bu galeri <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: 'var(--gallery-text)', textDecoration: 'none' }}>gallery.app</a> ile oluşturulmuştur.</p>
      </footer>
    </div>
  )
}
