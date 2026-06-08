import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')

    let query = supabaseAdmin
      .from('solutions')
      .select('*', { count: 'exact' })
      .order('sort_order')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`slug.ilike.%${search}%,translations->>en.ilike.%${search}%`)
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

    return NextResponse.json({ solutions: data, total: count || 0 })
  } catch (error) {
    console.error('Error fetching solutions:', error)
    return NextResponse.json({ error: 'Failed to fetch solutions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('solutions')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating solution:', error)
    return NextResponse.json({ error: 'Failed to create solution' }, { status: 500 })
  }
}
