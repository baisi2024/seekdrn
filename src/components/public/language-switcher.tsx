'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  id: 'Bahasa Indonesia',
  zh: '中文',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  fa: 'فارسی',
  ru: 'Русский',
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [enabledLocales, setEnabledLocales] = useState(Object.keys(LOCALE_NAMES))
  const { trackLanguageChange } = useAnalytics(locale)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/site-settings')
        const data = await res.json()
        if (data.enabled_languages) {
          setEnabledLocales(data.enabled_languages)
        }
      } catch {}
    }
    fetchSettings()
  }, [])

  const switchLocale = (newLocale: string) => {
    // 追踪语言切换
    trackLanguageChange(locale, newLocale)

    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  // Filter locales based on enabled languages
  const availableLocales = Object.entries(LOCALE_NAMES).filter(([code]) =>
    enabledLocales.includes(code)
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
        <Globe className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLocales.map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchLocale(code)}
            className={locale === code ? 'bg-accent' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
