import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Suspense } from 'react'
import Sidebar from './Sidebar'
import SetupWizard from './SetupWizard'
import VerificationBanner from './VerificationBanner'

export const metadata = {
  title: 'Yönetim Paneli — Gallery.app',
  description: 'Sanat galerinizin yönetim paneli.',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authUser = await getAuthUser()

  if (!authUser) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    include: { gallery: true },
  })

  if (!user) {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    redirect('/login')
  }

  // If the setup wizard is not completed, force the wizard interface
  if (!user.setupCompleted || !user.gallery) {
    return <SetupWizard userName={user.name} />
  }

  return (
    <div className="dashboard-layout">
      <Sidebar userName={user.name} gallerySlug={user.gallery.slug} />
      <main className="dashboard-content">
        <Suspense fallback={null}>
          <VerificationBanner initialVerified={user.emailVerified} />
        </Suspense>
        {children}
      </main>
    </div>
  )
}
