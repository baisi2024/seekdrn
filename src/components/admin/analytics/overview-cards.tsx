'use client'

import { memo, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Eye, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { useAnimatedNumber } from '@/hooks/use-animated-number'
import { formatNumber } from '@/lib/performance-utils'

interface OverviewData {
  formSubmissions: number
  productViews: number
  downloads: number
  conversionRate: string
}

interface OverviewCardsProps {
  period: 'today' | 'week' | 'month'
}

// 骨架屏组件
const OverviewCardSkeleton = memo(function OverviewCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
})

// 统计卡片组件
const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  t,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  trend?: number | null
  t: ReturnType<typeof useAdminTranslations>
}) {
  const { value: animatedValue } = useAnimatedNumber(
    typeof value === 'number' ? value : 0,
    { duration: 800 }
  )

  const displayValue = typeof value === 'number' 
    ? formatNumber(animatedValue) 
    : value

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* 顶部渐变条 */}
      <div className={`h-1 bg-gradient-to-r ${iconBg.replace('/10', '').replace('bg-', 'from-')} to-current`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${iconBg} transition-transform group-hover:scale-110`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">
          {displayValue}
        </div>
        {trend !== null && trend !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+{trend.toFixed(1)}%</span>
              </>
            ) : trend < 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-red-500">{trend.toFixed(1)}%</span>
              </>
            ) : (
              <span className="text-muted-foreground">{t('analytics_page.noChange')}</span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  )
})

export function OverviewCards({ period }: OverviewCardsProps) {
  const t = useAdminTranslations()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOverview() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/admin/analytics/overview?period=${period}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch overview data')
        }
        
        const result = await response.json()
        setData(result.data)
      } catch (err) {
        console.error('Error fetching overview:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [period])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <OverviewCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <p className="text-sm text-muted-foreground">{t('analytics_page.loadError')}</p>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      title: t('analytics_page.formSubmissions'),
      value: data.formSubmissions,
      icon: FileText,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      trend: null,
    },
    {
      title: t('analytics_page.productViews'),
      value: data.productViews,
      icon: Eye,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-500/10',
      trend: null,
    },
    {
      title: t('analytics_page.downloads'),
      value: data.downloads,
      icon: Download,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/10',
      trend: null,
    },
    {
      title: t('analytics_page.conversionRate'),
      value: data.conversionRate,
      icon: TrendingUp,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      trend: null,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="region" aria-label={t('analytics_page.overview')}>
      {statsData.map((stat) => (
        <StatCard key={stat.title} {...stat} t={t} />
      ))}
    </div>
  )
}
