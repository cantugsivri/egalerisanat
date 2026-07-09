import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserFromRequest } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// GET: E-posta doğrulama linki tıklandığında çalışır
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Doğrulama token\'ı eksik.' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    })

    if (!user) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş doğrulama token\'ı.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    })

    // Redirect to dashboard with success message parameter
    return NextResponse.redirect(new URL('/dashboard?verified=true', req.url))
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Doğrulama sırasında bir sunucu hatası oluştu.' }, { status: 500 })
  }
}

// POST: Doğrulama e-postası gönderme isteği (dashboard banner'ından tetiklenir)
export async function POST(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'E-posta adresiniz zaten doğrulanmış.' }, { status: 400 })
    }

    const token = uuidv4()

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
      },
    })

    // In development, log the link to the console for testing
    const verifyLink = `${req.nextUrl.origin}/api/auth/verify-email?token=${token}`
    console.log(`[DEVELOPMENT] Email Verification Link for ${user.email}: ${verifyLink}`)

    return NextResponse.json({
      success: true,
      message: 'Doğrulama bağlantısı e-posta adresinize gönderildi (Terminalden kontrol edebilirsiniz).',
    })
  } catch (error) {
    console.error('Send verification email error:', error)
    return NextResponse.json({ error: 'Doğrulama e-postası gönderilemedi.' }, { status: 500 })
  }
}
