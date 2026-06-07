'use client'

import { useAdminLanguage } from './language-provider'
import { Button } from '@/components/ui/button'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

export function AdminLanguageSwitcher() {
  const { language, setLanguage } = useAdminLanguage()
  const t = useAdminTranslations()

  return (
    <div className="flex gap-2 p-4 border-t border-border">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="flex-1"
      >
        {t('language_switcher.english')}
      </Button>
      <Button
        variant={language === 'zh' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('zh')}
        className="flex-1"
      >
        {t('language_switcher.chinese')}
      </Button>
    </div>
  )
}
