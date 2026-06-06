'use client'

import { Button } from '@/components/ui/button'
import { effects } from '../styles'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { buttonVariants } from '@/components/ui/button'

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>

export interface AdminButtonProps extends ButtonProps {
  /**
   * 是否启用缩放效果
   * @default false
   */
  scaleOnHover?: boolean

  /**
   * 是否启用提升效果
   * @default false
   */
  liftOnHover?: boolean
}

/**
 * 统一的管理按钮组件
 * 提供一致的交互效果
 */
export function AdminButton({
  scaleOnHover = false,
  liftOnHover = false,
  className,
  children,
  ...props
}: AdminButtonProps) {
  return (
    <Button
      className={cn(
        effects.buttonGentle,
        scaleOnHover && effects.hoverScale,
        liftOnHover && effects.hoverLift,
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
