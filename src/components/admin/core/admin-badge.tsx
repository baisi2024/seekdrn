'use client'

import { Badge, badgeVariants } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'
import { useRender } from '@base-ui/react/use-render'

type BadgeProps = useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export interface AdminBadgeProps extends BadgeProps {
  /**
   * 是否启用脉冲动画
   */
  pulse?: boolean
}

/**
 * 统一的管理徽章组件
 */
export function AdminBadge({
  pulse = false,
  className,
  children,
  ...props
}: AdminBadgeProps) {
  return (
    <Badge
      className={cn(
        'transition-all duration-200',
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  )
}
