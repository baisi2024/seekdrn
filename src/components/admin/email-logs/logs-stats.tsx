'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

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

export function LogsStats({ stats, previousStats }: LogsStatsProps) {
  const t = useAdminTranslations()
  const successRate = stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(1) : '0'

  const calculateTrend = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) return null
    const trend = ((current - previous) / previous) * 100
    return trend
  }

  const totalTrend = calculateTrend(stats.total, previousStats?.total)
  const sentTrend = calculateTrend(stats.sent, previousStats?.sent)
  const failedTrend = calculateTrend(stats.failed, previousStats?.failed)

  const statsData = [
    {
      title: t('email_logs_page.statsTotal'),
      value: stats.total,
      icon: Mail,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      trend: totalTrend,
    },
    {
      title: t('email_logs_page.statsSent'),
      value: stats.sent,
      icon: CheckCircle,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-500/10',
      trend: sentTrend,
    },
    {
      title: t('email_logs_page.statsFailed'),
      value: stats.failed,
      icon: XCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/10',
      trend: failedTrend,
    },
    {
      title: t('email_logs_page.statsSuccessRate'),
      value: `${successRate}%`,
      icon: TrendingUp,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/10',
      trend: null,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.iconBg}`}>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.trend !== null && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {stat.trend > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">+{stat.trend.toFixed(1)}%</span>
                    </>
                  ) : stat.trend < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">{stat.trend.toFixed(1)}%</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">{t('email_logs_page.unchanged')}</span>
                  )}
                  <span className="text-muted-foreground">{t('email_logs_page.comparedToYesterday')}</span>
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
