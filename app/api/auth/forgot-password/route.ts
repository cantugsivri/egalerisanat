import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi zorunludur.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    
    // For security reasons, don't reveal if the user exists or not,
    // but we can generate token anyway if they exist.
    if (user) {
      const token = uuidv4()
      const expiry = new Date(Date.now() + 3600000) // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry: expiry,
        },
      })

      // In development, log the link to the console for testing
      const resetLink = `${req.nextUrl.origin}/reset-password?token=${token}`
      console.log(`[DEVELOPMENT] Password Reset Link for ${user.email}: ${resetLink}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi (Mevcut ise).',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Sunucu hatası. Lütfen tekrar deneyin.' }, { status: 500 })
  }
}
