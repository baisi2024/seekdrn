'use client'

import { useState } from 'react'
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
import { Plus, Trash2 } from 'lucide-react'

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

interface StepSpecsProps {
  data: {
    specs_standardized: Record<string, SpecValue>
  }
  onChange: (data: Partial<StepSpecsProps['data']>) => void
}

export function StepSpecs({ data, onChange }: StepSpecsProps) {
  const [customSpecs, setCustomSpecs] = useState<Array<{ key: string; label: string; labelEn: string; value: number; unit: string }>>([])

  const updateSpec = (key: string, value: number, unit: string) => {
    onChange({
      specs_standardized: {
        ...data.specs_standardized,
        [key]: { value, unit },
      },
    })
  }

  const removeSpec = (key: string) => {
    const newSpecs = { ...data.specs_standardized }
    delete newSpecs[key]
    onChange({ specs_standardized: newSpecs })
  }

  const addCustomSpec = () => {
    const key = `custom_${Date.now()}`
    setCustomSpecs([...customSpecs, { key, label: '', labelEn: '', value: 0, unit: '' }])
  }

  const updateCustomSpec = (index: number, updates: Partial<typeof customSpecs[0]>) => {
    const newCustomSpecs = [...customSpecs]
    newCustomSpecs[index] = { ...newCustomSpecs[index], ...updates }
    setCustomSpecs(newCustomSpecs)
    
    // Also update specs_standardized
    const spec = newCustomSpecs[index]
    if (spec.label && spec.value) {
      updateSpec(spec.key, spec.value, spec.unit)
    }
  }

  const removeCustomSpec = (index: number) => {
    const spec = customSpecs[index]
    removeSpec(spec.key)
    setCustomSpecs(customSpecs.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <h4 className="font-medium mb-2">规格参数</h4>
        <p className="text-sm text-muted-foreground">
          填写产品的主要技术规格参数。这些参数将用于产品对比和筛选功能。
        </p>
      </div>

      {/* Predefined Specs */}
      <Card>
        <CardHeader>
          <CardTitle>标准规格参数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PREDEFINED_SPECS.map((spec) => {
              const currentValue = data.specs_standardized[spec.key]
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
                        updateSpec(spec.key, currentValue?.value || 0, unit ?? spec.defaultUnit)
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
            <CardTitle>自定义规格参数</CardTitle>
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

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">提示</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 规格参数为可选项，可在后续完善</li>
          <li>• 标准规格参数用于产品对比和筛选</li>
          <li>• 自定义规格可添加特殊参数</li>
          <li>• 单位选择会影响数值显示和对比</li>
        </ul>
      </div>
    </div>
  )
}
