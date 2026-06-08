'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { TranslationTabs } from '@/components/admin/translation-tabs'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { toast } from 'sonner'
import { X, Plus, Search, Trash2 } from 'lucide-react'

const TRANSLATION_FIELDS = ['title', 'challenge', 'solution', 'workflow']

interface Metric {
  label: string
  value: string
  unit: string
}

interface RelatedProduct {
  id: string
  product_id: string
  sort_order: number
  products?: {
    id: string
    slug: string
    published: boolean
    translations: Record<string, Record<string, string>>
  }
}

interface RelatedCase {
  id: string
  case_study_id: string
  sort_order: number
  case_studies?: {
    id: string
    slug: string
    published: boolean
    translations: Record<string, Record<string, string>>
  }
}

interface SolutionData {
  id?: string
  slug: string
  icon: string
  translations: Record<string, Record<string, string>>
  metrics: Metric[]
  published: boolean
  sort_order: number
  solution_products?: RelatedProduct[]
  solution_cases?: RelatedCase[]
}

const DEFAULT_METRICS: Metric[] = [
  { label: '', value: '', unit: '' },
]

interface ProductOption {
  id: string
  slug: string
  published: boolean
  translations: Record<string, Record<string, string>>
}

interface CaseOption {
  id: string
  slug: string
  published: boolean
  translations: Record<string, Record<string, string>>
}

export default function SolutionEditPage() {
  const params = useParams()
  const router = useRouter()
  const t = useAdminTranslations()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  const [solution, setSolution] = useState<SolutionData>({
    slug: '',
    icon: '',
    translations: {},
    metrics: DEFAULT_METRICS,
    published: false,
    sort_order: 0,
  })

  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [relatedCases, setRelatedCases] = useState<RelatedCase[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [caseSearch, setCaseSearch] = useState('')
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [caseOptions, setCaseOptions] = useState<CaseOption[]>([])
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [showCaseSearch, setShowCaseSearch] = useState(false)

  const isNew = params.id === 'new'

  useEffect(() => {
    async function loadSolution() {
      if (!isNew) {
        try {
          const res = await fetch(`/api/admin/solutions/${params.id}`)
          if (!res.ok) throw new Error('Failed to load')
          const data = await res.json()
          setSolution({
            ...data,
            metrics: data.metrics && data.metrics.length > 0 ? data.metrics : DEFAULT_METRICS,
          })
          setRelatedProducts(data.solution_products || [])
          setRelatedCases(data.solution_cases || [])
        } catch (error) {
          console.error('Load error:', error)
          toast.error(t('saveFailed'))
        }
      }
      setLoading(false)
    }

    loadSolution()
  }, [params.id, isNew, t])

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setProductOptions([])
      return
    }
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(query)}&pageSize=10`)
      const data = await res.json()
      setProductOptions(data.products || [])
    } catch {
      setProductOptions([])
    }
  }

  const searchCases = async (query: string) => {
    if (!query.trim()) {
      setCaseOptions([])
      return
    }
    try {
      const res = await fetch(`/api/admin/case-studies?search=${encodeURIComponent(query)}&pageSize=10`)
      const data = await res.json()
      setCaseOptions(data.case_studies || data || [])
    } catch {
      setCaseOptions([])
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (productSearch) searchProducts(productSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [productSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (caseSearch) searchCases(caseSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [caseSearch])

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        slug: solution.slug,
        icon: solution.icon || null,
        translations: solution.translations,
        metrics: solution.metrics.filter(m => m.label || m.value),
        published: solution.published,
        sort_order: solution.sort_order,
      }

      if (isNew) {
        const res = await fetch('/api/admin/solutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to create')
        }
        const created = await res.json()
        // Save related products and cases for new solution
        await saveRelations(created.id)
        toast.success(t('solutions_page.created'))
        router.push('/admin/solutions')
      } else {
        const res = await fetch(`/api/admin/solutions/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to update')
        }
        await saveRelations(params.id as string)
        toast.success(t('solutions_page.saved'))
        router.push('/admin/solutions')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error(t('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function saveRelations(solutionId: string) {
    // Save product relations
    const existingProductIds = relatedProducts.map(rp => rp.product_id)
    for (const rp of relatedProducts) {
      // Check if already exists
      const checkRes = await fetch(`/api/admin/solution-products?solution_id=${solutionId}`)
      const existing = await checkRes.json()
      const existingIds = (existing || []).map((e: RelatedProduct) => e.product_id)

      if (!existingIds.includes(rp.product_id)) {
        await fetch('/api/admin/solution-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            solution_id: solutionId,
            product_id: rp.product_id,
            sort_order: rp.sort_order,
          }),
        })
      }
    }

    // Remove deleted product relations
    const checkRes = await fetch(`/api/admin/solution-products?solution_id=${solutionId}`)
    const currentProducts: RelatedProduct[] = await checkRes.json()
    for (const cp of currentProducts) {
      if (!existingProductIds.includes(cp.product_id)) {
        await fetch(`/api/admin/solution-products/${cp.id}`, { method: 'DELETE' })
      }
    }

    // Save case relations
    const existingCaseIds = relatedCases.map(rc => rc.case_study_id)
    for (const rc of relatedCases) {
      const checkCaseRes = await fetch(`/api/admin/solution-cases?solution_id=${solutionId}`)
      const existingCases = await checkCaseRes.json()
      const existingCaseStudyIds = (existingCases || []).map((e: RelatedCase) => e.case_study_id)

      if (!existingCaseStudyIds.includes(rc.case_study_id)) {
        await fetch('/api/admin/solution-cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            solution_id: solutionId,
            case_study_id: rc.case_study_id,
            sort_order: rc.sort_order,
          }),
        })
      }
    }

    // Remove deleted case relations
    const checkCaseRes = await fetch(`/api/admin/solution-cases?solution_id=${solutionId}`)
    const currentCases: RelatedCase[] = await checkCaseRes.json()
    for (const cc of currentCases) {
      if (!existingCaseIds.includes(cc.case_study_id)) {
        await fetch(`/api/admin/solution-cases/${cc.id}`, { method: 'DELETE' })
      }
    }
  }

  const updateTranslation = (locale: string, field: string, value: string) => {
    setSolution({
      ...solution,
      translations: {
        ...solution.translations,
        [locale]: {
          ...solution.translations[locale],
          [field]: value,
        },
      },
    })
  }

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const newMetrics = [...solution.metrics]
    newMetrics[index] = { ...newMetrics[index], [field]: value }
    setSolution({ ...solution, metrics: newMetrics })
  }

  const addMetric = () => {
    if (solution.metrics.length < 6) {
      setSolution({
        ...solution,
        metrics: [...solution.metrics, { label: '', value: '', unit: '' }],
      })
    }
  }

  const removeMetric = (index: number) => {
    if (solution.metrics.length > 1) {
      setSolution({
        ...solution,
        metrics: solution.metrics.filter((_, i) => i !== index),
      })
    }
  }

  const addProduct = (product: ProductOption) => {
    if (relatedProducts.some(rp => rp.product_id === product.id)) return
    setRelatedProducts([
      ...relatedProducts,
      {
        id: `temp-${product.id}`,
        product_id: product.id,
        sort_order: relatedProducts.length,
        products: product,
      },
    ])
    setProductSearch('')
    setProductOptions([])
    setShowProductSearch(false)
  }

  const removeProduct = (index: number) => {
    setRelatedProducts(relatedProducts.filter((_, i) => i !== index))
  }

  const addCase = (caseStudy: CaseOption) => {
    if (relatedCases.some(rc => rc.case_study_id === caseStudy.id)) return
    setRelatedCases([
      ...relatedCases,
      {
        id: `temp-${caseStudy.id}`,
        case_study_id: caseStudy.id,
        sort_order: relatedCases.length,
        case_studies: caseStudy,
      },
    ])
    setCaseSearch('')
    setCaseOptions([])
    setShowCaseSearch(false)
  }

  const removeCase = (index: number) => {
    setRelatedCases(relatedCases.filter((_, i) => i !== index))
  }

  const getProductName = (product: ProductOption) => {
    return product.translations?.en?.title || product.translations?.zh?.title || product.slug
  }

  const getCaseName = (caseStudy: CaseOption) => {
    return caseStudy.translations?.en?.title || caseStudy.translations?.zh?.title || caseStudy.slug
  }

  if (loading) return <div className="p-8">{t('loading')}</div>

  const tabs = [
    { id: 'basic', label: t('basicInfo') },
    { id: 'content', label: t('content') },
    { id: 'metrics', label: t('solutions_page.metrics') },
    { id: 'products', label: t('solutions_page.products') },
    { id: 'cases', label: t('solutions_page.cases') },
  ]

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isNew ? t('solutions_page.add') : t('solutions_page.edit')}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 mb-6 border-b pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Slug</Label>
                <Input
                  value={solution.slug}
                  onChange={(e) => setSolution({ ...solution, slug: e.target.value })}
                  placeholder="solution-slug"
                />
              </div>
              <div>
                <Label>{t('solutions_page.icon')}</Label>
                <Input
                  value={solution.icon}
                  onChange={(e) => setSolution({ ...solution, icon: e.target.value })}
                  placeholder="icon-name"
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <Label>{t('published')}</Label>
                <Switch
                  checked={solution.published}
                  onCheckedChange={(checked) => setSolution({ ...solution, published: checked })}
                />
              </div>
              <div>
                <Label>{t('sort_order')}</Label>
                <Input
                  type="number"
                  value={solution.sort_order}
                  onChange={(e) => setSolution({ ...solution, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('content')}</CardTitle>
          </CardHeader>
          <CardContent>
            <TranslationTabs
              translations={solution.translations}
              fields={TRANSLATION_FIELDS}
              onChange={updateTranslation}
              richTextFields={['challenge', 'solution', 'workflow']}
            />
          </CardContent>
        </Card>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('solutions_page.metrics')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {solution.metrics.map((metric, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 items-end p-4 border rounded-lg">
                <div>
                  <Label>{t('solutions_page.metricLabel')}</Label>
                  <Input
                    value={metric.label}
                    onChange={(e) => updateMetric(index, 'label', e.target.value)}
                    placeholder={t('solutions_page.metricLabelPlaceholder')}
                  />
                </div>
                <div>
                  <Label>{t('solutions_page.metricValue')}</Label>
                  <Input
                    value={metric.value}
                    onChange={(e) => updateMetric(index, 'value', e.target.value)}
                    placeholder={t('solutions_page.metricValuePlaceholder')}
                  />
                </div>
                <div>
                  <Label>{t('solutions_page.metricUnit')}</Label>
                  <Input
                    value={metric.unit}
                    onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                    placeholder={t('solutions_page.metricUnitPlaceholder')}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMetric(index)}
                    disabled={solution.metrics.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {solution.metrics.length < 6 && (
              <Button variant="outline" onClick={addMetric}>
                <Plus className="w-4 h-4 mr-2" />
                {t('solutions_page.addMetric')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('solutions_page.products')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {relatedProducts.map((rp, index) => (
              <div key={rp.product_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {rp.products ? getProductName(rp.products as unknown as ProductOption) : rp.product_id}
                  </span>
                  <Badge variant={rp.products?.published ? 'default' : 'secondary'}>
                    {rp.products?.published ? t('published') : t('draft')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={rp.sort_order}
                    onChange={(e) => {
                      const newProducts = [...relatedProducts]
                      newProducts[index] = { ...newProducts[index], sort_order: parseInt(e.target.value) || 0 }
                      setRelatedProducts(newProducts)
                    }}
                    className="w-20"
                    placeholder={t('sort_order')}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeProduct(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {showProductSearch ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={t('solutions_page.searchProducts')}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                {productOptions.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {productOptions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product)}
                        className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center justify-between"
                      >
                        <span className="text-sm">{getProductName(product)}</span>
                        <Badge variant={product.published ? 'default' : 'secondary'} className="text-xs">
                          {product.published ? t('published') : t('draft')}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={() => { setShowProductSearch(false); setProductSearch(''); setProductOptions([]) }}>
                  {t('cancel')}
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowProductSearch(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('solutions_page.addProduct')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('solutions_page.cases')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {relatedCases.map((rc, index) => (
              <div key={rc.case_study_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {rc.case_studies ? getCaseName(rc.case_studies as unknown as CaseOption) : rc.case_study_id}
                  </span>
                  <Badge variant={rc.case_studies?.published ? 'default' : 'secondary'}>
                    {rc.case_studies?.published ? t('published') : t('draft')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={rc.sort_order}
                    onChange={(e) => {
                      const newCases = [...relatedCases]
                      newCases[index] = { ...newCases[index], sort_order: parseInt(e.target.value) || 0 }
                      setRelatedCases(newCases)
                    }}
                    className="w-20"
                    placeholder={t('sort_order')}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeCase(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {showCaseSearch ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                    placeholder={t('solutions_page.searchCases')}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                {caseOptions.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {caseOptions.map((caseStudy) => (
                      <button
                        key={caseStudy.id}
                        onClick={() => addCase(caseStudy)}
                        className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center justify-between"
                      >
                        <span className="text-sm">{getCaseName(caseStudy)}</span>
                        <Badge variant={caseStudy.published ? 'default' : 'secondary'} className="text-xs">
                          {caseStudy.published ? t('published') : t('draft')}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={() => { setShowCaseSearch(false); setCaseSearch(''); setCaseOptions([]) }}>
                  {t('cancel')}
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowCaseSearch(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('solutions_page.addCase')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
