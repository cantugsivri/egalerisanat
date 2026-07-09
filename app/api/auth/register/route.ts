import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, rememberMe } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Şifre en az 8 karakter olmalıdır.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      const isValid = await bcrypt.compare(password, existing.password)
      if (isValid) {
        const token = await signToken({ userId: existing.id, email: existing.email })
        const cookieConfig = setAuthCookie(token, !!rememberMe)
        const response = NextResponse.json({
          success: true,
          user: { id: existing.id, email: existing.email, name: existing.name },
        }, { status: 200 })
        response.cookies.set(cookieConfig)
        return response
      } else {
        return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı ve girdiğiniz şifre hatalı.' }, { status: 409 })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
      },
    })

    const token = await signToken({ userId: user.id, email: user.email })
    const cookieConfig = setAuthCookie(token, !!rememberMe)

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    }, { status: 201 })

    response.cookies.set(cookieConfig)
    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Sunucu hatası. Lütfen tekrar deneyin.' }, { status: 500 })
  }
}
