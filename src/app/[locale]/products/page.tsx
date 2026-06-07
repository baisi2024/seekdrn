import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ProductCard } from '@/components/public/product-card'
import { ProductFilter } from '@/components/public/product-filter'
import type { Category } from '@/features/products/types/category'
import type { ProductTag } from '@/features/products/types/tag'

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string; tags?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const categorySlug = sp.cat || 'all'
  const tagSlugs = sp.tags ? sp.tags.split(',').filter(Boolean) : []

  const t = await getTranslations('products')

  // 获取分类列表
  const { data: categories } = await supabaseAdmin
    .from('product_categories')
    .select('*')
    .order('sort_order')

  // 获取标签列表
  const { data: tags } = await supabaseAdmin
    .from('product_tags')
    .select('*')

  // 构建查询
  let query = supabaseAdmin
    .from('products')
    .select(`
      *,
      category:product_categories(*),
      tag_objects:product_tags!product_tag_relations(*)
    `)
    .eq('published', true)

  // 如果选择了分类，添加分类筛选
  if (categorySlug !== 'all') {
    const selectedCategory = categories?.find((c) => c.slug === categorySlug)
    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory.id)
    }
  }

  // 执行查询
  const { data: products } = await query
    .order('sort_order')
    .order('created_at', { ascending: false })

  // 如果选择了标签，在内存中筛选（因为是多对多关系）
  let filtered = products
  if (tagSlugs.length > 0) {
    filtered = products?.filter((product) => {
      const productTagSlugs = product.tag_objects?.map((tag: ProductTag) => tag.slug) || []
      return tagSlugs.some((tagSlug) => productTagSlugs.includes(tagSlug))
    })
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

        <ProductFilter
          categories={categories as Category[]}
          tags={tags as ProductTag[]}
          activeCategory={categorySlug}
          activeTags={tagSlugs}
          locale={locale}
        />

        {filtered && filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            {t('noProducts')}
          </div>
        )}
      </div>
    </div>
  )
}
