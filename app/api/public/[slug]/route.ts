import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Public galeri verisi
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const gallery = await prisma.gallery.findUnique({
    where: { slug, isPublished: true },
    include: {
      artworks: { orderBy: { sortOrder: 'asc' } },
      user: { select: { name: true } },
    },
  })

  if (!gallery) {
    return NextResponse.json({ error: 'Galeri bulunamadı.' }, { status: 404 })
  }

  return NextResponse.json({ gallery })
}
