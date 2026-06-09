'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

interface ProductSearchProps {
  locale: string
  defaultValue?: string
}

export function ProductSearch({ locale, defaultValue = '' }: ProductSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const t = useTranslations('products')

  const handleSearch = useCallback((newValue: string) => {
    setValue(newValue)
    const params = new URLSearchParams(searchParams.toString())

    if (newValue) {
      params.set('q', newValue)
    } else {
      params.delete('q')
    }

    router.replace(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const handleClear = useCallback(() => {
    handleSearch('')
  }, [handleSearch])

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
      <Input
        type="search"
        placeholder={t('searchPlaceholder')}
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-9 pr-9 bg-[#1A1F2E] border-white/[0.06] text-white placeholder:text-white/30 focus:border-[#0066FF]/50"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}