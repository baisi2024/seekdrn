'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface TrendData {
  date: string
  count: number
}

interface TrendStatistics {
  total: number
  average: number
  max: number
  min: number
}

interface TrendResponse {
  event_name: string
  days: number
  trends: TrendData[]
  statistics: TrendStatistics
}

interface TrendChartProps {
  eventName?: string
  days?: number
}

// 预定义的事件类型
const EVENT_TYPES = [
  { value: 'form_submit', label: '表单提交' },
  { value: 'product_view', label: '产品浏览' },
  { value: 'datasheet_download', label: '数据表下载' },
  { value: 'video_play', label: '视频播放' },
  { value: 'share_click', label: '分享点击' },
  { value: 'filter_apply', label: '筛选器应用' },
  { value: 'search_submit', label: '搜索提交' },
]

// 时间范围选项
const TIME_RANGES = [
  { value: '7', label: '最近 7 天' },
  { value: '14', label: '最近 14 天' },
  { value: '30', label: '最近 30 天' },
  { value: '60', label: '最近 60 天' },
  { value: '90', label: '最近 90 天' },
]

// 自定义 Tooltip 组件
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const date = new Date(label)
    const formattedDate = format(date, 'yyyy年MM月dd日', { locale: zhCN })

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium mb-1">{formattedDate}</p>
        <p className="text-sm text-muted-foreground">
          数量: <span className="text-primary font-semibold">{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

// 骨架屏组件
function TrendChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 统计信息骨架 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
          {/* 图表骨架 */}
          <Skeleton className="h-64 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function TrendChart({ eventName = 'form_submit', days = 7 }: TrendChartProps) {
  const t = useAdminTranslations()
  const [selectedEvent, setSelectedEvent] = useState(eventName)
  const [selectedDays, setSelectedDays] = useState(days.toString())
  const [data, setData] = useState<TrendResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrends() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/admin/analytics/trends?event_name=${selectedEvent}&days=${selectedDays}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch trend data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching trends:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [selectedEvent, selectedDays])

  // 格式化日期显示
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, 'MM/dd')
  }

  if (loading) {
    return <TrendChartSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t('analytics.trend.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('analytics.trend.error_loading')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t('analytics.trend.title')}
          </CardTitle>

          {/* 选择器 */}
          <div className="flex items-center gap-2">
            {/* 事件类型选择器 */}
            <Select value={selectedEvent} onValueChange={(value) => value && setSelectedEvent(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('analytics.trend.selectEvent')} />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((event) => (
                  <SelectItem key={event.value} value={event.value}>
                    {event.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 时间范围选择器 */}
            <Select value={selectedDays} onValueChange={(value) => value && setSelectedDays(value)}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data && data.trends.length > 0 ? (
          <div className="space-y-4">
            {/* 统计信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('analytics.trend.total')}</p>
                <p className="text-2xl font-bold tabular-nums">{data.statistics.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('analytics.trend.average')}</p>
                <p className="text-2xl font-bold tabular-nums">{data.statistics.average}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('analytics.trend.max')}</p>
                <p className="text-2xl font-bold tabular-nums">{data.statistics.max}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('analytics.trend.min')}</p>
                <p className="text-2xl font-bold tabular-nums">{data.statistics.min}</p>
              </div>
            </div>

            {/* 柱状图 */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.trends}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name={t('analytics.trend.count')}
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">{t('analytics.trend.noData')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
