'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'

export interface TranslatedTextProps {
  /**
   * 翻译键
   * @example 'products_page.title'
   */
  textKey: string

  /**
   * 备用文本（翻译键不存在时显示）
   */
  fallback?: string

  /**
   * 自定义类名
   */
  className?: string

  /**
   * 插值变量
   * @example { count: 5, name: 'Product' }
   */
  variables?: Record<string, string | number>

  /**
   * HTML 标签
   * @default 'span'
   */
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/**
 * 统一的翻译文本组件
 * 自动处理翻译和插值
 */
export function TranslatedText({
  textKey,
  fallback,
  className,
  variables,
  as: Component = 'span',
}: TranslatedTextProps) {
  const t = useAdminTranslations()

  let text = t(textKey)

  // 如果翻译键不存在，使用 fallback
  if (text === textKey && fallback) {
    text = fallback
  }

  // 处理插值变量
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
    })
  }

  return <Component className={className}>{text}</Component>
}
