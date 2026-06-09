'use client'

import { useState, useEffect } from 'react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type PopularType = 'products' | 'downloads' | 'locales'

interface PopularProduct {
  model: string
  name: string
  count: number
}

interface PopularDownload {
  documentName: string
  documentType: string
  productModel: string
  count: number
}

interface PopularLocale {
  locale: string
  count: number
  percentage: number
}

interface PopularContentProps {
  type: PopularType
  limit?: number
}

export function PopularContent({ type, limit = 10 }: PopularContentProps) {
  const t = useAdminTranslations()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/analytics/popular?type=${type}&limit=${limit}`)
        if (!res.ok) {
          throw new Error('Failed to fetch data')
        }
        const result = await res.json()
        setData(result.data || [])
      } catch (err) {
        setError(t('analytics_page.loadFailed'))
        console.error('Error fetching popular content:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [type, limit, t])

  if (loading) {
    return <PopularContentSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-8 text-center text-sm text-muted-foreground">
        {t('analytics_page.noData')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {type === 'products' && (
        <ProductList data={data as PopularProduct[]} />
      )}
      {type === 'downloads' && (
        <DownloadList data={data as PopularDownload[]} />
      )}
      {type === 'locales' && (
        <LocaleList data={data as PopularLocale[]} />
      )}
    </div>
  )
}

function ProductList({ data }: { data: PopularProduct[] }) {
  const t = useAdminTranslations()
  const maxCount = Math.max(...data.map(item => item.count), 1)

  return (
    <>
      {data.map((item, index) => (
        <div
          key={item.model}
          className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">{item.name}</span>
              <span className="text-xs text-muted-foreground">({item.model})</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {item.count} {t('analytics_page.views')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

function DownloadList({ data }: { data: PopularDownload[] }) {
  const t = useAdminTranslations()
  const maxCount = Math.max(...data.map(item => item.count), 1)

  return (
    <>
      {data.map((item, index) => (
        <div
          key={`${item.productModel}-${item.documentName}`}
          className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">{item.documentName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {item.documentType}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {item.productModel}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {item.count} {t('analytics_page.downloads')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

function LocaleList({ data }: { data: PopularLocale[] }) {
  const t = useAdminTranslations()

  const getLocaleName = (locale: string): string => {
    const localeNames: Record<string, string> = {
      zh: '中文',
      en: 'English',
      ar: 'العربية',
      es: 'Español',
      fr: 'Français',
      id: 'Bahasa Indonesia',
      pt: 'Português',
    }
    return localeNames[locale] || locale
  }

  return (
    <>
      {data.map((item, index) => (
        <div
          key={item.locale}
          className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{getLocaleName(item.locale)}</span>
              <span className="text-sm text-muted-foreground">{item.percentage}%</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {item.count} {t('analytics_page.events')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

function PopularContentSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PopularContentTabs({ limit = 10 }: { limit?: number }) {
  const t = useAdminTranslations()

  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="products">
          {t('analytics_page.popularProducts')}
        </TabsTrigger>
        <TabsTrigger value="downloads">
          {t('analytics_page.popularDownloads')}
        </TabsTrigger>
        <TabsTrigger value="locales">
          {t('analytics_page.languageDistribution')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <PopularContent type="products" limit={limit} />
      </TabsContent>

      <TabsContent value="downloads">
        <PopularContent type="downloads" limit={limit} />
      </TabsContent>

      <TabsContent value="locales">
        <PopularContent type="locales" limit={limit} />
      </TabsContent>
    </Tabs>
  )
}
