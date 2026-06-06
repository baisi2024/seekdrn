'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getTranslation } from '@/lib/utils'

interface SpecGroup {
  id: string
  label: Record<string, string>
  specs: Array<{
    id: string
    label: Record<string, string>
    value: Record<string, string>
    unit: Record<string, string>
  }>
  sort_order: number
}

interface Props {
  groups: SpecGroup[]
  locale: string
}

export function SpecsSection({ groups, locale }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.map(g => g.id))
  )

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

  return (
    <section className="mb-16" data-testid="specs-section">
      <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
      <div className="space-y-4">
        {groups.map(group => (
          <Card key={group.id}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleGroup(group.id)}
              data-testid={`spec-group-${group.id}`}
            >
              <h3 className="font-semibold">
                {getTranslation(group.label, locale, 'en')}
              </h3>
              {expandedGroups.has(group.id) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            {expandedGroups.has(group.id) && (
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    {group.specs.map(spec => {
                      const label = getTranslation(spec.label, locale, 'en')
                      const value = getTranslation(spec.value, locale, 'en')
                      const unit = getTranslation(spec.unit, locale, 'en')

                      return (
                        <tr key={spec.id} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-900 w-1/3">
                            {label}
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-600">
                            {value} {unit}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}
