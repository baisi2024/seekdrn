'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Calendar } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

// 分析组件
import { OverviewCards } from '@/components/admin/analytics/overview-cards'
import { ConversionFunnel } from '@/components/admin/analytics/conversion-funnel'
import { PopularContentTabs } from '@/components/admin/analytics/popular-content'
import { TrendChart } from '@/components/admin/analytics/trend-chart'
import { FilterStats } from '@/components/admin/analytics/filter-stats'

type TimePeriod = 'today' | 'week' | 'month'

export function AnalyticsClient() {
  const t = useAdminTranslations()
  const [period, setPeriod] = useState<TimePeriod>('week')

  return (
    <div className="space-y-6">
      {/* 时间周期选择器 */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <Tabs value={period} onValueChange={(value) => setPeriod(value as TimePeriod)}>
          <TabsList>
            <TabsTrigger value="today">{t('analytics_page.period_today')}</TabsTrigger>
            <TabsTrigger value="week">{t('analytics_page.period_week')}</TabsTrigger>
            <TabsTrigger value="month">{t('analytics_page.period_month')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 概览卡片 */}
      <OverviewCards period={period} />

      {/* 主要内容区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 左侧：转化漏斗 */}
        <ConversionFunnel period={period} />

        {/* 右侧：趋势图表 */}
        <TrendChart />
      </div>

      {/* 热门内容标签页 */}
      <PopularContentTabs limit={10} />

      {/* 筛选器和搜索统计 */}
      <FilterStats period={period} />
    </div>
  )
}
