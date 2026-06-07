'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface SpecGroup {
  id: string
  label: Record<string, string>
  specs: Spec[]
  sort_order: number
}

interface Spec {
  id: string
  label: Record<string, string>
  value: Record<string, string>
  unit: Record<string, string>
  group_id: string
  sort_order: number
}

interface Props {
  productId: string
  initialGroups?: SpecGroup[]
  initialSpecs?: Spec[]
  onSave: (groups: SpecGroup[], specs: Spec[]) => Promise<void>
}

export function SpecGroupsEditor({ productId, initialGroups = [], initialSpecs = [], onSave }: Props) {
  const [groups, setGroups] = useState<SpecGroup[]>(initialGroups)
  const [specs, setSpecs] = useState<Spec[]>(initialSpecs)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const addGroup = () => {
    const newGroup: SpecGroup = {
      id: `group-${Date.now()}`,
      label: { en: '', zh: '' },
      specs: [],
      sort_order: groups.length
    }
    setGroups([...groups, newGroup])
    setExpandedGroups(new Set([...expandedGroups, newGroup.id]))
  }

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId))
    setSpecs(specs.filter(s => s.group_id !== groupId))
  }

  const updateGroupLabel = (groupId: string, locale: string, value: string) => {
    setGroups(groups.map(g => 
      g.id === groupId 
        ? { ...g, label: { ...g.label, [locale]: value } }
        : g
    ))
  }

  const addSpec = (groupId: string) => {
    const newSpec: Spec = {
      id: `spec-${Date.now()}`,
      label: { en: '', zh: '' },
      value: { en: '', zh: '' },
      unit: { en: '', zh: '' },
      group_id: groupId,
      sort_order: specs.filter(s => s.group_id === groupId).length
    }
    setSpecs([...specs, newSpec])
  }

  const deleteSpec = (specId: string) => {
    setSpecs(specs.filter(s => s.id !== specId))
  }

  const updateSpec = (specId: string, field: 'label' | 'value' | 'unit', locale: string, value: string) => {
    setSpecs(specs.map(s =>
      s.id === specId
        ? { ...s, [field]: { ...s[field], [locale]: value } }
        : s
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(groups, specs)
      alert('Saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Specification Groups</h2>
        <Button onClick={addGroup}>
          <Plus className="w-4 h-4 mr-2" />
          Add Group
        </Button>
      </div>

      {groups.map(group => (
        <Card key={group.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroup(group.id)}
                >
                  {expandedGroups.has(group.id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
                <Input
                  placeholder="Group name (EN)"
                  value={group.label.en || ''}
                  onChange={(e) => updateGroupLabel(group.id, 'en', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Group name (ZH)"
                  value={group.label.zh || ''}
                  onChange={(e) => updateGroupLabel(group.id, 'zh', e.target.value)}
                  className="flex-1"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteGroup(group.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          
          {expandedGroups.has(group.id) && (
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSpec(group.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Spec
              </Button>

              {specs
                .filter(s => s.group_id === group.id)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(spec => (
                  <div key={spec.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSpec(spec.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Label (EN)</Label>
                        <Input
                          value={spec.label.en || ''}
                          onChange={(e) => updateSpec(spec.id, 'label', 'en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Label (ZH)</Label>
                        <Input
                          value={spec.label.zh || ''}
                          onChange={(e) => updateSpec(spec.id, 'label', 'zh', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Value (EN)</Label>
                        <Input
                          value={spec.value.en || ''}
                          onChange={(e) => updateSpec(spec.id, 'value', 'en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Value (ZH)</Label>
                        <Input
                          value={spec.value.zh || ''}
                          onChange={(e) => updateSpec(spec.id, 'value', 'zh', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Unit (EN)</Label>
                        <Input
                          value={spec.unit.en || ''}
                          onChange={(e) => updateSpec(spec.id, 'unit', 'en', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Unit (ZH)</Label>
                        <Input
                          value={spec.unit.zh || ''}
                          onChange={(e) => updateSpec(spec.id, 'unit', 'zh', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          )}
        </Card>
      ))}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
