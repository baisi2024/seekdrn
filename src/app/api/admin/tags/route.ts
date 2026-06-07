import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeProductCount = searchParams.get('includeProductCount') === 'true'

    const { data, error } = await supabaseAdmin
      .from('product_tags')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (includeProductCount) {
      const tagsWithCount = await Promise.all(
        data.map(async (tag) => {
          const { count } = await supabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .contains('tags', [tag.slug])

          return { ...tag, product_count: count || 0 }
        })
      )
      return NextResponse.json(tagsWithCount)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('product_tags')
      .insert([body])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
