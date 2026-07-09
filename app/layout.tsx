import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Gallery.app — Dijital Sanat Galerisi',
    template: '%s | Gallery.app',
  },
  description: 'Kod yazmadan dakikalar içinde profesyonel dijital sanat galerini oluştur. Sanatçılar, galeriler, müzeler ve koleksiyonerler için.',
  keywords: ['dijital galeri', 'sanat galerisi', 'online galeri', 'sanatçı platformu'],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Gallery.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
