import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PublicGalleryPageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicGalleryPage({ params }: PublicGalleryPageProps) {
  const { slug } = await params

  const gallery = await prisma.gallery.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      artworks: {
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      },
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
      {/* HEADER */}
      <header
        style={{
          borderBottom: '1px solid var(--gallery-border)',
          padding: '24px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 10,
            textAlign: 'center'
          }}
        >
          {/* Logo or Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {gallery.logoUrl ? (
              <img
                src={gallery.logoUrl}
                alt={gallery.name}
                style={{ maxHeight: 52, maxWidth: 180, objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: 'var(--gallery-accent)',
                  color: themeKey === 'luxury' ? '#000' : '#fff',
                  borderRadius: themeKey === 'modern' ? 4 : '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  fontFamily: 'var(--gallery-title-font)',
                }}
              >
                {gallery.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span
            style={{
              fontFamily: 'var(--gallery-title-font)',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '-0.5px',
            }}
          >
            {gallery.name}
          </span>
        </div>
      </header>

      {/* HERO / BIO AREA */}
      <section style={{
        padding: themeKey === 'luxury' ? '80px 24px 60px' : themeKey === 'minimal' ? '80px 24px 64px' : '64px 24px 48px',
        textAlign: 'center',
        maxWidth: 700,
        margin: '0 auto',
        borderBottom: themeKey === 'museum' ? '2px solid var(--gallery-border)' : 'none',
      }}>
        <div
          style={{
            fontSize: themeKey === 'luxury' ? 10 : 11,
            fontWeight: themeKey === 'luxury' ? 300 : 700,
            letterSpacing: themeKey === 'luxury' ? '6px' : '2px',
            textTransform: 'uppercase',
            color: 'var(--gallery-text-muted)',
            marginBottom: 12,
          }}
        >
          {gallery.type === 'GALLERY' ? 'Sanat Galerisi' : 
           gallery.type === 'MUSEUM' ? 'Müze' : 
           gallery.type === 'ARTIST' ? 'Sanatçı Portfolyosu' : 
           gallery.type === 'CAFE' ? 'Sanat Kafe Galerisi' : 
           gallery.type === 'COLLECTOR' ? 'Koleksiyoner Seçkisi' : 'Dijital Sergi'}
        </div>
        <h1
          style={{
            fontFamily: 'var(--gallery-title-font)',
            fontSize: themeKey === 'luxury'
              ? 'clamp(28px, 4vw, 42px)'
              : themeKey === 'minimal'
                ? 'clamp(36px, 6vw, 64px)'
                : 'clamp(32px, 5vw, 48px)',
            fontWeight: themeKey === 'minimal' ? 300 : themeKey === 'modern' ? 800 : 700,
            lineHeight: themeKey === 'luxury' ? 1.5 : 1.15,
            marginBottom: 20,
            letterSpacing: themeKey === 'luxury' ? '4px' : themeKey === 'minimal' ? '-2px' : '-0.5px',
            textTransform: themeKey === 'luxury' ? 'uppercase' : 'none',
            color: themeKey === 'modern' ? 'var(--gallery-accent)' : 'var(--gallery-text)',
          }}
        >
          {gallery.name}
        </h1>
        {gallery.bio && (
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: 'var(--gallery-text-muted)',
              whiteSpace: 'pre-line',
              fontStyle: themeKey === 'museum' ? 'italic' : 'normal',
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            {gallery.bio}
          </p>
        )}
        {themeKey === 'luxury' && (
          <div style={{ width: 60, height: 1, background: '#c9a84c', margin: '28px auto 0' }} />
        )}
      </section>

      {/* ARTWORKS GRID */}
      <main style={{ padding: '0 24px 80px', maxWidth: 800, margin: '0 auto' }}>
        {gallery.artworks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px dashed var(--gallery-border)', borderRadius: 12 }}>
            <p style={{ color: 'var(--gallery-text-muted)', fontSize: 15 }}>Bu galeride henüz sergilenen bir eser bulunmuyor.</p>
          </div>
        ) : (
          <div
            className="gallery-grid-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: themeKey === 'minimal' ? '48px' : themeKey === 'luxury' ? '2px' : themeKey === 'modern' ? '16px' : '32px',
            }}
          >
            {gallery.artworks.map((art, artIndex) => {
              const isMuseum = themeKey === 'museum'
              const isLuxury = themeKey === 'luxury'
              const isModern = themeKey === 'modern'
              const isMinimal = themeKey === 'minimal'
              const artworkNumber = artIndex + 1
              const showName = gallery.showArtworkName
              const showNum = gallery.showArtworkNumber
              const showPrice = gallery.showArtworkPrice
              const hasAnyMeta = showName || showNum || (showPrice && art.price !== null)

              return (
                <Link
                  key={art.id}
                  href={`/${gallery.slug}/${art.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    transition: 'transform 300ms ease, box-shadow 300ms ease',
                  }}
                  className="public-artwork-link"
                >
                  <div
                    style={{
                      background: isMuseum ? '#b89742' : 'transparent',
                      padding: isMuseum ? 10 : 0,
                      border: isLuxury 
                        ? '1px solid #1f1a14'
                        : isMinimal
                          ? '1px solid #efefef'
                          : 'none',
                      borderRadius: isModern ? 12 : isMinimal ? 4 : 0,
                      boxShadow: isMuseum 
                        ? '0 12px 32px rgba(0,0,0,0.1), 0 4px 12px rgba(184,151,66,0.08)'
                        : isLuxury
                          ? '0 20px 60px rgba(0,0,0,0.6)'
                          : isModern 
                            ? '0 0 0 1px #1e293b'
                            : isMinimal
                              ? '0 2px 16px rgba(0,0,0,0.05)'
                              : 'none',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        background: isMuseum ? '#fff9f2' : isLuxury ? '#0d0b08' : isModern ? '#1e293b' : 'transparent',
                        padding: isMuseum ? 16 : isLuxury ? 0 : 0,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                    >
                    {/* Image */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: isLuxury ? '3/4' : isMinimal ? '1/1' : '4/3',
                      overflow: 'hidden',
                      background: isLuxury ? '#080808' : isModern ? '#111827' : isMuseum ? '#fff9f2' : '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 12,
                    }}>
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          transition: 'transform 500ms ease',
                          filter: isLuxury ? 'contrast(1.05) saturate(0.9)' : 'none',
                        }}
                      />
                    </div>

                    {/* Metadata */}
                    {hasAnyMeta && (
                    <div style={{
                      padding: isMuseum ? '14px 8px 8px' : isLuxury ? '18px 12px 14px' : isModern ? '12px 14px 10px' : '12px 8px 8px',
                      background: isModern ? '#1e293b' : 'transparent',
                    }}>
                      {/* Number + Name row */}
                      {(showNum || showName) && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: showPrice && art.price !== null ? 8 : 0 }}>
                          {showNum && (
                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: 'var(--gallery-text-muted)',
                              letterSpacing: '0.5px',
                              flexShrink: 0,
                            }}>
                              #{artworkNumber}
                            </span>
                          )}
                          {showName && (
                            <h3
                              style={{
                                fontFamily: 'var(--gallery-title-font)',
                                fontSize: isLuxury ? 12 : isMuseum ? 16 : 14,
                                fontWeight: isLuxury ? 400 : isModern ? 700 : 600,
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                letterSpacing: isLuxury ? '1.5px' : 'normal',
                                textTransform: isLuxury ? 'uppercase' : 'none',
                                fontStyle: isMuseum ? 'italic' : 'normal',
                                flex: 1,
                              }}
                            >
                              {art.title}
                            </h3>
                          )}
                        </div>
                      )}

                      {/* Price + View */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: (showNum || showName) ? 8 : 0,
                          borderTop: (showNum || showName) ? `1px solid var(--gallery-border)` : 'none',
                        }}
                      >
                        <span style={{
                          fontSize: 10,
                          fontWeight: isModern ? 700 : 600,
                          letterSpacing: isLuxury ? '2px' : '0.5px',
                          textTransform: 'uppercase',
                          color: 'var(--gallery-accent)',
                        }}>
                          {isLuxury ? 'View' : 'İncele'} →
                        </span>
                        {showPrice && art.price !== null && (
                          <span style={{ fontSize: 13, fontWeight: 600, color: isLuxury ? '#c9a84c' : isModern ? '#38bdf8' : 'var(--gallery-text)' }}>
                            {art.price.toLocaleString('tr-TR')} {art.currency}
                          </span>
                        )}
                      </div>
                    </div>
                    )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* HAKKIMIZDA + İLETİŞİM */}
      {(gallery.aboutText || gallery.contactEmail || gallery.website) && (
        <section
          style={{
            borderTop: '1px solid var(--gallery-border)',
            padding: '64px 24px',
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: gallery.aboutText && (gallery.contactEmail || gallery.website) ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
              gap: 48,
            }}
          >
            {/* Hakkımızda */}
            {gallery.aboutText && (
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--gallery-title-font)',
                    fontSize: themeKey === 'luxury' ? 11 : 13,
                    fontWeight: 700,
                    letterSpacing: themeKey === 'luxury' ? '4px' : '1.5px',
                    textTransform: 'uppercase',
                    color: 'var(--gallery-text-muted)',
                    marginBottom: 16,
                  }}
                >
                  Hakkımızda
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: 'var(--gallery-text)',
                    whiteSpace: 'pre-line',
                    opacity: 0.85,
                    fontStyle: themeKey === 'museum' ? 'italic' : 'normal',
                  }}
                >
                  {gallery.aboutText}
                </p>
              </div>
            )}

            {/* İletişim */}
            {(gallery.contactEmail || gallery.website) && (
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--gallery-title-font)',
                    fontSize: themeKey === 'luxury' ? 11 : 13,
                    fontWeight: 700,
                    letterSpacing: themeKey === 'luxury' ? '4px' : '1.5px',
                    textTransform: 'uppercase',
                    color: 'var(--gallery-text-muted)',
                    marginBottom: 16,
                  }}
                >
                  İletişim
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {gallery.contactEmail && (
                    <a
                      href={`mailto:${gallery.contactEmail}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 14,
                        color: 'var(--gallery-text)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      <span style={{
                        width: 32, height: 32,
                        background: 'var(--gallery-border)',
                        borderRadius: themeKey === 'modern' ? 6 : '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </span>
                      {gallery.contactEmail}
                    </a>
                  )}
                  {gallery.website && (
                    <a
                      href={gallery.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 14,
                        color: 'var(--gallery-text)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      <span style={{
                        width: 32, height: 32,
                        background: 'var(--gallery-border)',
                        borderRadius: themeKey === 'modern' ? 6 : '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="2" y1="12" x2="22" y2="12"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                      </span>
                      Web Sitesi ↗
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid var(--gallery-border)',
          padding: '32px 24px',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--gallery-text-muted)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p>
            © 2026 {gallery.name} · Bu galeri{' '}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 600, color: 'var(--gallery-text)', textDecoration: 'none' }}
            >
              gallery.app
            </a>{' '}
            ile oluşturulmuştur.
          </p>
        </div>
      </footer>
    </div>
  )
}
