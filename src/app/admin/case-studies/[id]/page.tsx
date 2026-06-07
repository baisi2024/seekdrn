'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { MediaUpload } from '@/components/admin/image-upload'
import { TranslationTabs } from '@/components/admin/translation-tabs'
import { createClient } from '@/lib/supabase/client'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { toast } from 'sonner'

const TRANSLATION_FIELDS = ['title', 'background', 'challenge', 'solution']

interface CaseStudyData {
  id?: string
  slug: string
  industry: string
  country: string
  translations: Record<string, Record<string, string>>
  results: { value: string; metric: string; unit: string }[]
  images: string[]
  video_url: string
  client_quote: Record<string, string>
  published: boolean
  featured: boolean
  sort_order: number
}

const DEFAULT_RESULTS = [
  { value: '', metric: '', unit: '' },
  { value: '', metric: '', unit: '' },
  { value: '', metric: '', unit: '' },
]

export default function CaseStudyEditPage() {
  const params = useParams()
  const router = useRouter()
  const t = useAdminTranslations()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  const [caseStudy, setCaseStudy] = useState<CaseStudyData>({
    slug: '',
    industry: '',
    country: '',
    translations: {},
    results: DEFAULT_RESULTS,
    images: [],
    video_url: '',
    client_quote: {},
    published: true,
    featured: false,
    sort_order: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    async function loadCaseStudy() {
      if (params.id !== 'new') {
        const { data } = await supabase
          .from('case_studies')
          .select('*')
          .eq('id', params.id)
          .single()

        if (data) {
          setCaseStudy({
            ...data,
            results: data.results && data.results.length > 0 ? data.results : DEFAULT_RESULTS,
          })
        }
      }
      setLoading(false)
    }
    
    loadCaseStudy()
  }, [params.id, supabase])

  async function handleSave() {
    setSaving(true)
    try {
      const data = {
        ...caseStudy,
        id: undefined,
      }

      if (params.id === 'new') {
        const { error } = await supabase.from('case_studies').insert([data])
        if (error) throw error
        toast.success(t('caseStudyCreated'))
      } else {
        const { error } = await supabase
          .from('case_studies')
          .update(data)
          .eq('id', params.id)
        if (error) throw error
        toast.success(t('caseStudySaved'))
      }
      
      router.push('/admin/case-studies')
    } catch (error) {
      console.error('Save error:', error)
      toast.error(t('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const updateTranslation = (locale: string, field: string, value: string) => {
    setCaseStudy({
      ...caseStudy,
      translations: {
        ...caseStudy.translations,
        [locale]: {
          ...caseStudy.translations[locale],
          [field]: value,
        },
      },
    })
  }

  const updateResult = (index: number, field: 'value' | 'metric' | 'unit', value: string) => {
    const newResults = [...caseStudy.results]
    newResults[index] = { ...newResults[index], [field]: value }
    setCaseStudy({ ...caseStudy, results: newResults })
  }

  const addResult = () => {
    if (caseStudy.results.length < 6) {
      setCaseStudy({
        ...caseStudy,
        results: [...caseStudy.results, { value: '', metric: '', unit: '' }],
      })
    }
  }

  const removeResult = (index: number) => {
    if (caseStudy.results.length > 1) {
      setCaseStudy({
        ...caseStudy,
        results: caseStudy.results.filter((_, i) => i !== index),
      })
    }
  }

  if (loading) return <div className="p-8">{t('loading')}</div>

  const isNew = params.id === 'new'

  const tabs = [
    { id: 'basic', label: t('basicInfo') },
    { id: 'media', label: t('media') },
    { id: 'content', label: t('content') },
    { id: 'results', label: t('results') },
    { id: 'quote', label: t('clientQuote') },
  ]

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isNew ? t('caseStudies.add') : t('caseStudies.edit')}
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
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100'
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
                  value={caseStudy.slug}
                  onChange={(e) => setCaseStudy({ ...caseStudy, slug: e.target.value })}
                  placeholder="case-study-slug"
                />
              </div>
              <div>
                <Label>Industry</Label>
                <Input
                  value={caseStudy.industry}
                  onChange={(e) => setCaseStudy({ ...caseStudy, industry: e.target.value })}
                  placeholder="e.g., Agriculture, Construction"
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={caseStudy.country}
                  onChange={(e) => setCaseStudy({ ...caseStudy, country: e.target.value })}
                  placeholder="e.g., China, USA"
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <Label>Published</Label>
                <Switch
                  checked={caseStudy.published}
                  onCheckedChange={(checked) => setCaseStudy({ ...caseStudy, published: checked })}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <Label>Featured</Label>
                <Switch
                  checked={caseStudy.featured}
                  onCheckedChange={(checked) => setCaseStudy({ ...caseStudy, featured: checked })}
                />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={caseStudy.sort_order}
                  onChange={(e) => setCaseStudy({ ...caseStudy, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('video')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  value={caseStudy.video_url}
                  onChange={(e) => setCaseStudy({ ...caseStudy, video_url: e.target.value })}
                  placeholder="Video URL or upload below"
                />
                <MediaUpload
                  images={caseStudy.video_url ? [caseStudy.video_url] : []}
                  onChange={(urls) => setCaseStudy({ ...caseStudy, video_url: urls[0] || '' })}
                  max={1}
                  accept="video/*"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('images')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUpload
                images={caseStudy.images}
                onChange={(images) => setCaseStudy({ ...caseStudy, images })}
                max={20}
              />
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
              translations={caseStudy.translations}
              fields={TRANSLATION_FIELDS}
              onChange={updateTranslation}
              richTextFields={['background', 'challenge', 'solution']}
            />
          </CardContent>
        </Card>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('results')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseStudy.results.map((result, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 items-end p-4 border rounded-lg">
                <div>
                  <Label>Value</Label>
                  <Input
                    value={result.value}
                    onChange={(e) => updateResult(index, 'value', e.target.value)}
                    placeholder="e.g., 30%"
                  />
                </div>
                <div>
                  <Label>Metric</Label>
                  <Input
                    value={result.metric}
                    onChange={(e) => updateResult(index, 'metric', e.target.value)}
                    placeholder="e.g., Efficiency"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={result.unit}
                    onChange={(e) => updateResult(index, 'unit', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResult(index)}
                    disabled={caseStudy.results.length === 1}
                  >
                    {t('remove')}
                  </Button>
                </div>
              </div>
            ))}
            {caseStudy.results.length < 6 && (
              <Button variant="outline" onClick={addResult}>
                {t('addResult')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quote Tab */}
      {activeTab === 'quote' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('clientQuote')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>English</Label>
              <Input
                value={caseStudy.client_quote.en || ''}
                onChange={(e) => setCaseStudy({
                  ...caseStudy,
                  client_quote: { ...caseStudy.client_quote, en: e.target.value }
                })}
                placeholder="Client quote in English"
              />
            </div>
            <div>
              <Label>中文</Label>
              <Input
                value={caseStudy.client_quote.zh || ''}
                onChange={(e) => setCaseStudy({
                  ...caseStudy,
                  client_quote: { ...caseStudy.client_quote, zh: e.target.value }
                })}
                placeholder={t('case_studies_page.chinese_client_quote')}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}