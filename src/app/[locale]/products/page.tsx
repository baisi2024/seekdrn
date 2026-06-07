import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ProductCard } from '@/components/public/product-card'
import { ProductFilter } from '@/components/public/product-filter'

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const category = sp.cat || 'all'

  const t = await getTranslations('products')

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('published', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  const filtered = category === 'all'
    ? products
    : products?.filter((p) => p.category === category)

  const filterLabels = {
    all: t('filter.all'),
    uav: t('filter.uav'),
    payload: t('filter.payload'),
    cuas: t('filter.cuas'),
    ground_control: t('filter.ground_control'),
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

        <ProductFilter activeCategory={category} labels={filterLabels} />

        {filtered && filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            {t('noProducts')}
          </div>
        )}
      </div>
    </div>
  )
}
