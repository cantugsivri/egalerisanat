import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const authUser = await getAuthUser()

  if (!authUser) {
    redirect('/login')
  }

  const gallery = await prisma.gallery.findUnique({
    where: { userId: authUser.userId },
    select: {
      name: true,
      type: true,
      logoUrl: true,
      bio: true,
      aboutText: true,
      contactEmail: true,
      website: true,
      showArtworkName: true,
      showArtworkNumber: true,
      showArtworkPrice: true,
    },
  })

  if (!gallery) {
    redirect('/dashboard')
  }

  return <SettingsClient gallery={gallery} />
}
