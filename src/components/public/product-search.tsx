'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={locale === 'zh' ? '搜索产品...' : 'Search products...'}
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}