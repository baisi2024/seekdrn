'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Mail } from 'lucide-react'
import Link from 'next/link'
import { EmailTemplate } from '@/components/admin/email-templates-table'
import { TemplateCard } from './template-card'
import { TemplatesStats } from './templates-stats'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { AdminPage } from '@/components/admin/core'

interface EmailTemplatesClientPageProps {
  templates: EmailTemplate[]
}

export function EmailTemplatesClientPage({ templates }: EmailTemplatesClientPageProps) {
  const t = useAdminTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // 筛选模板
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // 搜索筛选
      const matchesSearch = searchQuery === '' || 
        template.template_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      // 状态筛选
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && template.is_active) ||
        (statusFilter === 'inactive' && !template.is_active)
      
      return matchesSearch && matchesStatus
    })
  }, [templates, searchQuery, statusFilter])

  // 删除模板处理函数
  const handleDeleteTemplate = async (id: string) => {
    // TODO: 实现删除逻辑
    console.log('Delete template:', id)
  }

  const filterButtons = [
    { key: 'all' as const, label: t('email_templates_page.filterAll'), count: templates.length },
    { key: 'active' as const, label: t('email_templates_page.filterActive'), count: templates.filter(t => t.is_active).length },
    { key: 'inactive' as const, label: t('email_templates_page.filterInactive'), count: templates.filter(t => !t.is_active).length },
  ]

  return (
    <AdminPage
      title="email_templates_page.title"
      actions={
        <Link href="/admin/email-templates/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t('email_templates_page.newTemplate')}
          </Button>
        </Link>
      }
    >
      {/* 统计卡片 */}
      <TemplatesStats templates={templates} />

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('email_templates_page.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {filterButtons.map((filter) => (
            <Badge
              key={filter.key}
              variant={statusFilter === filter.key ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5"
              onClick={() => setStatusFilter(filter.key)}
            >
              {filter.label} ({filter.count})
            </Badge>
          ))}
        </div>
      </div>

      {/* 模板卡片网格 */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? t('email_templates_page.noTemplatesFound')
              : t('email_templates_page.noTemplates')}
          </p>
          {searchQuery || statusFilter !== 'all' ? (
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
            >
              {t('email_templates_page.clearFilters')}
            </Button>
          ) : (
            <Link href="/admin/email-templates/new">
              <Button variant="link">{t('email_templates_page.createFirst')}</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      )}
    </AdminPage>
  )
}
