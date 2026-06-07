'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// 预定义规格字段
const PREDEFINED_SPECS = [
  { key: 'weight', label: '重量', labelEn: 'Weight', defaultUnit: 'kg', units: ['kg', 'g', 'lb'] },
  { key: 'maxTakeOffWeight', label: '最大起飞重量', labelEn: 'Max Takeoff Weight', defaultUnit: 'kg', units: ['kg', 'g', 'lb'] },
  { key: 'wingspan', label: '翼展', labelEn: 'Wingspan', defaultUnit: 'm', units: ['m', 'cm', 'mm', 'ft'] },
  { key: 'length', label: '长度', labelEn: 'Length', defaultUnit: 'm', units: ['m', 'cm', 'mm', 'ft'] },
  { key: 'maxEndurance', label: '最大续航时间', labelEn: 'Max Endurance', defaultUnit: 'min', units: ['min', 'h', 's'] },
  { key: 'maxRange', label: '最大航程', labelEn: 'Max Range', defaultUnit: 'km', units: ['km', 'm', 'mi', 'nmi'] },
  { key: 'cruiseSpeed', label: '巡航速度', labelEn: 'Cruise Speed', defaultUnit: 'km/h', units: ['km/h', 'm/s', 'mph', 'kt'] },
  { key: 'maxSpeed', label: '最大速度', labelEn: 'Max Speed', defaultUnit: 'km/h', units: ['km/h', 'm/s', 'mph', 'kt'] },
  { key: 'maxCeiling', label: '最大升限', labelEn: 'Max Ceiling', defaultUnit: 'm', units: ['m', 'ft', 'km'] },
  { key: 'payloadCapacity', label: '有效载荷', labelEn: 'Payload Capacity', defaultUnit: 'kg', units: ['kg', 'g', 'lb'] },
  { key: 'maxControlDistance', label: '最大控制距离', labelEn: 'Max Control Distance', defaultUnit: 'km', units: ['km', 'm', 'mi'] },
]

interface SpecValue {
  value: number
  unit: string
}

interface SpecsTabProps {
  productId: string
}

export function SpecsTab({ productId }: SpecsTabProps) {
  const t = useAdminTranslations()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [specs, setSpecs] = useState<Record<string, SpecValue>>({})
  const [customSpecs, setCustomSpecs] = useState<Array<{
    key: string
    label: string
    labelEn: string
    value: number
    unit: string
  }>>([])

  useEffect(() => {
    async function loadSpecs() {
      const { data } = await supabase
        .from('products')
        .select('specs_standardized')
        .eq('id', productId)
        .single()

      if (data?.specs_standardized) {
        setSpecs(data.specs_standardized)
        
        // Extract custom specs
        const customKeys = Object.keys(data.specs_standardized).filter(
          key => !PREDEFINED_SPECS.find(s => s.key === key)
        )
        const customSpecsData = customKeys.map(key => ({
          key,
          label: data.specs_standardized[key].label?.zh || key,
          labelEn: data.specs_standardized[key].label?.en || key,
          value: data.specs_standardized[key].value,
          unit: data.specs_standardized[key].unit,
        }))
        setCustomSpecs(customSpecsData)
      }
      setLoading(false)
    }
    
    loadSpecs()
  }, [productId, supabase])

  const updateSpec = (key: string, value: number, unit: string) => {
    setSpecs(prev => ({
      ...prev,
      [key]: { value, unit },
    }))
  }

  const removeSpec = (key: string) => {
    const newSpecs = { ...specs }
    delete newSpecs[key]
    setSpecs(newSpecs)
  }

  const addCustomSpec = () => {
    const key = `custom_${Date.now()}`
    setCustomSpecs([...customSpecs, { key, label: '', labelEn: '', value: 0, unit: '' }])
  }

  const updateCustomSpec = (index: number, updates: Partial<typeof customSpecs[0]>) => {
    const newCustomSpecs = [...customSpecs]
    newCustomSpecs[index] = { ...newCustomSpecs[index], ...updates }
    setCustomSpecs(newCustomSpecs)
  }

  const removeCustomSpec = (index: number) => {
    const spec = customSpecs[index]
    removeSpec(spec.key)
    setCustomSpecs(customSpecs.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Build specs_standardized object
      const specsStandardized = { ...specs }
      customSpecs.forEach(spec => {
        if (spec.label && spec.value) {
          specsStandardized[spec.key] = {
            value: spec.value,
            unit: spec.unit,
            label: {
              zh: spec.label,
              en: spec.labelEn,
            },
          }
        }
      })

      const { error } = await supabase
        .from('products')
        .update({ specs_standardized: specsStandardized })
        .eq('id', productId)

      if (error) throw error

      toast.success('规格参数已更新')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-4">{t('loading')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">标准化规格参数</h3>
          <p className="text-sm text-muted-foreground">
            这些参数用于产品对比和筛选功能
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/admin/products/${productId}/specs`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            详细规格页面
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {/* Predefined Specs */}
      <Card>
        <CardHeader>
          <CardTitle>标准规格</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PREDEFINED_SPECS.map((spec) => {
              const currentValue = specs[spec.key]
              return (
                <div key={spec.key} className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <Label>{spec.label}</Label>
                    <p className="text-xs text-muted-foreground">{spec.labelEn}</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={currentValue?.value || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        updateSpec(spec.key, value, currentValue?.unit || spec.defaultUnit)
                      }}
                      placeholder="数值"
                      className="flex-1"
                    />
                    <Select
                      value={currentValue?.unit || spec.defaultUnit}
                      onValueChange={(unit) => {
                        updateSpec(spec.key, currentValue?.value || 0, unit)
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {spec.units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    {currentValue && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpec(spec.key)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Specs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>自定义规格</CardTitle>
            <Button variant="outline" size="sm" onClick={addCustomSpec}>
              <Plus className="w-4 h-4 mr-2" />
              添加自定义规格
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customSpecs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              暂无自定义规格。点击上方按钮添加。
            </p>
          ) : (
            <div className="space-y-4">
              {customSpecs.map((spec, index) => (
                <div key={spec.key} className="grid grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>中文名称</Label>
                    <Input
                      value={spec.label}
                      onChange={(e) => updateCustomSpec(index, { label: e.target.value })}
                      placeholder="规格名称"
                    />
                  </div>
                  <div>
                    <Label>英文名称</Label>
                    <Input
                      value={spec.labelEn}
                      onChange={(e) => updateCustomSpec(index, { labelEn: e.target.value })}
                      placeholder="Spec Name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={spec.value}
                      onChange={(e) => updateCustomSpec(index, { value: parseFloat(e.target.value) || 0 })}
                      placeholder="数值"
                      className="flex-1"
                    />
                    <Input
                      value={spec.unit}
                      onChange={(e) => updateCustomSpec(index, { unit: e.target.value })}
                      placeholder="单位"
                      className="w-20"
                    />
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomSpec(index)}
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
