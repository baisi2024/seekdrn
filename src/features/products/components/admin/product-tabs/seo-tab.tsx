'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAllSEO, upsertSEO } from '@/features/products/api/seo'
import type { ProductSEO, SEOFormData } from '@/features/products/types'
import { SEO_LIMITS } from '@/features/products/types'

const LOCALES = ['en', 'zh'] as const

interface SEOTabProps {
  productId: string
}

export function SEOTab({ productId }: SEOTabProps) {
  const [seoData, setSeoData] = useState<Record<string, ProductSEO | null>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<string>('en')

  useEffect(() => {
    async function loadSEO() {
      try {
        const data = await getAllSEO(productId)
        const seoMap: Record<string, ProductSEO | null> = {}
        LOCALES.forEach((locale) => {
          seoMap[locale] = data.find((d) => d.locale === locale) || null
        })
        setSeoData(seoMap)
      } catch (error) {
        console.error('Failed to load SEO:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSEO()
  }, [productId])

  const updateField = (locale: string, field: keyof SEOFormData, value: string | string[]) => {
    setSeoData((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        product_id: productId,
        locale,
        [field]: value,
      } as ProductSEO,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(
        LOCALES.map(async (locale) => {
          const seo = seoData[locale]
          if (seo) {
            const formData: SEOFormData = {
              meta_title: seo.meta_title || '',
              meta_description: seo.meta_description || '',
              meta_keywords: seo.meta_keywords || [],
              og_title: seo.og_title || '',
              og_description: seo.og_description || '',
              og_image: seo.og_image || '',
            }
            await upsertSEO(productId, locale, formData)
          }
        })
      )
      alert('SEO data saved successfully')
    } catch (error) {
      console.error('Failed to save SEO:', error)
      alert('Failed to save SEO data')
    } finally {
      setSaving(false)
    }
  }

  const autoGenerate = async () => {
    // This would call an API to auto-generate SEO from product data
    // For now, we'll just show a placeholder
    alert('Auto-generate functionality will be implemented with AI integration')
  }

  if (loading) {
    return <div>Loading SEO data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={autoGenerate}>
          Auto Generate
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save SEO'}
        </Button>
      </div>

      <Tabs value={currentLocale} onValueChange={setCurrentLocale}>
        <TabsList>
          {LOCALES.map((locale) => (
            <TabsTrigger key={locale} value={locale}>
              {locale.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCALES.map((locale) => (
          <TabsContent key={locale} value={locale} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meta Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <Label>Meta Title</Label>
                    <span className="text-sm text-muted-foreground">
                      {(seoData[locale]?.meta_title?.length || 0)}/{SEO_LIMITS.meta_title}
                    </span>
                  </div>
                  <Input
                    value={seoData[locale]?.meta_title || ''}
                    onChange={(e) => updateField(locale, 'meta_title', e.target.value)}
                    maxLength={SEO_LIMITS.meta_title}
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Meta Description</Label>
                    <span className="text-sm text-muted-foreground">
                      {(seoData[locale]?.meta_description?.length || 0)}/{SEO_LIMITS.meta_description}
                    </span>
                  </div>
                  <Textarea
                    value={seoData[locale]?.meta_description || ''}
                    onChange={(e) => updateField(locale, 'meta_description', e.target.value)}
                    maxLength={SEO_LIMITS.meta_description}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Meta Keywords</Label>
                  <Input
                    value={(seoData[locale]?.meta_keywords || []).join(', ')}
                    onChange={(e) =>
                      updateField(
                        locale,
                        'meta_keywords',
                        e.target.value.split(',').map((k) => k.trim()).filter(Boolean)
                      )
                    }
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(seoData[locale]?.meta_keywords || []).map((keyword, idx) => (
                      <Badge key={idx} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Graph</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <Label>OG Title</Label>
                    <span className="text-sm text-muted-foreground">
                      {(seoData[locale]?.og_title?.length || 0)}/{SEO_LIMITS.og_title}
                    </span>
                  </div>
                  <Input
                    value={seoData[locale]?.og_title || ''}
                    onChange={(e) => updateField(locale, 'og_title', e.target.value)}
                    maxLength={SEO_LIMITS.og_title}
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>OG Description</Label>
                    <span className="text-sm text-muted-foreground">
                      {(seoData[locale]?.og_description?.length || 0)}/{SEO_LIMITS.og_description}
                    </span>
                  </div>
                  <Textarea
                    value={seoData[locale]?.og_description || ''}
                    onChange={(e) => updateField(locale, 'og_description', e.target.value)}
                    maxLength={SEO_LIMITS.og_description}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>OG Image URL</Label>
                  <Input
                    value={seoData[locale]?.og_image || ''}
                    onChange={(e) => updateField(locale, 'og_image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
