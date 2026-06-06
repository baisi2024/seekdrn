'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TranslationTabs } from '@/components/admin/translation-tabs'
import { MediaUpload } from '@/components/admin/image-upload'
import { createClient } from '@/lib/supabase/client'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { ProductTabs, useCurrentTab } from '@/features/products/components/admin/product-tabs'
import { BasicInfoTab } from '@/features/products/components/admin/product-tabs/basic-info-tab'
import { SEOTab } from '@/features/products/components/admin/product-tabs/seo-tab'
import { FAQTab } from '@/features/products/components/admin/product-tabs/faq-tab'
import { DocumentsTab } from '@/features/products/components/admin/product-tabs/documents-tab'

const TRANSLATION_FIELDS = ['name', 'overview', 'advantages', 'capabilities', 'applications']
const RICH_TEXT_FIELDS = ['overview', 'advantages', 'capabilities', 'applications']

interface ProductData {
  id?: string
  model: string
  slug: string
  category_id: string | null
  tags: string[]
  translations: Record<string, Record<string, string>>
  images: string[]
  videos: string[]
  published: boolean
  featured: boolean
  compliance_flag: boolean
  sort_order: number
}

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const t = useAdminTranslations()
  const currentTab = useCurrentTab()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<ProductData>({
    model: '',
    slug: '',
    category_id: null,
    tags: [],
    translations: {},
    images: [],
    videos: [],
    published: true,
    featured: false,
    compliance_flag: false,
    sort_order: 0,
  })
  const supabase = createClient()

  const fetchProduct = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    if (data) {
      setProduct(data)
    }
    setLoading(false)
  }, [params.id, supabase])

  useEffect(() => {
    if (params.id !== 'new') {
      fetchProduct()
    } else {
      setLoading(false)
    }
  }, [params.id, fetchProduct])

  async function handleSave() {
    setSaving(true)
    try {
      if (params.id === 'new') {
        const { error } = await supabase
          .from('products')
          .insert([product])
        if (error) throw error
        const { data: newProduct } = await supabase
          .from('products')
          .select('id')
          .eq('slug', product.slug)
          .single()
        if (newProduct) {
          router.push(`/admin/products/${newProduct.id}`)
        }
      } else {
        const { error } = await supabase
          .from('products')
          .update(product)
          .eq('id', params.id)
        if (error) throw error
      }
      alert('Product saved successfully')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const updateTranslation = (locale: string, field: string, value: string) => {
    setProduct({
      ...product,
      translations: {
        ...product.translations,
        [locale]: {
          ...product.translations[locale],
          [field]: value,
        },
      },
    })
  }

  const updateBasicInfo = (data: Partial<{
    model: string
    slug: string
    category_id: string | null
    tags: string[]
    sort_order: number
    published: boolean
    featured: boolean
    compliance_flag: boolean
  }>) => {
    setProduct({ ...product, ...data })
  }

  if (loading) return <div>{t('loading')}</div>

  const isNewProduct = params.id === 'new'

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isNewProduct ? t('products_page.add') : t('products_page.edit')}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {isNewProduct ? (
        <div className="space-y-6">
          <BasicInfoTab
            productId="new"
            initialData={{
              model: product.model,
              slug: product.slug,
              category_id: product.category_id,
              tags: product.tags,
              sort_order: product.sort_order,
              published: product.published,
              featured: product.featured,
              compliance_flag: product.compliance_flag,
            }}
            onChange={updateBasicInfo}
          />

          <Card>
            <CardHeader>
              <CardTitle>{t('images')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUpload
                images={product.images || []}
                onChange={(images) => setProduct({ ...product, images })}
                accept="image/*"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUpload
                images={product.videos || []}
                onChange={(videos) => setProduct({ ...product, videos })}
                accept="video/*"
                max={5}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('translations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TranslationTabs
                translations={product.translations || {}}
                fields={TRANSLATION_FIELDS}
                onChange={updateTranslation}
                richTextFields={RICH_TEXT_FIELDS}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <ProductTabs productId={params.id as string}>
          {currentTab === 'basic' && (
            <div className="space-y-6">
              <BasicInfoTab
                productId={params.id as string}
                initialData={{
                  model: product.model,
                  slug: product.slug,
                  category_id: product.category_id,
                  tags: product.tags,
                  sort_order: product.sort_order,
                  published: product.published,
                  featured: product.featured,
                  compliance_flag: product.compliance_flag,
                }}
                onChange={updateBasicInfo}
              />

              <Card>
                <CardHeader>
                  <CardTitle>{t('images')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MediaUpload
                    images={product.images || []}
                    onChange={(images) => setProduct({ ...product, images })}
                    accept="image/*"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <MediaUpload
                    images={product.videos || []}
                    onChange={(videos) => setProduct({ ...product, videos })}
                    accept="video/*"
                    max={5}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {currentTab === 'content' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('translations')}</CardTitle>
              </CardHeader>
              <CardContent>
                <TranslationTabs
                  translations={product.translations || {}}
                  fields={TRANSLATION_FIELDS}
                  onChange={updateTranslation}
                  richTextFields={RICH_TEXT_FIELDS}
                />
              </CardContent>
            </Card>
          )}

          {currentTab === 'specs' && (
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Specifications can be edited on the dedicated{' '}
                  <a
                    href={`/admin/products/${params.id}/specs`}
                    className="text-primary hover:underline"
                  >
                    Specs Page
                  </a>
                </p>
              </CardContent>
            </Card>
          )}

          {currentTab === 'documents' && <DocumentsTab productId={params.id as string} />}

          {currentTab === 'seo' && <SEOTab productId={params.id as string} />}

          {currentTab === 'faq' && <FAQTab productId={params.id as string} />}

          {currentTab === 'relations' && (
            <Card>
              <CardHeader>
                <CardTitle>Related Products & Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Relations can be managed on the dedicated{' '}
                  <a
                    href={`/admin/products/${params.id}/cases`}
                    className="text-primary hover:underline"
                  >
                    Cases Page
                  </a>
                </p>
              </CardContent>
            </Card>
          )}
        </ProductTabs>
      )}
    </div>
  )
}
