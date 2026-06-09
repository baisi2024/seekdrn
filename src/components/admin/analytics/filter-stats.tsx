'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter, Search, TrendingUp } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Skeleton } from '@/components/ui/skeleton'

interface FilterValue {
  value: string
  count: number
}

interface FilterStat {
  filter_type: string
  count: number
  values: FilterValue[]
}

interface SearchStat {
  query: string
  count: number
  avg_results: number
}

interface FilterStatsData {
  period: string
  filters: FilterStat[]
  searches: SearchStat[]
  total_filters: number
  total_searches: number
}

interface FilterStatsProps {
  period: 'today' | 'week' | 'month'
}

export function FilterStats({ period }: FilterStatsProps) {
  const t = useAdminTranslations()
  const [data, setData] = useState<FilterStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFilterStats() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/admin/analytics/filters?period=${period}`)

        if (!response.ok) {
          throw new Error('Failed to fetch filter stats')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching filter stats:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchFilterStats()
  }, [period])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              {t('analytics_page.filterUsage')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              {t('analytics_page.searchKeywords')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              {t('analytics_page.filterUsage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('analytics_page.errorLoading')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              {t('analytics_page.searchKeywords')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('analytics_page.errorLoading')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 筛选器使用统计 */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              {t('analytics_page.filterUsage')}
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {data?.total_filters || 0} {t('analytics_page.times')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.filters && data.filters.length > 0 ? (
            <div className="space-y-4">
              {data.filters.map((filter) => (
                <div key={filter.filter_type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{filter.filter_type}</span>
                    <span className="text-sm text-muted-foreground">{filter.count}</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    {filter.values.slice(0, 5).map((value) => (
                      <div key={value.value} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{value.value}</span>
                        <span className="text-muted-foreground">{value.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('analytics_page.noData')}</p>
          )}
        </CardContent>
      </Card>

      {/* 搜索关键词统计 */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              {t('analytics_page.searchKeywords')}
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {data?.total_searches || 0} {t('analytics_page.times')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.searches && data.searches.length > 0 ? (
            <div className="space-y-3">
              {data.searches.map((search, index) => (
                <div key={search.query} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                    <span className="text-sm truncate">{search.query}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {search.avg_results}
                    </span>
                    <span>{search.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('analytics_page.noData')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
