import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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