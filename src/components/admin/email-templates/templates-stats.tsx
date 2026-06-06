'use client'

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle2, Clock } from 'lucide-react'
import { EmailTemplate } from '../email-templates-table'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

interface TemplatesStatsProps {
  templates: EmailTemplate[]
}

export function TemplatesStats({ templates }: TemplatesStatsProps) {
  const t = useAdminTranslations()
  const totalTemplates = templates.length
  const activeTemplates = templates.filter(t => t.is_active).length
  const lastUpdated = templates.length > 0 
    ? new Date(templates[0].updated_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : t('email_templates_page.noData')

  const stats = [
    {
      title: t('email_templates_page.statsTotal'),
      value: totalTemplates,
      icon: Mail,
      color: 'text-blue-600',
    },
    {
      title: t('email_templates_page.statsActive'),
      value: activeTemplates,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      title: t('email_templates_page.statsLastUpdate'),
      value: lastUpdated,
      icon: Clock,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
