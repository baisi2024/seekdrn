'use client'

import { useAdminLanguage } from './language-provider'
import { Button } from '@/components/ui/button'

export function AdminLanguageSwitcher() {
  const { language, setLanguage } = useAdminLanguage()

  return (
    <div className="flex gap-2 p-4 border-t border-border">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="flex-1"
      >
        English
      </Button>
      <Button
        variant={language === 'zh' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('zh')}
        className="flex-1"
      >
        中文
      </Button>
    </div>
  )
}
