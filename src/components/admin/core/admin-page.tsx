'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { effects } from '../styles'
import { cn } from '@/lib/utils'

export interface AdminPageProps {
  /**
   * 页面标题翻译键
   * @example 'products_page.title'
   */
  title: string

  /**
   * 页面操作按钮（如添加按钮）
   */
  actions?: React.ReactNode

  /**
   * 页面内容
   */
  children: React.ReactNode

  /**
   * 自定义类名
   */
  className?: string

  /**
   * 是否显示渐变背景
   * @default true
   */
  gradient?: boolean

  /**
   * 页面描述翻译键
   */
  description?: string
}

/**
 * 统一的管理页面容器组件
 * 提供一致的页面布局、标题翻译和视觉效果
 */
export function AdminPage({
  title,
  actions,
  children,
  className,
  gradient = true,
  description,
}: AdminPageProps) {
  const t = useAdminTranslations()

  return (
    <div
      className={cn(
        'min-h-screen',
        gradient && effects.gradientPage,
        className
      )}
    >
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t(title)}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {t(description)}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* 页面内容 */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}
