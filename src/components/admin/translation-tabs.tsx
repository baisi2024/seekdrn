'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'id', label: 'Indonesian' },
  { code: 'zh', label: 'Chinese' },
]

interface TranslationTabsProps {
  translations: Record<string, Record<string, string>>
  fields: string[]
  onChange: (locale: string, field: string, value: string) => void
}

export function TranslationTabs({ translations, fields, onChange }: TranslationTabsProps) {
  return (
    <Tabs defaultValue="en">
      <TabsList className="mb-4">
        {LOCALES.map((locale) => (
          <TabsTrigger key={locale.code} value={locale.code}>
            {locale.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {LOCALES.map((locale) => (
        <TabsContent key={locale.code} value={locale.code} className="space-y-4">
          {fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {field.replace(/_/g, ' ')}
              </label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                value={translations[locale.code]?.[field] || ''}
                onChange={(e) => onChange(locale.code, field, e.target.value)}
              />
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  )
}
