'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface VerificationBannerProps {
  initialVerified: boolean
}

export default function VerificationBanner({ initialVerified }: VerificationBannerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verified, setVerified] = useState(initialVerified)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Check if redirected from verification link with success parameter
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setVerified(true)
      setMessage('E-posta adresiniz başarıyla doğrulandı!')
      // Clean url parameter
      router.replace('/dashboard')
    }
  }, [searchParams, router])

  async function handleSendVerification() {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        setMessage(data.message || 'Doğrulama e-postası gönderildi.')
      } else {
        setError(data.error || 'Doğrulama e-postası gönderilemedi.')
      }
    } catch {
      setError('Bağlantı hatası oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (verified && !message) return null

  return (
    <div className="mb-6 animate-fade-in">
      {message && (
        <div className="alert alert-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <strong>Başarılı:</strong> {message}
          </div>
          {verified && (
            <button 
              onClick={() => setMessage('')} 
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <strong>Hata:</strong> {error}
          </div>
        </div>
      )}

      {!verified && !message && (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div>
              E-posta adresiniz henüz doğrulanmadı. Hesabınızı güvende tutmak için lütfen e-postanızı doğrulayın.
            </div>
          </div>
          <button
            onClick={handleSendVerification}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ flexShrink: 0 }}
          >
            {loading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
          </button>
        </div>
      )}
    </div>
  )
}
