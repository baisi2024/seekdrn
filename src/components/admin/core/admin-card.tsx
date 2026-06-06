'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { effects } from '../styles'
import { cn } from '@/lib/utils'

export interface AdminCardProps {
  /**
   * 卡片标题翻译键
   */
  title?: string

  /**
   * 卡片描述翻译键
   */
  description?: string

  /**
   * 卡片变体
   * - default: 标准卡片
   * - elevated: 提升阴影
   * - bordered: 边框强调
   */
  variant?: 'default' | 'elevated' | 'bordered'

  /**
   * 是否启用悬停效果
   * @default true
   */
  hover?: boolean

  /**
   * 卡片内容
   */
  children: React.ReactNode

  /**
   * 自定义类名
   */
  className?: string

  /**
   * 卡片头部自定义内容
   */
  headerContent?: React.ReactNode

  /**
   * 是否显示渐变背景
   */
  gradient?: boolean
}

/**
 * 统一的管理卡片组件
 * 提供一致的卡片样式、翻译和交互效果
 */
export function AdminCard({
  title,
  description,
  variant = 'default',
  hover = true,
  children,
  className,
  headerContent,
  gradient = false,
}: AdminCardProps) {
  const t = useAdminTranslations()

  const variantEffects = {
    default: effects.card,
    elevated: effects.cardElevated,
    bordered: effects.cardBordered,
  }

  return (
    <Card
      className={cn(
        'bg-background text-foreground',
        hover && variantEffects[variant],
        gradient && effects.gradientCard,
        className
      )}
    >
      {(title || description || headerContent) && (
        <CardHeader>
          {title && (
            <CardTitle className="text-foreground">
              {t(title)}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-muted-foreground">
              {t(description)}
            </CardDescription>
          )}
          {headerContent}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
