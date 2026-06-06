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
  return (
    <EmptyState
      icon={<Mail className="h-8 w-8 text-muted-foreground" />}
      title="暂无邮件模板"
      description="创建您的第一个邮件模板，开始发送专业的邮件内容"
      action={onCreate ? {
        label: '创建模板',
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
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
      title="暂无邮件记录"
      description="还没有发送任何邮件，邮件发送记录将显示在这里"
      action={onRefresh ? {
        label: '刷新',
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
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title="未找到结果"
      description={`没有找到与"${query}"相关的内容，请尝试其他关键词`}
      action={onClear ? {
        label: '清除搜索',
        onClick: onClear,
      } : undefined}
    />
  )
})
