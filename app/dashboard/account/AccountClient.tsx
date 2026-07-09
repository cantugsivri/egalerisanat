'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserData {
  name: string
  email: string
}

interface AccountClientProps {
  user: UserData
}

export default function AccountClient({ user }: AccountClientProps) {
  const router = useRouter()
  
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setError('')

    if (newPassword && newPassword !== newPasswordConfirm) {
      setError('Yeni şifreler eşleşmiyor.')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || null,
          newPassword: newPassword || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Hesap bilgileriniz başarıyla güncellendi.')
        setCurrentPassword('')
        setNewPassword('')
        setNewPasswordConfirm('')
        router.refresh()
      } else {
        setError(data.error || 'Bilgiler güncellenemedi.')
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmation1 = confirm('HESABINIZI TAMAMEN SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?\nBu işlem geri alınamaz. Galeriniz ve tüm eserleriniz kalıcı olarak silinecektir.')
    if (!confirmation1) return

    const confirmation2 = confirm('Lütfen son kez onaylayın. Hesabınız, galeriniz ve tüm QR kodlarınız tamamen yok edilecektir. Devam edilsin mi?')
    if (!confirmation2) return

    setDeleting(true)
    setError('')

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Hesabınız başarıyla silindi. Hoşçakalın.')
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Hesap silinemedi.')
        setDeleting(false)
      }
    } catch {
      setError('Bağlantı hatası. Hesap silinemedi.')
      setDeleting(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hesap Ayarları</h1>
          <p className="page-subtitle">Kişisel bilgilerinizi düzenleyin, şifrenizi güncelleyin ve üyelik planınızı görüntüleyin.</p>
        </div>
      </div>

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

      <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Profile Card */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Kişisel Bilgiler</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Ad Soyad</label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">E-posta Adresi</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Şifre Değiştir</h2>
          <p className="text-muted text-sm mb-4">Şifrenizi güncellemek istemiyorsanız aşağıdaki şifre alanlarını boş bırakabilirsiniz.</p>
          
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="currentPassword">Mevcut Şifre</label>
            <input
              id="currentPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required={!!newPassword}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">Yeni Şifre</label>
              <input
                id="newPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPasswordConfirm">Yeni Şifre Tekrar</label>
              <input
                id="newPasswordConfirm"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPasswordConfirm}
                onChange={e => setNewPasswordConfirm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Pricing Plan Card (Faz 2 Placeholder) */}
        <div className="card" style={{ background: 'var(--color-bg-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Üyelik Planı</h2>
              <p className="text-muted text-sm mt-1">Mevcut aboneliğiniz ve kullanım limitleriniz.</p>
            </div>
            <span className="badge badge-default" style={{ padding: '6px 12px', fontSize: 12, background: 'var(--color-border-strong)', color: '#000' }}>
              Ücretsiz Plan (TRY)
            </span>
          </div>
          <div className="divider" style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <span>Aylık Ücret:</span>
            <span style={{ fontWeight: 600, color: '#000' }}>₺0 / Ay</span>
          </div>
        </div>

        {/* Dangerous Zone Card */}
        <div className="card" style={{ borderColor: 'rgba(220,38,38,0.2)', background: '#fff' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-error)', marginBottom: 8 }}>Hesabı Kapat / Tehlikeli Bölge</h2>
          <p className="text-muted text-sm mb-4">
            Hesabınızı sildiğinizde galeriniz, eklediğiniz tüm eserler ve QR kodlar kalıcı olarak silinir ve bu işlem geri alınamaz.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="btn btn-danger"
            >
              {deleting ? 'Hesap Siliniyor...' : 'Hesabı Kalıcı Olarak Sil'}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className={`btn btn-primary btn-lg ${saving ? 'btn-loading' : ''}`}
            disabled={saving}
          >
            {saving ? '' : 'Değişiklikleri Kaydet'}
          </button>
        </div>

      </form>
    </div>
  )
}
