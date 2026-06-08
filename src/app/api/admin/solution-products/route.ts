import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const solutionId = searchParams.get('solution_id')

    let query = supabaseAdmin
      .from('solution_products')
      .select('*, products(id, name, slug, published)')
      .order('sort_order', { ascending: true })

    if (solutionId) {
      query = query.eq('solution_id', solutionId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching solution products:', error)
    return NextResponse.json({ error: 'Failed to fetch solution products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { solution_id, product_id, sort_order } = body

    if (!solution_id || !product_id) {
      return NextResponse.json(
        { error: 'solution_id and product_id are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('solution_products')
      .insert([{ solution_id, product_id, sort_order: sort_order || 0 }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating solution product:', error)
    return NextResponse.json({ error: 'Failed to create solution product' }, { status: 500 })
  }
}
