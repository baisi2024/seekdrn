import type { Metadata } from 'next'
import { PackageOpen } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { ProductCard } from '@/components/public/product-card'
import { ProductFilter } from '@/components/public/product-filter'
import { ProductSearch } from '@/components/public/product-search'
import { MissionSelector } from '@/components/public/mission-selector'
import { Breadcrumb } from '@/components/public/breadcrumb'
import { Pagination } from '@/components/public/pagination'
import type { Category } from '@/features/products/types/category'
import type { ProductTag } from '@/features/products/types/tag'
import { MISSION_TAG_MAPPING } from '@/lib/constants/mission-mapping'

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
  searchParams: Promise<{ cat?: string; tags?: string; q?: string; mission?: string; page?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const missionKey = sp.mission || ''
  const currentPage = Math.max(1, parseInt(sp.page || '1', 10))
  const pageSize = 12

  // Resolve mission mapping to category and tags
  const missionMapping = missionKey ? MISSION_TAG_MAPPING[missionKey] : undefined
  const categorySlug = sp.cat || missionMapping?.category || 'all'
  const tagSlugs = sp.tags
    ? sp.tags.split(',').filter(Boolean)
    : missionMapping?.tags
      ? [...missionMapping.tags]
      : []
  const searchQuery = sp.q || ''

  const t = await getTranslations('products')
  const tc = await getTranslations('common')

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

  // Pagination
  const totalCount = filtered.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Build base search params for pagination (exclude page)
  const paginationSearchParams: Record<string, string> = {}
  if (sp.cat) paginationSearchParams.cat = sp.cat
  if (sp.tags) paginationSearchParams.tags = sp.tags
  if (sp.q) paginationSearchParams.q = sp.q
  if (sp.mission) paginationSearchParams.mission = sp.mission

  const missionOptions = ['publicSafety', 'infrastructureInspection', 'mappingSurvey', 'perimeterSecurity', 'counterUas', 'disasterResponse'].map((key) => ({
    key,
    title: t(`missionSelector.missions.${key}.title`),
    description: t(`missionSelector.missions.${key}.description`),
    href: `/${locale}/products?mission=${key}`,
  }))

  return (
    <div className="bg-background py-16">
      <div className="container mx-auto px-4">
        <Breadcrumb
          items={[
            { label: tc('breadcrumb.home'), href: `/${locale}` },
            { label: tc('breadcrumb.products') },
          ]}
        />
        <div className="mb-10 rounded-3xl border border-border bg-[#f7f8f5] p-8 lg:p-10">
          <p className="text-sm font-semibold text-primary">{t('intro.eyebrow')}</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground lg:text-5xl">{t('title')}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-7 text-muted-foreground">
            {t('subtitle')}
          </p>
          {missionKey && (
            <p className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {t(`missionSelector.missions.${missionKey}.title`)}
            </p>
          )}
        </div>

        <MissionSelector
          title={t('missionSelector.title')}
          subtitle={t('missionSelector.subtitle')}
          viewLabel={t('missionSelector.viewRecommended')}
          options={missionOptions}
        />
      </div>
      <div className="container mx-auto px-4 pt-16">

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

        {paginatedProducts && paginatedProducts.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {t('showingResults', { count: totalCount })}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={`/${locale}/products`}
              searchParams={paginationSearchParams}
            />
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <PackageOpen className="mx-auto mb-4 h-16 w-16 opacity-30" />
            <p className="text-sm">{t('noProducts')}</p>
          </div>
        )}
      </div>
    </div>
  )
}