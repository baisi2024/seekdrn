'use client'

import { useState, useEffect } from 'react'
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
import { SpecsTab } from '@/features/products/components/admin/product-tabs/specs-tab'
import { RelationsTab } from '@/features/products/components/admin/product-tabs/relations-tab'
import { ProductHeroTab } from '@/components/admin/product-hero-tab'
import { ProductScenariosTab } from '@/components/admin/product-scenarios-tab'
import { ProductFeaturesTab } from '@/components/admin/product-features-tab'
import { ProductPayloadsTab } from '@/components/admin/product-payloads-tab'
import { ProductWizard } from '@/features/products/components/admin/product-wizard'
import { AdminPage } from '@/components/admin/core'
import { toast } from 'sonner'
import type { Category, ProductTag } from '@/features/products/types'
import type { ScenarioItem, FeatureBlock, PayloadItem } from '@/features/products/types/product'

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
  hero_image?: string | null
  hero_video?: string | null
  hero_metrics?: Array<{
    key: string
    value: string
    unit?: string
    label: Record<string, string>
  }>
  scenarios?: ScenarioItem[]
  feature_blocks?: FeatureBlock[]
  payloads?: PayloadItem[]
}

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const t = useAdminTranslations()
  const currentTab = useCurrentTab()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<ProductTag[]>([])
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

  // Fetch categories and tags on mount
  useEffect(() => {
    async function fetchInitialData() {
      const [catRes, tagRes] = await Promise.all([
        supabase.from('product_categories').select('*').order('sort_order'),
        supabase.from('product_tags').select('*').order('created_at', { ascending: false }),
      ])
      if (catRes.data) setCategories(catRes.data)
      if (tagRes.data) setTags(tagRes.data)
    }
    fetchInitialData()
  }, [supabase])

  useEffect(() => {
    async function loadProduct() {
      if (params.id !== 'new') {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single()

        if (data) {
          setProduct(data)
        }
      }
      setLoading(false)
    }
    
    loadProduct()
  }, [params.id, supabase])

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', params.id)
      if (error) throw error
      
      toast.success(t('productSaved'))
    } catch (error) {
      console.error('Save error:', error)
      toast.error(t('saveFailed'))
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

  if (loading) return <div className="p-8">{t('loading')}</div>

  const isNewProduct = params.id === 'new'

  // 新建产品：使用向导组件
  if (isNewProduct) {
    return (
      <AdminPage title="products_page.add">
        <ProductWizard categories={categories} tags={tags} />
      </AdminPage>
    )
  }

  // 编辑产品：使用 Tab 式布局
  return (
    <AdminPage
      title="products_page.edit"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      }
    >
      <ProductTabs productId={params.id as string}>
        {currentTab === 'basic' && (
          <div className="space-y-6">
            <BasicInfoTab
              productId={params.id as string}
              categories={categories}
              tags={tags}
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
                <CardTitle>{t('videos')}</CardTitle>
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

        {currentTab === 'specs' && <SpecsTab productId={params.id as string} />}

        {currentTab === 'scenarios' && (
          <ProductScenariosTab
            productId={params.id as string}
            scenarios={product.scenarios}
          />
        )}

        {currentTab === 'features' && (
          <ProductFeaturesTab
            productId={params.id as string}
            featureBlocks={product.feature_blocks}
          />
        )}

        {currentTab === 'payloads' && (
          <ProductPayloadsTab
            productId={params.id as string}
            payloads={product.payloads}
          />
        )}

        {currentTab === 'documents' && <DocumentsTab productId={params.id as string} />}

        {currentTab === 'seo' && <SEOTab productId={params.id as string} />}

        {currentTab === 'faq' && <FAQTab productId={params.id as string} />}

        {currentTab === 'relations' && <RelationsTab productId={params.id as string} />}

        {currentTab === 'hero' && (
          <ProductHeroTab
            productId={params.id as string}
            heroImage={product.hero_image}
            heroVideo={product.hero_video}
            heroMetrics={product.hero_metrics}
          />
        )}
      </ProductTabs>
    </AdminPage>
  )
}
