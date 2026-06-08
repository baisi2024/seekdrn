import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getNavigation } from '@/lib/navigation/api'
import type { NavigationItem } from '@/lib/navigation/types'

interface DynamicFooterProps {
  locale: string
}

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
  let navItems: NavigationItem[] = []
  try {
    navItems = await getNavigation('footer')
  } catch (error) {
    console.error('Failed to fetch footer navigation:', error)
  }

  const t = await getTranslations({ locale, namespace: 'common' })
  const publishedItems = navItems.filter(item => item.published)

  return (
    <footer className="border-t border-border bg-[#f7f8f5] text-muted-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                <span className="text-sm font-bold text-primary-foreground" suppressHydrationWarning>
                  {t('brand.shortName')}
                </span>
              </div>
              <span className="text-lg font-bold text-foreground" suppressHydrationWarning>
                {t('brand.name')}
              </span>
            </div>
            <p className="text-sm leading-6">{t('footer.description')}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/${locale}#demo-form`} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                {t('cta.requestQuote')}
              </Link>
              <Link href={`/${locale}/products`} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/40">
                {t('cta.exploreProducts')}
              </Link>
            </div>
          </div>

          {publishedItems.map((item) => {
            const label = getLabel(item, locale)
            const children = item.children?.filter(c => c.published) || []

            return (
              <div key={item.id}>
                <h3 className="mb-4 font-semibold text-foreground" suppressHydrationWarning>{label}</h3>
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
                            className="transition-colors hover:text-foreground"
                            suppressHydrationWarning
                          >
                            {childLabel}
                          </a>
                        ) : (
                          <Link href={childHref} className="transition-colors hover:text-foreground" suppressHydrationWarning>
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

        <div className="mt-8 border-t border-border pt-8 text-center text-sm">
          © {new Date().getFullYear()} SeekDrone. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
