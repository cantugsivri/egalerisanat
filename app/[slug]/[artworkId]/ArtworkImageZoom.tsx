'use client'

import { useState, useEffect, useCallback } from 'react'

interface ArtworkImageZoomProps {
  src: string
  alt: string
  themeKey: string
}

export default function ArtworkImageZoom({ src, alt, themeKey }: ArtworkImageZoomProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const openLightbox = () => {
    setLightboxOpen(true)
    setImageLoaded(false)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    document.body.style.overflow = ''
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
    }
    if (lightboxOpen) {
      window.addEventListener('keydown', handleKey)
    }
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, closeLightbox])

  const frameBorder =
    themeKey === 'museum'
      ? '12px solid #8b7355'
      : themeKey === 'luxury'
        ? '1px solid #222'
        : themeKey === 'modern'
          ? '1px solid #e2e2e2'
          : 'none'

  const framePadding = themeKey === 'museum' ? 16 : 0
  const frameBg = themeKey === 'museum' ? '#fff' : 'transparent'
  const frameShadow =
    themeKey === 'museum'
      ? '0 10px 30px rgba(0,0,0,0.15)'
      : themeKey === 'modern'
        ? '0 8px 24px rgba(0,0,0,0.04)'
        : 'none'
  const frameBorderRadius = themeKey === 'modern' ? 8 : 0

  return (
    <>
      {/* Artwork Image with Zoom Trigger */}
      <div
        onClick={openLightbox}
        style={{
          position: 'relative',
          cursor: 'zoom-in',
          padding: framePadding,
          border: frameBorder,
          borderRadius: frameBorderRadius,
          background: frameBg,
          boxShadow: frameShadow,
          overflow: 'hidden',
          display: 'inline-block',
          width: '100%',
        }}
        title="Büyütmek için tıklayın"
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            display: 'block',
            transition: 'transform 300ms ease, filter 300ms ease',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLImageElement).style.transform = 'scale(1.02)'
            ;(e.currentTarget as HTMLImageElement).style.filter = 'brightness(0.97)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'
            ;(e.currentTarget as HTMLImageElement).style.filter = 'brightness(1)'
          }}
        />

        {/* Magnifier Icon Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: framePadding + 12,
            right: framePadding + 12,
            width: 36,
            height: 36,
            background: 'rgba(0,0,0,0.45)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 200ms ease, transform 200ms ease',
            pointerEvents: 'none',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeInLightbox 180ms ease',
            padding: '20px',
          }}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            aria-label="Kapat"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 44,
              height: 44,
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              transition: 'background 200ms ease',
              zIndex: 10000,
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* ESC hint */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.5px',
            }}
          >
            ESC ile kapat · Dışarı tıkla
          </div>

          {/* Loading spinner */}
          {!imageLoaded && (
            <div
              style={{
                width: 40,
                height: 40,
                border: '3px solid rgba(255,255,255,0.2)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spinLightbox 700ms linear infinite',
                position: 'absolute',
              }}
            />
          )}

          {/* Full Resolution Image */}
          <img
            src={src}
            alt={alt}
            onClick={e => e.stopPropagation()}
            onLoad={() => setImageLoaded(true)}
            style={{
              maxWidth: '100%',
              maxHeight: '100vh',
              objectFit: 'contain',
              cursor: 'default',
              borderRadius: 4,
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 250ms ease',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              animation: imageLoaded ? 'scaleInLightbox 250ms ease' : 'none',
              userSelect: 'none',
            }}
            draggable={false}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeInLightbox {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes scaleInLightbox {
          from { transform: scale(0.94) }
          to   { transform: scale(1) }
        }
        @keyframes spinLightbox {
          to { transform: rotate(360deg) }
        }
      `}</style>
    </>
  )
}
