'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { FeatureBlock } from '@/features/products/types/product'

interface ProductFeaturesTabProps {
  productId: string
  featureBlocks?: FeatureBlock[]
}

export function ProductFeaturesTab({ productId, featureBlocks: initialFeatureBlocks }: ProductFeaturesTabProps) {
  const [featureBlocks, setFeatureBlocks] = useState<FeatureBlock[]>(initialFeatureBlocks || [])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const addFeatureBlock = () => {
    setFeatureBlocks([
      ...featureBlocks,
      {
        id: `feature_${Date.now()}`,
        title: { en: '', zh: '' },
        description: { en: '', zh: '' },
        image: '',
        specs: [],
      },
    ])
  }

  const removeFeatureBlock = (index: number) => {
    setFeatureBlocks(featureBlocks.filter((_, i) => i !== index))
  }

  const updateFeatureBlock = (index: number, updates: Partial<FeatureBlock>) => {
    const newBlocks = [...featureBlocks]
    newBlocks[index] = { ...newBlocks[index], ...updates }
    setFeatureBlocks(newBlocks)
  }

  const updateTitle = (index: number, locale: 'en' | 'zh', value: string) => {
    const newBlocks = [...featureBlocks]
    newBlocks[index] = {
      ...newBlocks[index],
      title: { ...newBlocks[index].title, [locale]: value },
    }
    setFeatureBlocks(newBlocks)
  }

  const updateDescription = (index: number, locale: 'en' | 'zh', value: string) => {
    const newBlocks = [...featureBlocks]
    newBlocks[index] = {
      ...newBlocks[index],
      description: { ...newBlocks[index].description, [locale]: value },
    }
    setFeatureBlocks(newBlocks)
  }

  const addSpec = (blockIndex: number) => {
    const newBlocks = [...featureBlocks]
    const specs = newBlocks[blockIndex].specs || []
    newBlocks[blockIndex] = {
      ...newBlocks[blockIndex],
      specs: [...specs, { label: { en: '', zh: '' }, value: { en: '', zh: '' } }],
    }
    setFeatureBlocks(newBlocks)
  }

  const removeSpec = (blockIndex: number, specIndex: number) => {
    const newBlocks = [...featureBlocks]
    const specs = newBlocks[blockIndex].specs || []
    newBlocks[blockIndex] = {
      ...newBlocks[blockIndex],
      specs: specs.filter((_, i) => i !== specIndex),
    }
    setFeatureBlocks(newBlocks)
  }

  const updateSpecLabel = (blockIndex: number, specIndex: number, locale: 'en' | 'zh', value: string) => {
    const newBlocks = [...featureBlocks]
    const specs = [...(newBlocks[blockIndex].specs || [])]
    specs[specIndex] = {
      ...specs[specIndex],
      label: { ...specs[specIndex].label, [locale]: value },
    }
    newBlocks[blockIndex] = { ...newBlocks[blockIndex], specs }
    setFeatureBlocks(newBlocks)
  }

  const updateSpecValue = (blockIndex: number, specIndex: number, locale: 'en' | 'zh', value: string) => {
    const newBlocks = [...featureBlocks]
    const specs = [...(newBlocks[blockIndex].specs || [])]
    specs[specIndex] = {
      ...specs[specIndex],
      value: { ...specs[specIndex].value, [locale]: value },
    }
    newBlocks[blockIndex] = { ...newBlocks[blockIndex], specs }
    setFeatureBlocks(newBlocks)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({ feature_blocks: featureBlocks })
        .eq('id', productId)

      if (error) throw error

      toast.success('功能特性已保存')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">功能特性</h3>
          <p className="text-sm text-muted-foreground">
            管理产品的功能特性模块
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addFeatureBlock}>
            <Plus className="w-4 h-4 mr-2" />
            添加特性模块
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {featureBlocks.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              暂无功能特性。点击上方按钮添加。
            </p>
          </CardContent>
        </Card>
      ) : (
        featureBlocks.map((block, blockIndex) => (
          <Card key={block.id || blockIndex}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">特性模块 {blockIndex + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeatureBlock(blockIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>标题 (中文)</Label>
                  <Input
                    value={block.title.zh || ''}
                    onChange={(e) => updateTitle(blockIndex, 'zh', e.target.value)}
                    placeholder="中文标题"
                  />
                </div>
                <div>
                  <Label>标题 (English)</Label>
                  <Input
                    value={block.title.en || ''}
                    onChange={(e) => updateTitle(blockIndex, 'en', e.target.value)}
                    placeholder="English Title"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>描述 (中文)</Label>
                  <Input
                    value={block.description.zh || ''}
                    onChange={(e) => updateDescription(blockIndex, 'zh', e.target.value)}
                    placeholder="中文描述"
                  />
                </div>
                <div>
                  <Label>描述 (English)</Label>
                  <Input
                    value={block.description.en || ''}
                    onChange={(e) => updateDescription(blockIndex, 'en', e.target.value)}
                    placeholder="English Description"
                  />
                </div>
              </div>
              <div>
                <Label>图片 URL</Label>
                <Input
                  value={block.image || ''}
                  onChange={(e) => updateFeatureBlock(blockIndex, { image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Specs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">规格参数</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSpec(blockIndex)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    添加参数
                  </Button>
                </div>
                {(block.specs || []).map((spec, specIndex) => (
                  <div key={specIndex} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end border-l-2 border-muted pl-3">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={spec.label.zh || ''}
                          onChange={(e) => updateSpecLabel(blockIndex, specIndex, 'zh', e.target.value)}
                          placeholder="参数名 (中文)"
                          className="text-sm"
                        />
                        <Input
                          value={spec.label.en || ''}
                          onChange={(e) => updateSpecLabel(blockIndex, specIndex, 'en', e.target.value)}
                          placeholder="Label (English)"
                          className="text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={spec.value.zh || ''}
                          onChange={(e) => updateSpecValue(blockIndex, specIndex, 'zh', e.target.value)}
                          placeholder="参数值 (中文)"
                          className="text-sm"
                        />
                        <Input
                          value={spec.value.en || ''}
                          onChange={(e) => updateSpecValue(blockIndex, specIndex, 'en', e.target.value)}
                          placeholder="Value (English)"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpec(blockIndex, specIndex)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
