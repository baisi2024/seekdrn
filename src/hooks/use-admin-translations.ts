'use client'

import { useAdminLanguage } from '@/components/admin/language-provider'
import adminTranslationsEn from '../../messages/en/admin.json'
import adminTranslationsZh from '../../messages/zh/admin.json'

const translations = {
  en: adminTranslationsEn,
  zh: adminTranslationsZh
}

export function useAdminTranslations() {
  const { language } = useAdminLanguage()

  return (key: string): string => {
    const keys = key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }
}
