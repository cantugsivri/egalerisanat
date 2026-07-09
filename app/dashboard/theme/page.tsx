import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import ThemePageClient from './ThemePageClient'

export default async function ThemePage() {
  const authUser = await getAuthUser()

  if (!authUser) {
    redirect('/login')
  }

  const gallery = await prisma.gallery.findUnique({
    where: { userId: authUser.userId },
    select: { theme: true },
  })

  if (!gallery) {
    redirect('/dashboard')
  }

  return <ThemePageClient initialTheme={gallery.theme} />
}
