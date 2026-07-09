import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserFromRequest } from '@/lib/auth'

// GET: Kullanıcının galerisi
export async function GET(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const gallery = await prisma.gallery.findUnique({
    where: { userId: authUser.userId },
    include: { artworks: { orderBy: { sortOrder: 'asc' } } },
  })

  return NextResponse.json({ gallery })
}

// POST: Galeri oluştur (setup wizard)
export async function POST(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, slug, type, logoUrl, theme, bio } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Galeri adı ve URL zorunludur.' }, { status: 400 })
    }

    // Slug validation
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json({ error: 'URL yalnızca küçük harf, rakam ve tire içerebilir.' }, { status: 400 })
    }

    // Check slug availability
    const existing = await prisma.gallery.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Bu URL zaten kullanımda.' }, { status: 409 })
    }

    // Check user doesn't already have a gallery
    const userGallery = await prisma.gallery.findUnique({ where: { userId: authUser.userId } })
    if (userGallery) {
      return NextResponse.json({ error: 'Zaten bir galeriye sahipsiniz.' }, { status: 409 })
    }

    const gallery = await prisma.gallery.create({
      data: {
        userId: authUser.userId,
        name,
        slug,
        type: type || 'GALLERY',
        logoUrl,
        theme: theme || 'MINIMAL',
        bio,
        isPublished: true,
      },
    })

    // Mark setup as completed
    await prisma.user.update({
      where: { id: authUser.userId },
      data: { setupCompleted: true },
    })

    return NextResponse.json({ success: true, gallery }, { status: 201 })
  } catch (error) {
    console.error('Gallery create error:', error)
    return NextResponse.json({ error: 'Galeri oluşturulamadı.' }, { status: 500 })
  }
}

// PUT: Galeri güncelle
export async function PUT(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, type, logoUrl, theme, bio, contactEmail, website, showArtworkName, showArtworkNumber, showArtworkPrice } = body

    const gallery = await prisma.gallery.update({
      where: { userId: authUser.userId },
      data: { 
        name, type, logoUrl, theme, bio, contactEmail, website,
        ...(showArtworkName !== undefined && { showArtworkName }),
        ...(showArtworkNumber !== undefined && { showArtworkNumber }),
        ...(showArtworkPrice !== undefined && { showArtworkPrice }),
      },
    })

    return NextResponse.json({ success: true, gallery })
  } catch (error) {
    console.error('Gallery update error:', error)
    return NextResponse.json({ error: 'Galeri güncellenemedi.' }, { status: 500 })
  }
}
