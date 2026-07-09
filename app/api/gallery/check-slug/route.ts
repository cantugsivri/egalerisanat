import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserFromRequest } from '@/lib/auth'

// Slug müsaitlik kontrolü
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Slug gerekli.' }, { status: 400 })

  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(slug) || slug.length < 3 || slug.length > 50) {
    return NextResponse.json({ available: false, error: 'Geçersiz format.' })
  }

  // Reserved slugs
  const reserved = ['dashboard', 'login', 'register', 'api', 'admin', 'app', 'gallery', 'settings', 'account', 'artworks', 'qr-codes', 'theme']
  if (reserved.includes(slug)) {
    return NextResponse.json({ available: false, error: 'Bu URL kullanılamaz.' })
  }

  const existing = await prisma.gallery.findUnique({ where: { slug } })
  return NextResponse.json({ available: !existing })
}
