'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { getLocalizedValue } from '@/lib/utils'

interface SpecGroup {
  id: string
  label: Record<string, string>
  specs: Array<{
    id: string
    label: Record<string, string> | string
    value: Record<string, string> | string
    unit: Record<string, string> | string
  }>
  sort_order: number
}

interface Props {
  groups: SpecGroup[]
  locale: string
}

export function SpecsSection({ groups, locale }: Props) {
  const t = useTranslations('products')
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
    <section data-testid="specs-section">
      <div className="space-y-4">
        {groups.map(group => (
          <Card key={group.id}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleGroup(group.id)}
              data-testid={`spec-group-${group.id}`}
            >
              <h3 className="font-semibold text-foreground">
                {getLocalizedValue(group.label, locale)}
              </h3>
              {expandedGroups.has(group.id) ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            {expandedGroups.has(group.id) && (
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    {group.specs.map(spec => {
                      const label = getLocalizedValue(spec.label, locale)
                      const value = getLocalizedValue(spec.value, locale)
                      const unit = getLocalizedValue(spec.unit, locale)

                      return (
                        <tr key={spec.id} className="border-b last:border-0 border-border">
                          <td className="px-4 py-3 font-medium text-foreground w-1/3">
                            {label}
                          </td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">
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
