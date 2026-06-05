import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DatasheetDownloadButton } from '@/components/public/datasheet-download-button'

interface ProductSpec {
  id: string
  label: Record<string, { label: string }> | { en?: string }
  value: Record<string, { value: string }> | { en?: string }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ model: string; locale: string }>
}) {
  const { model, locale } = await params
  const t = await getTranslations('products')

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('*, product_specs(*)')
    .eq('slug', model)
    .eq('published', true)
    .maybeSingle()

  if (!product) notFound()

  const name = getTranslation(product.translations, locale, 'name')
  const overview = getTranslation(product.translations, locale, 'overview')
  const advantages = getTranslation(product.translations, locale, 'advantages')
  const capabilities = getTranslation(product.translations, locale, 'capabilities')
  const applications = getTranslation(product.translations, locale, 'applications')

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            {product.images && product.images.length > 0 ? (
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <img src={product.images[0]} alt={name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                Product Image
              </div>
            )}
          </div>
          <div className="space-y-6">
            <Badge variant="outline" className="font-mono">{product.model}</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{name}</h1>
            <p className="text-lg text-gray-600">{overview}</p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}#demo-form`} className={buttonVariants({ size: 'lg' })}>
                Request Demo
              </Link>
              {product.datasheet_url && (
                <DatasheetDownloadButton productModel={product.model} datasheetUrl={product.datasheet_url} />
              )}
            </div>
          </div>
        </div>

        {/* Specs */}
        {product.product_specs && product.product_specs.length > 0 && !product.compliance_flag && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t('specs')}</h2>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    {product.product_specs.map((spec: ProductSpec, i: number) => {
                      const label = getTranslation(spec.label, locale, 'label') || (typeof spec.label?.en === 'string' ? spec.label.en : '') || ''
                      const value = getTranslation(spec.value, locale, 'value') || (typeof spec.value?.en === 'string' ? spec.value.en : '') || ''
                      return (
                        <tr key={spec.id || i} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-900 w-1/3">{label}</td>
                          <td className="px-4 py-3 font-mono text-gray-600">{value}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Compliance notice for C-UAS products */}
        {product.compliance_flag && (
          <section className="mb-16">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <p className="text-yellow-800">
                  This product requires compliance assessment. Contact us for detailed specifications.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Advantages */}
        {advantages && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t('advantages')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: advantages }} />
          </section>
        )}

        {/* Capabilities */}
        {capabilities && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t('capabilities')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: capabilities }} />
          </section>
        )}

        {/* Applications */}
        {applications && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t('applications')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: applications }} />
          </section>
        )}
      </div>
    </div>
  )
}
