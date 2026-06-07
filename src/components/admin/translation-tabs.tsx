'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RichEditor } from './rich-editor'
import { LOCALES } from '@/lib/constants/locales'

interface TranslationTabsProps {
  translations: Record<string, Record<string, string>>
  fields: string[]
  onChange: (locale: string, field: string, value: string) => void
  richTextFields?: string[]
}

export function TranslationTabs({ translations, fields, onChange, richTextFields = [] }: TranslationTabsProps) {
  const isRichTextField = (field: string) => richTextFields.includes(field)

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
              {isRichTextField(field) ? (
                <RichEditor
                  content={translations[locale.code]?.[field] || ''}
                  onChange={(value) => onChange(locale.code, field, value)}
                  placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                />
              ) : (
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  value={translations[locale.code]?.[field] || ''}
                  onChange={(e) => onChange(locale.code, field, e.target.value)}
                  placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                />
              )}
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  )
}