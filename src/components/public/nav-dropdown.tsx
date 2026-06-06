'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { NavigationItem } from '@/lib/navigation/types'

interface NavDropdownProps {
  item: NavigationItem
  defaultLocale?: string
}

/**
 * 获取导航项的多语言标签
 * @param item 导航项
 * @param locale 当前语言
 * @param defaultLocale 默认语言
 * @returns 标签文本
 */
function getLabel(item: NavigationItem, locale: string, defaultLocale: string = 'en'): string {
  // 优先使用当前语言的标签
  if (item.translations[locale]) {
    return item.translations[locale]
  }
  // 回退到默认语言
  if (item.translations[defaultLocale]) {
    return item.translations[defaultLocale]
  }
  // 最后使用第一个可用的标签
  const availableLabels = Object.values(item.translations)
  return availableLabels[0] || ''
}

/**
 * 处理 URL
 * @param url 原始 URL
 * @param linkType 链接类型
 * @param locale 当前语言
 * @returns 处理后的 URL
 */
function processUrl(url: string, linkType: 'internal' | 'external', locale: string): string {
  if (linkType === 'external') {
    return url
  }
  // 内部链接添加语言前缀
  if (url.startsWith('/')) {
    return `/${locale}${url}`
  }
  return `/${locale}/${url}`
}

export function NavDropdown({ item, defaultLocale = 'en' }: NavDropdownProps) {
  const locale = useLocale()
  const label = getLabel(item, locale, defaultLocale)
  const children = item.children || []

  if (children.length === 0) {
    // 没有子项，直接渲染链接
    const href = processUrl(item.url, item.link_type, locale)
    
    if (item.link_type === 'external') {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {label}
        </a>
      )
    }

    return (
      <Link
        href={href}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        {label}
      </Link>
    )
  }

  // 有子项，渲染下拉菜单
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-sm text-gray-600 hover:text-gray-900" />
        }
      >
        {label}
        <ChevronDown className="ml-1 h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {children.map((child) => {
          const childLabel = getLabel(child, locale, defaultLocale)
          const childHref = processUrl(child.url, child.link_type, locale)

          if (child.link_type === 'external') {
            return (
              <DropdownMenuItem key={child.id}>
                <a
                  href={childHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  {childLabel}
                </a>
              </DropdownMenuItem>
            )
          }

          return (
            <DropdownMenuItem key={child.id} render={<Link href={childHref} />}>
              {childLabel}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
