import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 获取下载记录
    const { data: download, error } = await supabaseAdmin
      .from('product_downloads')
      .select('file_url, title')
      .eq('id', id)
      .maybeSingle()

    if (error || !download) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // 重定向到文件URL
    return NextResponse.redirect(download.file_url)
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
