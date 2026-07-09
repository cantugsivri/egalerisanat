import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import AccountClient from './AccountClient'

export default async function AccountPage() {
  const authUser = await getAuthUser()

  if (!authUser) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: {
      name: true,
      email: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return <AccountClient user={user} />
}
