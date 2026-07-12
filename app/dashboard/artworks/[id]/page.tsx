import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import EditArtworkForm from './EditArtworkForm'

interface EditArtworkPageProps {
  params: Promise<{ id: string }>
}

export default async function EditArtworkPage({ params }: EditArtworkPageProps) {
  const authUser = await getAuthUser()

  if (!authUser) {
    redirect('/login')
  }

  const { id } = await params

  // Verify the artwork belongs to the logged in user's gallery
  const gallery = await prisma.gallery.findUnique({
    where: { userId: authUser.userId }
  })

  if (!gallery) {
    redirect('/dashboard')
  }

  const artwork = await prisma.artwork.findFirst({
    where: {
      id,
      galleryId: gallery.id
    }
  })

  if (!artwork) {
    redirect('/dashboard/artworks')
  }

  return (
    <EditArtworkForm
      artwork={{
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        description: artwork.description,
        dimensions: artwork.dimensions,
        material: artwork.material,
        price: artwork.price,
        currency: artwork.currency,
        externalLinkUrl: artwork.externalLinkUrl,
        externalLinkType: artwork.externalLinkType,
        imageUrl: artwork.imageUrl,
        showPriceOnGallery: artwork.showPriceOnGallery,
        showPriceOnDetail: artwork.showPriceOnDetail,
      }}
    />
  )
}
