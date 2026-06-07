import { supabaseAdmin } from '@/lib/supabase/admin'
import { ProductsClient } from './products-client'

export default async function ProductsPage() {
  // 获取产品列表，包含分类和标签关联
  const { data: products } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:product_categories(id, slug, translations),
      tag_objects:product_tags(id, slug, translations)
    `)
    .order('sort_order')
    .order('created_at', { ascending: false })

  // 获取分类列表
  const { data: categories } = await supabaseAdmin
    .from('product_categories')
    .select('id, slug, translations')
    .order('sort_order')

  // 获取标签列表
  const { data: tags } = await supabaseAdmin
    .from('product_tags')
    .select('id, slug, translations')

  return (
    <ProductsClient
      products={products || []}
      categories={categories || []}
      tags={tags || []}
    />
  )
}
