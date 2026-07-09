import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// PUT: Güncelle profil ve şifre
export async function PUT(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })
  }

  try {
    const { name, email, currentPassword, newPassword } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Ad Soyad ve E-posta zorunludur.' }, { status: 400 })
    }

    // Check email uniqueness if email is changing
    if (email.toLowerCase() !== authUser.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })
      if (existing) {
        return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda.' }, { status: 409 })
      }
    }

    const updateData: { name: string; email: string; password?: string } = {
      name,
      email: email.toLowerCase(),
    }

    // Password change logic
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Mevcut şifrenizi girmelisiniz.' }, { status: 400 })
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Yeni şifre en az 8 karakter olmalıdır.' }, { status: 400 })
      }

      const user = await prisma.user.findUnique({ where: { id: authUser.userId } })
      if (!user) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 })
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: 'Mevcut şifreniz hatalı.' }, { status: 400 })
      }

      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Profil güncellenemedi.' }, { status: 500 })
  }
}

// DELETE: Hesabı Sil
export async function DELETE(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })
  }

  try {
    // Delete user (Prisma cascade delete will remove galleries and artworks because Cascade is set up in schema)
    await prisma.user.delete({
      where: { id: authUser.userId },
    })

    // Clear auth token
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Hesap silinemedi.' }, { status: 500 })
  }
}
