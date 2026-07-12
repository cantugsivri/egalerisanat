import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserFromRequest } from '@/lib/auth'

// GET: Tüm eserleri listele
export async function GET(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const gallery = await prisma.gallery.findUnique({ where: { userId: authUser.userId } })
  if (!gallery) return NextResponse.json({ artworks: [] })

  const artworks = await prisma.artwork.findMany({
    where: { galleryId: gallery.id },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json({ artworks })
}

// POST: Yeni eser ekle
export async function POST(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, artist, description, dimensions, material, price, currency, externalLinkUrl, externalLinkType, imageUrl, showPriceOnGallery, showPriceOnDetail } = body

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Başlık ve fotoğraf zorunludur.' }, { status: 400 })
    }

    const gallery = await prisma.gallery.findUnique({ where: { userId: authUser.userId } })
    if (!gallery) return NextResponse.json({ error: 'Önce galeri oluşturun.' }, { status: 404 })

    // Get max sortOrder
    const lastArtwork = await prisma.artwork.findFirst({
      where: { galleryId: gallery.id },
      orderBy: { sortOrder: 'desc' },
    })
    const sortOrder = (lastArtwork?.sortOrder ?? -1) + 1

    const artwork = await prisma.artwork.create({
      data: {
        galleryId: gallery.id,
        title,
        artist,
        description,
        dimensions,
        material,
        price: price ? parseFloat(price) : null,
        currency: currency || 'TRY',
        externalLinkUrl,
        externalLinkType,
        imageUrl,
        showPriceOnGallery: showPriceOnGallery ?? true,
        showPriceOnDetail: showPriceOnDetail ?? true,
        sortOrder,
      },
    })

    return NextResponse.json({ success: true, artwork }, { status: 201 })
  } catch (error) {
    console.error('Artwork create error:', error)
    return NextResponse.json({ error: 'Eser eklenemedi.' }, { status: 500 })
  }
}
