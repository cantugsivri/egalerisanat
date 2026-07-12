import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserFromRequest } from '@/lib/auth'

// GET: Tek eser
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const { id } = await params
  const gallery = await prisma.gallery.findUnique({ where: { userId: authUser.userId } })
  if (!gallery) return NextResponse.json({ error: 'Galeri bulunamadı.' }, { status: 404 })

  const artwork = await prisma.artwork.findFirst({
    where: { id, galleryId: gallery.id },
  })

  if (!artwork) return NextResponse.json({ error: 'Eser bulunamadı.' }, { status: 404 })
  return NextResponse.json({ artwork })
}

// PUT: Eser güncelle
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const { title, artist, description, dimensions, material, price, currency, externalLinkUrl, externalLinkType, imageUrl, showPriceOnGallery, showPriceOnDetail } = body

    const gallery = await prisma.gallery.findUnique({ where: { userId: authUser.userId } })
    if (!gallery) return NextResponse.json({ error: 'Galeri bulunamadı.' }, { status: 404 })

    const artwork = await prisma.artwork.findFirst({ where: { id, galleryId: gallery.id } })
    if (!artwork) return NextResponse.json({ error: 'Eser bulunamadı.' }, { status: 404 })

    const updated = await prisma.artwork.update({
      where: { id },
      data: {
        title, artist, description, dimensions, material,
        price: price ? parseFloat(price) : null,
        currency: currency || 'TRY',
        externalLinkUrl, externalLinkType, imageUrl,
        showPriceOnGallery: showPriceOnGallery ?? true,
        showPriceOnDetail: showPriceOnDetail ?? true,
      },
    })

    return NextResponse.json({ success: true, artwork: updated })
  } catch (error) {
    console.error('Artwork update error:', error)
    return NextResponse.json({ error: 'Eser güncellenemedi.' }, { status: 500 })
  }
}

// DELETE: Eser sil
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const { id } = await params
  const gallery = await prisma.gallery.findUnique({ where: { userId: authUser.userId } })
  if (!gallery) return NextResponse.json({ error: 'Galeri bulunamadı.' }, { status: 404 })

  const artwork = await prisma.artwork.findFirst({ where: { id, galleryId: gallery.id } })
  if (!artwork) return NextResponse.json({ error: 'Eser bulunamadı.' }, { status: 404 })

  await prisma.artwork.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
