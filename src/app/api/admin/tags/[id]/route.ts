import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('product_tags')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching tag:', error)
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('product_tags')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get tag slug first
    const { data: tag } = await supabaseAdmin
      .from('product_tags')
      .select('slug')
      .eq('id', id)
      .single()

    if (tag) {
      // Remove tag from all products
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, tags')
        .contains('tags', [tag.slug])

      if (products) {
        await Promise.all(
          products.map(product => {
            const updatedTags = product.tags.filter((t: string) => t !== tag.slug)
            return supabaseAdmin
              .from('products')
              .update({ tags: updatedTags })
              .eq('id', product.id)
          })
        )
      }
    }

    // Delete tag
    const { error } = await supabaseAdmin
      .from('product_tags')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}
