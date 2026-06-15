'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { PayloadItem } from '@/features/products/types/product'

interface ProductPayloadsTabProps {
  productId: string
  payloads?: PayloadItem[]
}

export function ProductPayloadsTab({ productId, payloads: initialPayloads }: ProductPayloadsTabProps) {
  const [payloads, setPayloads] = useState<PayloadItem[]>(initialPayloads || [])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const addPayload = () => {
    setPayloads([
      ...payloads,
      {
        id: `payload_${Date.now()}`,
        name: { en: '', zh: '' },
        description: { en: '', zh: '' },
        image: '',
        specs: [],
      },
    ])
  }

  const removePayload = (index: number) => {
    setPayloads(payloads.filter((_, i) => i !== index))
  }

  const updatePayload = (index: number, updates: Partial<PayloadItem>) => {
    const newPayloads = [...payloads]
    newPayloads[index] = { ...newPayloads[index], ...updates }
    setPayloads(newPayloads)
  }

  const updateName = (index: number, locale: 'en' | 'zh', value: string) => {
    const newPayloads = [...payloads]
    newPayloads[index] = {
      ...newPayloads[index],
      name: { ...newPayloads[index].name, [locale]: value },
    }
    setPayloads(newPayloads)
  }

  const updateDescription = (index: number, locale: 'en' | 'zh', value: string) => {
    const newPayloads = [...payloads]
    newPayloads[index] = {
      ...newPayloads[index],
      description: { ...newPayloads[index].description, [locale]: value },
    }
    setPayloads(newPayloads)
  }

  const addSpec = (payloadIndex: number) => {
    const newPayloads = [...payloads]
    const specs = newPayloads[payloadIndex].specs || []
    newPayloads[payloadIndex] = {
      ...newPayloads[payloadIndex],
      specs: [...specs, { label: { en: '', zh: '' }, value: { en: '', zh: '' } }],
    }
    setPayloads(newPayloads)
  }

  const removeSpec = (payloadIndex: number, specIndex: number) => {
    const newPayloads = [...payloads]
    const specs = newPayloads[payloadIndex].specs || []
    newPayloads[payloadIndex] = {
      ...newPayloads[payloadIndex],
      specs: specs.filter((_, i) => i !== specIndex),
    }
    setPayloads(newPayloads)
  }

  const updateSpecLabel = (payloadIndex: number, specIndex: number, locale: 'en' | 'zh', value: string) => {
    const newPayloads = [...payloads]
    const specs = [...(newPayloads[payloadIndex].specs || [])]
    specs[specIndex] = {
      ...specs[specIndex],
      label: { ...specs[specIndex].label, [locale]: value },
    }
    newPayloads[payloadIndex] = { ...newPayloads[payloadIndex], specs }
    setPayloads(newPayloads)
  }

  const updateSpecValue = (payloadIndex: number, specIndex: number, locale: 'en' | 'zh', value: string) => {
    const newPayloads = [...payloads]
    const specs = [...(newPayloads[payloadIndex].specs || [])]
    specs[specIndex] = {
      ...specs[specIndex],
      value: { ...specs[specIndex].value, [locale]: value },
    }
    newPayloads[payloadIndex] = { ...newPayloads[payloadIndex], specs }
    setPayloads(newPayloads)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({ payloads })
        .eq('id', productId)

      if (error) throw error

      toast.success('兼容载荷已保存')
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
          <h3 className="text-lg font-semibold">兼容载荷</h3>
          <p className="text-sm text-muted-foreground">
            管理产品兼容的载荷设备
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addPayload}>
            <Plus className="w-4 h-4 mr-2" />
            添加载荷
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {payloads.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              暂无兼容载荷。点击上方按钮添加。
            </p>
          </CardContent>
        </Card>
      ) : (
        payloads.map((payload, payloadIndex) => (
          <Card key={payload.id || payloadIndex}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">载荷 {payloadIndex + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePayload(payloadIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>名称 (中文)</Label>
                  <Input
                    value={payload.name.zh || ''}
                    onChange={(e) => updateName(payloadIndex, 'zh', e.target.value)}
                    placeholder="中文名称"
                  />
                </div>
                <div>
                  <Label>名称 (English)</Label>
                  <Input
                    value={payload.name.en || ''}
                    onChange={(e) => updateName(payloadIndex, 'en', e.target.value)}
                    placeholder="English Name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>描述 (中文)</Label>
                  <Input
                    value={payload.description.zh || ''}
                    onChange={(e) => updateDescription(payloadIndex, 'zh', e.target.value)}
                    placeholder="中文描述"
                  />
                </div>
                <div>
                  <Label>描述 (English)</Label>
                  <Input
                    value={payload.description.en || ''}
                    onChange={(e) => updateDescription(payloadIndex, 'en', e.target.value)}
                    placeholder="English Description"
                  />
                </div>
              </div>
              <div>
                <Label>图片 URL</Label>
                <Input
                  value={payload.image || ''}
                  onChange={(e) => updatePayload(payloadIndex, { image: e.target.value })}
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
                    onClick={() => addSpec(payloadIndex)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    添加参数
                  </Button>
                </div>
                {(payload.specs || []).map((spec, specIndex) => (
                  <div key={specIndex} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end border-l-2 border-muted pl-3">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={spec.label.zh || ''}
                          onChange={(e) => updateSpecLabel(payloadIndex, specIndex, 'zh', e.target.value)}
                          placeholder="参数名 (中文)"
                          className="text-sm"
                        />
                        <Input
                          value={spec.label.en || ''}
                          onChange={(e) => updateSpecLabel(payloadIndex, specIndex, 'en', e.target.value)}
                          placeholder="Label (English)"
                          className="text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={spec.value.zh || ''}
                          onChange={(e) => updateSpecValue(payloadIndex, specIndex, 'zh', e.target.value)}
                          placeholder="参数值 (中文)"
                          className="text-sm"
                        />
                        <Input
                          value={spec.value.en || ''}
                          onChange={(e) => updateSpecValue(payloadIndex, specIndex, 'en', e.target.value)}
                          placeholder="Value (English)"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpec(payloadIndex, specIndex)}
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
