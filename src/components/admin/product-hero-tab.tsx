'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { HeroMetric } from '@/features/products/types/product'

interface ProductHeroTabProps {
  productId: string
  heroImage?: string | null
  heroVideo?: string | null
  heroMetrics?: HeroMetric[]
}

export function ProductHeroTab({
  productId,
  heroImage: initialHeroImage,
  heroVideo: initialHeroVideo,
  heroMetrics: initialHeroMetrics,
}: ProductHeroTabProps) {
  const [heroImage, setHeroImage] = useState<string>(initialHeroImage || '')
  const [heroVideo, setHeroVideo] = useState<string>(initialHeroVideo || '')
  const [metrics, setMetrics] = useState<HeroMetric[]>(initialHeroMetrics || [])
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const addMetric = () => {
    setMetrics([
      ...metrics,
      { key: '', value: '', unit: '', label: { en: '', zh: '' } },
    ])
  }

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index))
  }

  const updateMetric = (
    index: number,
    field: keyof HeroMetric | 'label_en' | 'label_zh',
    value: string
  ) => {
    const updated = [...metrics]
    if (field === 'label_en') {
      updated[index] = {
        ...updated[index],
        label: { ...updated[index].label, en: value },
      }
    } else if (field === 'label_zh') {
      updated[index] = {
        ...updated[index],
        label: { ...updated[index].label, zh: value },
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setMetrics(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({
          hero_image: heroImage || null,
          hero_video: heroVideo || null,
          hero_metrics: metrics,
        })
        .eq('id', productId)

      if (error) throw error

      toast.success('Hero 配置已保存')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      {/* Hero Background */}
      <Card>
        <CardHeader>
          <CardTitle>Hero 背景</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hero 图片 URL</Label>
            <Input
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              placeholder="https://example.com/hero-image.jpg"
            />
          </div>

          {heroImage && (
            <div className="mt-2">
              <Image
                src={heroImage}
                alt="Hero preview"
                width={480}
                height={192}
                className="max-h-48 rounded-md border object-cover"
              />
            </div>
          )}

          <div>
            <Label>Hero 视频 URL（可选）</Label>
            <Input
              value={heroVideo}
              onChange={(e) => setHeroVideo(e.target.value)}
              placeholder="https://example.com/hero-video.mp4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hero Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hero 指标</CardTitle>
            <Button variant="outline" size="sm" onClick={addMetric}>
              <Plus className="w-4 h-4 mr-2" />
              添加指标
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              暂无指标。点击上方按钮添加。
            </p>
          ) : (
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-3 items-end"
                >
                  <div className="flex items-end pb-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div>
                    <Label>Key</Label>
                    <Input
                      value={metric.key}
                      onChange={(e) => updateMetric(index, 'key', e.target.value)}
                      placeholder="metric_key"
                    />
                  </div>

                  <div>
                    <Label>Value</Label>
                    <Input
                      value={metric.value}
                      onChange={(e) => updateMetric(index, 'value', e.target.value)}
                      placeholder="值"
                    />
                  </div>

                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={metric.unit || ''}
                      onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                      placeholder="单位"
                    />
                  </div>

                  <div>
                    <Label>Label (EN)</Label>
                    <Input
                      value={metric.label?.en || ''}
                      onChange={(e) => updateMetric(index, 'label_en', e.target.value)}
                      placeholder="English label"
                    />
                  </div>

                  <div>
                    <Label>Label (ZH)</Label>
                    <Input
                      value={metric.label?.zh || ''}
                      onChange={(e) => updateMetric(index, 'label_zh', e.target.value)}
                      placeholder="中文标签"
                    />
                  </div>

                  <div className="flex items-end pb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMetric(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
