import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import ArtworksClient from './ArtworksClient'

export default async function ArtworksPage() {
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
    <ArtworksClient
      initialArtworks={gallery.artworks.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        imageUrl: artwork.imageUrl,
        price: artwork.price,
        currency: artwork.currency,
        dimensions: artwork.dimensions,
        material: artwork.material,
      }))}
    />
  )
}
