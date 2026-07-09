import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import DashboardHomeClient from './DashboardHomeClient'

export default async function DashboardPage() {
  const authUser = await getAuthUser()

  if (!authUser) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    include: {
      gallery: {
        include: {
          artworks: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      },
    },
  })

  if (!user || !user.gallery) {
    // If user exists but gallery is missing, dashboard layout will redirect to wizard,
    // but we add a fallback check here just in case.
    redirect('/dashboard')
  }

  return (
    <DashboardHomeClient
      user={{ name: user.name, email: user.email }}
      gallery={{
        id: user.gallery.id,
        name: user.gallery.name,
        slug: user.gallery.slug,
        type: user.gallery.type,
        isPublished: user.gallery.isPublished,
      }}
      initialArtworks={user.gallery.artworks.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        imageUrl: artwork.imageUrl,
        price: artwork.price,
        currency: artwork.currency,
      }))}
    />
  )
}
