'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Geçersiz sıfırlama bağlantısı. Token eksik.')
      return
    }

    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'İşlem başarısız.')
        return
      }

      setMessage(data.message || 'Şifreniz sıfırlandı.')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card animate-fade-in">
        <div className="auth-logo">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, background: '#111', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'serif'
            }}>G</div>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.3px', color: '#111' }}>Gallery.app</span>
          </Link>
        </div>

        <h1 className="auth-title">Yeni Şifre Belirle</h1>
        <p className="auth-subtitle">Güvenliğiniz için yeni bir şifre girin</p>

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
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>Giriş sayfasına yönlendiriliyorsunuz...</div>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Yeni Şifre</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="passwordConfirm">Yeni Şifre Tekrar</label>
              <input
                id="passwordConfirm"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
              id="reset-submit"
            >
              {loading ? '' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Giriş sayfasına geri dön{' '}
          <Link href="/login">Giriş yap</Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="auth-layout">
        <div className="auth-card" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div className="spinner"></div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
