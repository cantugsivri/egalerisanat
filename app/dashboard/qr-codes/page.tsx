import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import QrCodesClient from './QrCodesClient'

export default async function QrCodesPage() {
  const authUser = await getAuthUser()

  if (!authUser) {
    redirect('/login')
  }

  const gallery = await prisma.gallery.findUnique({
    where: { userId: authUser.userId },
    include: {
      artworks: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  })

  if (!gallery) {
    redirect('/dashboard')
  }

  return (
    <QrCodesClient
      gallerySlug={gallery.slug}
      galleryName={gallery.name}
      galleryType={gallery.type}
      artworks={gallery.artworks.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        imageUrl: artwork.imageUrl,
      }))}
    />
  )
}
