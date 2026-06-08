import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')

    let query = supabaseAdmin
      .from('inquiries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('follow_up_status', status)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (page && pageSize) {
      const from = (Number(page) - 1) * Number(pageSize)
      const to = from + Number(pageSize) - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ inquiries: data, total: count || 0 })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}
