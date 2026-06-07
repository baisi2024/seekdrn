import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { ProductCard } from '@/components/public/product-card'
import { ProductFilter } from '@/components/public/product-filter'
import { ProductSearch } from '@/components/public/product-search'
import type { Category } from '@/features/products/types/category'
import type { ProductTag } from '@/features/products/types/tag'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'products' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/products`,
    },
  }
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string; tags?: string; q?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const categorySlug = sp.cat || 'all'
  const tagSlugs = sp.tags ? sp.tags.split(',').filter(Boolean) : []
  const searchQuery = sp.q || ''

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

  // 标签筛选
  let filtered = products ?? []
  if (tagSlugs.length > 0) {
    filtered = filtered.filter((product) => {
      const productTagSlugs = product.tag_objects?.map((tag: ProductTag) => tag.slug) || []
      return tagSlugs.some((tagSlug) => productTagSlugs.includes(tagSlug))
    })
  }

  // 文本搜索
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter((product) => {
      const name = getTranslation(product.translations, locale, 'name')?.toLowerCase() || ''
      const description = getTranslation(product.translations, locale, 'description')?.toLowerCase() || ''
      const model = product.model?.toLowerCase() || ''
      return name.includes(q) || description.includes(q) || model.includes(q)
    })
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        <ProductSearch
          locale={locale}
          defaultValue={searchQuery}
        />

        <div className="mt-6">
          <ProductFilter
            categories={categories as Category[]}
            tags={tags as ProductTag[]}
            activeCategory={categorySlug}
            activeTags={tagSlugs}
            locale={locale}
          />
        </div>

        {filtered && filtered.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {t('showingResults', { count: filtered.length })}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm">{t('noProducts')}</p>
          </div>
        )}
      </div>
    </div>
  )
}