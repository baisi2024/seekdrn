'use client'

import { memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { useAnimatedNumber } from '@/hooks/use-animated-number'
import { formatNumber } from '@/lib/performance-utils'

interface EmailLogStats {
  total: number
  sent: number
  failed: number
  pending: number
}

interface LogsStatsProps {
  stats: EmailLogStats
  previousStats?: EmailLogStats
}

// 迷你图表组件
const MiniChart = memo(function MiniChart({ 
  data, 
  color = 'blue' 
}: { 
  data: number[]
  color?: 'blue' | 'green' | 'red' | 'purple'
}) {
  const max = Math.max(...data, 1)
  const colorClasses = {
    blue: 'from-blue-500 to-blue-300',
    green: 'from-green-500 to-green-300',
    red: 'from-red-500 to-red-300',
    purple: 'from-purple-500 to-purple-300',
  }

  return (
    <div className="flex items-end gap-0.5 h-8" role="img" aria-label="迷你趋势图">
      {data.map((value, index) => (
        <div
          key={index}
          className={`
            w-1 rounded-t transition-all duration-300
            bg-gradient-to-t ${colorClasses[color]}
          `}
          style={{
            height: `${(value / max) * 100}%`,
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
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
  miniChartData,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  trend?: number | null
  miniChartData?: number[]
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
        <div className="flex items-end justify-between">
          <div className="flex-1">
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
                  <span className="text-muted-foreground">无变化</span>
                )}
              </p>
            )}
          </div>
          
          {/* 迷你图表 */}
          {miniChartData && miniChartData.length > 0 && (
            <MiniChart 
              data={miniChartData} 
              color={iconColor.includes('blue') ? 'blue' : iconColor.includes('green') ? 'green' : iconColor.includes('red') ? 'red' : 'purple'} 
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
})

export function LogsStats({ stats, previousStats }: LogsStatsProps) {
  const t = useAdminTranslations()
  const successRate = stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(1) : '0'

  const calculateTrend = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) return null
    const trend = ((current - previous) / previous) * 100
    return trend
  }

  // 生成模拟的趋势数据
  const generateTrendData = (base: number) => 
    Array.from({ length: 7 }, () => Math.max(0, base + Math.floor(Math.random() * 5 - 2)))

  const statsData = useMemo(() => [
    {
      title: t('email_logs_page.statsTotal'),
      value: stats.total,
      icon: Mail,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      trend: calculateTrend(stats.total, previousStats?.total),
      miniChartData: generateTrendData(stats.total),
    },
    {
      title: t('email_logs_page.statsSent'),
      value: stats.sent,
      icon: CheckCircle,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-500/10',
      trend: calculateTrend(stats.sent, previousStats?.sent),
      miniChartData: generateTrendData(stats.sent),
    },
    {
      title: t('email_logs_page.statsFailed'),
      value: stats.failed,
      icon: XCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/10',
      trend: calculateTrend(stats.failed, previousStats?.failed),
      miniChartData: generateTrendData(stats.failed),
    },
    {
      title: t('email_logs_page.statsSuccessRate'),
      value: `${successRate}%`,
      icon: TrendingUp,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/10',
      trend: null,
    },
  ], [stats, previousStats, successRate, t])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="region" aria-label="邮件日志统计">
      {statsData.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
