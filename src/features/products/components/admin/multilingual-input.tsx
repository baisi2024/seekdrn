'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LOCALES } from '@/lib/constants/locales'

const FRONTEND_LOCALES = LOCALES.filter(l =>
  ['zh', 'en', 'ar', 'es', 'fr', 'id', 'pt'].includes(l.code)
)

interface MultilingualInputProps {
  label: string
  value: Record<string, string>
  onChange: (value: Record<string, string>) => void
  type?: 'text' | 'textarea'
  placeholder?: string
}

export function MultilingualInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: MultilingualInputProps) {
  const [activeLocale, setActiveLocale] = useState('en')

  const handleChange = (localeCode: string, val: string) => {
    onChange({ ...value, [localeCode]: val })
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border rounded-lg">
        <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
          {FRONTEND_LOCALES.map((locale) => (
            <button
              key={locale.code}
              type="button"
              onClick={() => setActiveLocale(locale.code)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                activeLocale === locale.code
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {locale.label}
            </button>
          ))}
        </div>
        <div className="p-3">
          {type === 'textarea' ? (
            <Textarea
              value={value[activeLocale] || ''}
              onChange={(e) => handleChange(activeLocale, e.target.value)}
              placeholder={placeholder}
              rows={3}
            />
          ) : (
            <Input
              value={value[activeLocale] || ''}
              onChange={(e) => handleChange(activeLocale, e.target.value)}
              placeholder={placeholder}
            />
          )}
        </div>
      </div>
    </div>
  )
}
