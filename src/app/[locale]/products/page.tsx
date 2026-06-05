import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ProductCard } from '@/components/public/product-card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CATEGORIES = [
  { key: 'all', labelKey: 'filter.all' },
  { key: 'uav', labelKey: 'filter.uav' },
  { key: 'payload', labelKey: 'filter.payload' },
  { key: 'cuas', labelKey: 'filter.cuas' },
  { key: 'ground_control', labelKey: 'filter.ground_control' },
]

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

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

        <Tabs defaultValue={category} className="mb-8">
          <TabsList>
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.key} value={cat.key} asChild>
                <Link href={`?cat=${cat.key}`} replace>
                  {t(cat.labelKey)}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filtered && filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            No products found
          </div>
        )}
      </div>
    </div>
  )
}
