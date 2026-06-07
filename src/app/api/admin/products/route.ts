import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')

    let query = supabaseAdmin
      .from('products')
      .select('*, category:product_categories(*)', { count: 'exact' })
      .order('sort_order')
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category_id', category)
    }

    if (search) {
      query = query.textSearch('search_vector', search)
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

    return NextResponse.json({ products: data, total: count || 0 })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 支持 compare 操作
    if (body.action === 'compare' && body.ids) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*, category:product_categories(*)')
        .in('id', body.ids)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ data })
    }

    const { product, tags: tagSlugs } = body

    // 查找分类 slug（category 字段是必填的）
    let categorySlug = 'uav'
    if (product.category_id) {
      const { data: cat } = await supabaseAdmin
        .from('product_categories')
        .select('slug')
        .eq('id', product.category_id)
        .single()
      if (cat) categorySlug = cat.slug
    }

    // 插入产品
    const { data: newProduct, error } = await supabaseAdmin
      .from('products')
      .insert([{
        ...product,
        category: categorySlug,
      }])
      .select('id')
      .single()

    if (error) {
      console.error('Insert error:', error.message, error.code, error.details)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 处理标签关联
    if (tagSlugs && tagSlugs.length > 0 && newProduct.id) {
      const { data: tagData } = await supabaseAdmin
        .from('product_tags')
        .select('id, slug')
        .in('slug', tagSlugs)

      if (tagData && tagData.length > 0) {
        const tagRelations = tagData.map((tag: { id: string }) => ({
          product_id: newProduct.id,
          tag_id: tag.id,
        }))

        await supabaseAdmin
          .from('product_tag_relations')
          .insert(tagRelations)
      }
    }

    return NextResponse.json({ id: newProduct.id })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}