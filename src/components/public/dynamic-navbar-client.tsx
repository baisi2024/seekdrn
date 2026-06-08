'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LanguageSwitcher } from './language-switcher'
import { NavDropdown } from './nav-dropdown'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { NavigationItem } from '@/lib/navigation/types'

interface DynamicNavbarClientProps {
  navItems: NavigationItem[]
  locale: string
  requestDemoText: string
  brandName: string
  brandShortName: string
}

/**
 * 获取导航项的多语言标签
 */
function getLabel(item: NavigationItem, locale: string, defaultLocale: string = 'en'): string {
  if (item.translations[locale]) {
    return item.translations[locale]
  }
  if (item.translations[defaultLocale]) {
    return item.translations[defaultLocale]
  }
  const availableLabels = Object.values(item.translations)
  return availableLabels[0] || ''
}

/**
 * 处理 URL
 */
function processUrl(url: string, linkType: 'internal' | 'external', locale: string): string {
  if (linkType === 'external') {
    return url
  }
  if (url.startsWith('/')) {
    return `/${locale}${url}`
  }
  return `/${locale}/${url}`
}

export function DynamicNavbarClient({ navItems, locale, requestDemoText, brandName, brandShortName }: DynamicNavbarClientProps) {
  const [open, setOpen] = useState(false)

  // 过滤已发布的导航项
  const publishedItems = navItems.filter(item => item.published)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm" suppressHydrationWarning>
              {brandShortName}
            </span>
          </div>
          <span className="font-bold text-lg text-gray-900" suppressHydrationWarning>
            {brandName}
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center gap-6">
          {publishedItems.map((item) => (
            <NavDropdown key={item.id} item={item} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button render={<Link href={`/${locale}#demo-form`} />} nativeButton={false} size="sm" className="hidden md:inline-flex">
            {requestDemoText}
          </Button>

          {/* 移动端菜单 */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />} className="md:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                {publishedItems.map((item) => {
                  const label = getLabel(item, locale)
                  const href = processUrl(item.url, item.link_type, locale)
                  const children = item.children?.filter(c => c.published) || []

                  return (
                    <div key={item.id}>
                      {item.link_type === 'external' ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg text-gray-700 hover:text-gray-900"
                          onClick={() => setOpen(false)}
                          suppressHydrationWarning
                        >
                          {label}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="text-lg text-gray-700 hover:text-gray-900"
                          onClick={() => setOpen(false)}
                          suppressHydrationWarning
                        >
                          {label}
                        </Link>
                      )}

                      {/* 子菜单项 */}
                      {children.length > 0 && (
                        <div className="ml-4 mt-2 space-y-2">
                          {children.map((child) => {
                            const childLabel = getLabel(child, locale)
                            const childHref = processUrl(child.url, child.link_type, locale)

                            return child.link_type === 'external' ? (
                              <a
                                key={child.id}
                                href={childHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-gray-600 hover:text-gray-900"
                                onClick={() => setOpen(false)}
                                suppressHydrationWarning
                              >
                                {childLabel}
                              </a>
                            ) : (
                              <Link
                                key={child.id}
                                href={childHref}
                                className="block text-sm text-gray-600 hover:text-gray-900"
                                onClick={() => setOpen(false)}
                                suppressHydrationWarning
                              >
                                {childLabel}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
                <Button render={<Link href={`/${locale}#demo-form`} onClick={() => setOpen(false)} />} nativeButton={false} className="mt-4">
                  {requestDemoText}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
