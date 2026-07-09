'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'İşlem başarısız.')
        return
      }

      setMessage(data.message || 'Sıfırlama bağlantısı gönderildi.')
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

        <h1 className="auth-title">Şifremi Unuttum</h1>
        <p className="auth-subtitle">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim</p>

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
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-posta Adresi</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="ornek@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
              id="forgot-submit"
            >
              {loading ? '' : 'Bağlantı Gönder'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Şifrenizi hatırladınız mı?{' '}
          <Link href="/login">Giriş yap</Link>
        </div>
      </div>
    </div>
  )
}
