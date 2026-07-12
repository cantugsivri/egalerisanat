import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req)
    if (!authUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string || 'artwork' // 'artwork' | 'logo'

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Geçersiz dosya türü. PNG, JPG, WEBP veya SVG yükleyin.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya boyutu 10MB'ı geçemez." }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${type}/${uuidv4()}.${ext}`

    const blob = await put(fileName, file, {
      access: 'public',
    })

    return NextResponse.json({ success: true, url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Dosya yükleme başarısız.' }, { status: 500 })
  }
}
