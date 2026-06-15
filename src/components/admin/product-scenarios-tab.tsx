'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { ScenarioItem } from '@/features/products/types/product'

interface ProductScenariosTabProps {
  productId: string
  scenarios?: ScenarioItem[]
}

export function ProductScenariosTab({ productId, scenarios: initialScenarios }: ProductScenariosTabProps) {
  const [scenarios, setScenarios] = useState<ScenarioItem[]>(initialScenarios || [])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const addScenario = () => {
    setScenarios([
      ...scenarios,
      { icon: '', title: { en: '', zh: '' }, description: { en: '', zh: '' } },
    ])
  }

  const removeScenario = (index: number) => {
    setScenarios(scenarios.filter((_, i) => i !== index))
  }

  const updateScenario = (index: number, updates: Partial<ScenarioItem>) => {
    const newScenarios = [...scenarios]
    newScenarios[index] = { ...newScenarios[index], ...updates }
    setScenarios(newScenarios)
  }

  const updateTitle = (index: number, locale: 'en' | 'zh', value: string) => {
    const newScenarios = [...scenarios]
    newScenarios[index] = {
      ...newScenarios[index],
      title: { ...newScenarios[index].title, [locale]: value },
    }
    setScenarios(newScenarios)
  }

  const updateDescription = (index: number, locale: 'en' | 'zh', value: string) => {
    const newScenarios = [...scenarios]
    newScenarios[index] = {
      ...newScenarios[index],
      description: { ...newScenarios[index].description, [locale]: value },
    }
    setScenarios(newScenarios)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({ scenarios })
        .eq('id', productId)

      if (error) throw error

      toast.success('应用场景已保存')
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
          <h3 className="text-lg font-semibold">应用场景</h3>
          <p className="text-sm text-muted-foreground">
            管理产品的应用场景卡片
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addScenario}>
            <Plus className="w-4 h-4 mr-2" />
            添加场景
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {scenarios.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              暂无应用场景。点击上方按钮添加。
            </p>
          </CardContent>
        </Card>
      ) : (
        scenarios.map((scenario, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">场景 {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeScenario(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>图标</Label>
                <Input
                  value={scenario.icon}
                  onChange={(e) => updateScenario(index, { icon: e.target.value })}
                  placeholder="图标名称或 URL"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>标题 (中文)</Label>
                  <Input
                    value={scenario.title.zh || ''}
                    onChange={(e) => updateTitle(index, 'zh', e.target.value)}
                    placeholder="中文标题"
                  />
                </div>
                <div>
                  <Label>标题 (English)</Label>
                  <Input
                    value={scenario.title.en || ''}
                    onChange={(e) => updateTitle(index, 'en', e.target.value)}
                    placeholder="English Title"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>描述 (中文)</Label>
                  <Input
                    value={scenario.description.zh || ''}
                    onChange={(e) => updateDescription(index, 'zh', e.target.value)}
                    placeholder="中文描述"
                  />
                </div>
                <div>
                  <Label>描述 (English)</Label>
                  <Input
                    value={scenario.description.en || ''}
                    onChange={(e) => updateDescription(index, 'en', e.target.value)}
                    placeholder="English Description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
