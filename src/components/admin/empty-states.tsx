'use client'

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileX, 
  Mail, 
  Inbox, 
  Search, 
  Plus,
  RefreshCw 
} from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  className?: string
}

/**
 * 空状态组件
 */
export const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-4">
        {/* 图标 */}
        <div className="mb-4 rounded-full bg-muted p-4">
          {icon || <FileX className="h-8 w-8 text-muted-foreground" />}
        </div>
        
        {/* 标题 */}
        <h3 className="text-lg font-semibold text-center mb-2">
          {title}
        </h3>
        
        {/* 描述 */}
        {description && (
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
            {description}
          </p>
        )}
        
        {/* 操作按钮 */}
        {action && (
          <Button onClick={action.onClick} className="gap-2">
            {action.icon}
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
})

/**
 * 邮件模板空状态
 */
export const EmptyTemplatesState = memo(function EmptyTemplatesState({
  onCreate,
}: {
  onCreate?: () => void
}) {
  const t = useAdminTranslations()
  return (
    <EmptyState
      icon={<Mail className="h-8 w-8 text-muted-foreground" />}
      title={t('empty_states.no_templates')}
      description={t('empty_states.create_first_template')}
      action={onCreate ? {
        label: t('empty_states.create_template'),
        onClick: onCreate,
        icon: <Plus className="h-4 w-4" />,
      } : undefined}
    />
  )
})

/**
 * 邮件日志空状态
 */
export const EmptyLogsState = memo(function EmptyLogsState({
  onRefresh,
}: {
  onRefresh?: () => void
}) {
  const t = useAdminTranslations()
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
      title={t('empty_states.no_logs')}
      description={t('empty_states.no_emails_yet')}
      action={onRefresh ? {
        label: t('empty_states.refresh'),
        onClick: onRefresh,
        icon: <RefreshCw className="h-4 w-4" />,
      } : undefined}
    />
  )
})

/**
 * 搜索结果空状态
 */
export const EmptySearchState = memo(function EmptySearchState({
  query,
  onClear,
}: {
  query: string
  onClear?: () => void
}) {
  const t = useAdminTranslations()
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title={t('empty_states.no_results')}
      description={t('empty_states.no_results_desc').replace('{query}', query)}
      action={onClear ? {
        label: t('empty_states.clear_search'),
        onClick: onClear,
      } : undefined}
    />
  )
})
