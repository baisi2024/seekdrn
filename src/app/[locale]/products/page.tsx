import type { Metadata } from 'next'
import { PackageOpen } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { ProductFilter } from '@/components/public/product-filter'
import { ProductSearch } from '@/components/public/product-search'
import { MissionSelector } from '@/components/public/mission-selector'
import { Breadcrumb } from '@/components/public/breadcrumb'
import { Pagination } from '@/components/public/pagination'
import { StatsBar } from '@/components/public/plp/stats-bar'
import { ViewToggleWrapper } from '@/components/public/plp/view-toggle-wrapper'
import { ProductCardEnhanced } from '@/components/public/plp/product-card-enhanced'
import { PlpBottomCta } from '@/components/public/plp/bottom-cta'
import type { Category } from '@/features/products/types/category'
import type { ProductTag } from '@/features/products/types/tag'
import type { CategoryHeroStat } from '@/features/products/types/product'
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
  searchParams: Promise<{ cat?: string; tags?: string; q?: string; mission?: string; page?: string; view?: string }>
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
  const viewMode = sp.view === 'list' ? 'list' : 'grid'

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

  // Compute stats for hero section
  const selectedCategory = categorySlug !== 'all' ? categories?.find(c => c.slug === categorySlug) : null

  // 构建查询
  let query = supabaseAdmin
    .from('products')
    .select(`
      *,
      category:product_categories(*),
      tag_objects:product_tags!product_tag_relations(*),
      product_specs(id, label, value, unit, group_id, sort_order)
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filtered: any[] = products ?? []

  // 组装 spec_groups：将 product_specs 合并到 spec_groups 配置中
  filtered = filtered.map((product) => {
    const specGroupsConfig = (product.spec_groups || []) as Array<{ id: string; label: Record<string, string>; sort_order: number }>
    const productSpecs = product.product_specs || []
    let assembledSpecGroups = product.spec_groups
    if (specGroupsConfig.length > 0 && productSpecs.length > 0) {
      assembledSpecGroups = specGroupsConfig.map((group: { id: string; label: Record<string, string>; sort_order: number }) => ({
        ...group,
        specs: productSpecs.filter((spec: { group_id: string }) => spec.group_id === group.id)
      })).filter((group: { specs: unknown[] }) => group.specs.length > 0)
    } else if (productSpecs.length > 0) {
      assembledSpecGroups = [{
        id: 'default',
        label: { en: 'Specifications' },
        specs: productSpecs,
        sort_order: 0,
      }]
    }
    return { ...product, spec_groups: assembledSpecGroups }
  })
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

  const stats: CategoryHeroStat[] = selectedCategory?.hero_stats?.length
    ? selectedCategory.hero_stats
    : [
        { value: String(totalCount), label: { en: 'Products', zh: '产品' } },
        { value: String(categories?.length || 0), label: { en: 'Categories', zh: '分类' } },
        { value: '50+', label: { en: 'Payload Options', zh: '载荷选项' } },
        { value: '30+', label: { en: 'Countries', zh: '国家' } },
      ]

  // Build base search params for pagination (exclude page)
  const paginationSearchParams: Record<string, string> = {}
  if (sp.cat) paginationSearchParams.cat = sp.cat
  if (sp.tags) paginationSearchParams.tags = sp.tags
  if (sp.q) paginationSearchParams.q = sp.q
  if (sp.mission) paginationSearchParams.mission = sp.mission
  if (sp.view) paginationSearchParams.view = sp.view

  const missionOptions = ['publicSafety', 'infrastructureInspection', 'mappingSurvey', 'perimeterSecurity', 'counterUas', 'disasterResponse'].map((key) => ({
    key,
    title: t(`missionSelector.missions.${key}.title`),
    description: t(`missionSelector.missions.${key}.description`),
    href: `/${locale}/products?mission=${key}`,
  }))

  return (
    <div className="bg-[#0A0E17]">
      {/* 页面头部 - 深色背景卡片 */}
      <section className="relative overflow-hidden bg-[#0A0E17]">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="container mx-auto px-4 py-12 lg:py-16 relative">
          <Breadcrumb
            items={[
              { label: tc('breadcrumb.home'), href: `/${locale}` },
              { label: tc('breadcrumb.products') },
            ]}
          />
          <div className="mt-6 max-w-3xl">
            <p className="text-sm font-semibold text-[#0066FF]">{t('intro.eyebrow')}</p>
            <h1 className="mt-3 text-3xl font-bold text-white lg:text-5xl">{t('title')}</h1>
            <p className="mt-4 text-lg leading-7 text-white/50">
              {t('subtitle')}
            </p>
            {missionKey && (
              <p className="mt-3 inline-flex items-center rounded-full bg-[#0066FF]/10 px-3 py-1 text-sm font-medium text-[#0066FF]">
                {t(`missionSelector.missions.${missionKey}.title`)}
              </p>
            )}
          </div>
        </div>
      </section>

      <StatsBar stats={stats} locale={locale} />

      {/* 任务选择器 */}
      <div className="container mx-auto px-4 pt-10">
        <MissionSelector
          title={t('missionSelector.title')}
          subtitle={t('missionSelector.subtitle')}
          viewLabel={t('missionSelector.viewRecommended')}
          options={missionOptions}
        />
      </div>

      {/* 搜索和筛选区 */}
      <div className="container mx-auto px-4 pt-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          <div className="shrink-0 lg:w-80">
            <ProductSearch
              locale={locale}
              defaultValue={searchQuery}
            />
          </div>
          <div className="flex-1 min-w-0">
            <ProductFilter
              categories={categories as Category[]}
              tags={tags as ProductTag[]}
              activeCategory={categorySlug}
              activeTags={tagSlugs}
              locale={locale}
            />
          </div>
          <div className="shrink-0">
            <ViewToggleWrapper />
          </div>
        </div>

        {paginatedProducts && paginatedProducts.length > 0 ? (
          <>
            <p className="mt-2 mb-6 text-sm font-medium text-white/50">
              {t('showingResults', { count: totalCount })}
            </p>
            <div className={viewMode === 'list' ? 'space-y-3' : 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'}>
              {paginatedProducts.map((product) => (
                <ProductCardEnhanced key={product.id} product={product} locale={locale} view={viewMode} />
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.06] bg-[#1A1F2E]/30 py-20">
            <PackageOpen className="mb-4 h-16 w-16 text-white/20" />
            <p className="text-base font-medium text-white/50">{t('noProducts')}</p>
            <p className="mt-1 text-sm text-white/30">
              {t('tryAdjustFilters')}
            </p>
          </div>
        )}
      </div>

      <PlpBottomCta />
    </div>
  )
}