'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { TranslationTabs } from '@/components/admin/translation-tabs'
import { ImageUpload } from '@/components/admin/image-upload'
import { createClient } from '@/lib/supabase/client'

const TRANSLATION_FIELDS = ['name', 'overview', 'advantages', 'capabilities', 'applications']

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>({
    model: '',
    slug: '',
    category: 'uav',
    translations: {},
    images: [],
    published: true,
    featured: false,
    compliance_flag: false,
  })
  const supabase = createClient()

  useEffect(() => {
    if (params.id !== 'new') {
      fetchProduct()
    } else {
      setLoading(false)
    }
  }, [params.id])

  async function fetchProduct() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (data) {
      setProduct(data)
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (params.id === 'new') {
        const { error } = await supabase
          .from('products')
          .insert([product])
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .update(product)
          .eq('id', params.id)
        if (error) throw error
      }
      router.push('/admin/products')
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

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {params.id === 'new' ? 'Add Product' : 'Edit Product'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Model</Label>
                <Input
                  value={product.model}
                  onChange={(e) => setProduct({ ...product, model: e.target.value })}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={product.slug}
                  onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={product.published}
                  onCheckedChange={(v) => setProduct({ ...product, published: v })}
                />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={product.featured}
                  onCheckedChange={(v) => setProduct({ ...product, featured: v })}
                />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={product.compliance_flag}
                  onCheckedChange={(v) => setProduct({ ...product, compliance_flag: v })}
                />
                <Label>Compliance Required</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={product.images || []}
              onChange={(images) => setProduct({ ...product, images })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Translations</CardTitle>
          </CardHeader>
          <CardContent>
            <TranslationTabs
              translations={product.translations || {}}
              fields={TRANSLATION_FIELDS}
              onChange={updateTranslation}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
