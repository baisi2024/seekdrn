import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2, getPublicUrl } from '@/lib/r2'
import { supabaseAdmin } from '@/lib/supabase/admin'

const ALLOWED_MIME_TYPES = [
  ...['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'],
  ...['video/mp4', 'video/mov', 'video/webm', 'video/quicktime'],
  ...['application/pdf', 'application/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
]

const MAX_FILE_SIZE = 1024 * 1024 * 100

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const supabase = supabaseAdmin
    const urls: string[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum size of 100MB` },
          { status: 400 }
        )
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} is not allowed` },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const key = `media/${new Date().toISOString().split('T')[0]}/${crypto.randomUUID()}.${file.name.split('.').pop()}`

      await uploadToR2(key, buffer, file.type)
      const publicUrl = getPublicUrl(key)
      urls.push(publicUrl)

      await supabase.from('media').insert([{
        filename: file.name,
        r2_key: key,
        mime_type: file.type,
        size: file.size,
        alt_text: {},
      }])
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = supabaseAdmin
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('uploaded_at', { ascending: false })

    return NextResponse.json({ media: data || [] })
  } catch (error) {
    console.error('Fetch media error:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}