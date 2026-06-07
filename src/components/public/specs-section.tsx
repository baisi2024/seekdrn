'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getTranslation } from '@/lib/utils'
import { useTranslations } from 'next-intl'

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
    <section className="mb-16" data-testid="specs-section">
      <h2 className="text-2xl font-bold text-foreground mb-6">{t('specs')}</h2>
      <div className="space-y-4">
        {groups.map(group => (
          <Card key={group.id}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleGroup(group.id)}
              data-testid={`spec-group-${group.id}`}
            >
              <h3 className="font-semibold text-foreground">
                {getTranslation(group.label, locale, 'en')}
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
                      const label = getTranslation(spec.label, locale, 'en')
                      const value = getTranslation(spec.value, locale, 'en')
                      const unit = getTranslation(spec.unit, locale, 'en')

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
