import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')
    const template_key = searchParams.get('template_key')

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabaseAdmin
      .from('email_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) {
      query = query.eq('status', status)
    }

    if (template_key) {
      query = query.eq('template_key', template_key)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data,
      total: count,
      page,
      pageSize,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email logs' },
      { status: 500 }
    )
  }
}
