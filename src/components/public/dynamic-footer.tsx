import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getNavigation } from '@/lib/navigation/api'
import type { NavigationItem } from '@/lib/navigation/types'

interface DynamicFooterProps {
  locale: string
}

/**
 * 获取导航项的多语言标签
 */
function getLabel(item: { translations: Record<string, string> }, locale: string, defaultLocale: string = 'en'): string {
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

export async function DynamicFooter({ locale }: DynamicFooterProps) {
  // 获取页脚导航数据
  let navItems: NavigationItem[] = []
  try {
    navItems = await getNavigation('footer')
  } catch (error) {
    console.error('Failed to fetch footer navigation:', error)
  }

  // 获取翻译
  const t = await getTranslations({ locale, namespace: 'common' })

  // 过滤已发布的导航项
  const publishedItems = navItems.filter(item => item.published)

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo 和描述 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SD</span>
              </div>
              <span className="font-bold text-lg text-white">SeekDrone</span>
            </div>
            <p className="text-sm">Industrial UAV solutions and counter-drone systems for defense, security, and critical infrastructure.</p>
          </div>

          {/* 动态导航列 */}
          {publishedItems.map((item) => {
            const label = getLabel(item, locale)
            const children = item.children?.filter(c => c.published) || []

            return (
              <div key={item.id}>
                <h3 className="text-white font-semibold mb-4">{label}</h3>
                <ul className="space-y-2 text-sm">
                  {children.map((child) => {
                    const childLabel = getLabel(child, locale)
                    const childHref = processUrl(child.url, child.link_type, locale)

                    return (
                      <li key={child.id}>
                        {child.link_type === 'external' ? (
                          <a
                            href={childHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                          >
                            {childLabel}
                          </a>
                        ) : (
                          <Link href={childHref} className="hover:text-white transition-colors">
                            {childLabel}
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>

        {/* 版权信息 */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          © {new Date().getFullYear()} SeekDrone. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
