'use client'

import { useEffect, useState } from 'react'
import { AdminCard } from '@/components/admin/core/admin-card'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Skeleton } from '@/components/ui/skeleton'

interface FunnelStageData {
  stage: string
  count: number
  conversion_rate: number
  drop_off_rate: number
}

interface FunnelResponse {
  period: string
  total_stages: number
  stages: FunnelStageData[]
  summary: {
    total_opens: number
    total_submissions: number
    overall_conversion_rate: number
  }
}

interface ConversionFunnelProps {
  period: string
}

// 阶段名称映射
const STAGE_NAMES: Record<string, string> = {
  inline_form_open: 'analytics.funnel.stage_open',
  inline_form_start: 'analytics.funnel.stage_start',
  inline_form_submit_start: 'analytics.funnel.stage_submit',
  inline_form_submit_success: 'analytics.funnel.stage_success',
}

// 阶段颜色
const STAGE_COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-green-500',
]

export function ConversionFunnel({ period }: ConversionFunnelProps) {
  const t = useAdminTranslations()
  const [data, setData] = useState<FunnelResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFunnelData() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/admin/analytics/funnel?period=${period}`)

        if (!res.ok) {
          throw new Error('Failed to fetch funnel data')
        }

        const funnelData: FunnelResponse = await res.json()
        setData(funnelData)
      } catch (err) {
        console.error('Error fetching funnel data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchFunnelData()
  }, [period])

  if (loading) {
    return (
      <AdminCard title="analytics.funnel.title" description="analytics.funnel.description">
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </AdminCard>
    )
  }

  if (error || !data) {
    return (
      <AdminCard title="analytics.funnel.title">
        <div className="text-center py-8 text-muted-foreground">
          {t('analytics.funnel.error_loading')}
        </div>
      </AdminCard>
    )
  }

  const maxCount = Math.max(...data.stages.map((s) => s.count))

  return (
    <AdminCard title="analytics.funnel.title" description="analytics.funnel.description">
      <div className="space-y-6">
        {/* 总体转化率 */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t('analytics.funnel.overall_conversion')}
            </span>
            <span className="text-2xl font-bold text-foreground">
              {data.summary.overall_conversion_rate.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {t('analytics.funnel.total_opens')}: {data.summary.total_opens}
            </span>
            <span>
              {t('analytics.funnel.total_submissions')}: {data.summary.total_submissions}
            </span>
          </div>
        </div>

        {/* 漏斗阶段 */}
        <div className="space-y-4">
          {data.stages.map((stage, index) => {
            const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0

            return (
              <div key={stage.stage} className="space-y-2">
                {/* 阶段名称和数量 */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    {t(STAGE_NAMES[stage.stage] || stage.stage)}
                  </span>
                  <span className="text-sm text-muted-foreground">{stage.count}</span>
                </div>

                {/* 进度条 */}
                <div className="relative h-10 bg-muted/30 rounded-lg overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${STAGE_COLORS[index]} transition-all duration-500 rounded-lg flex items-center justify-end pr-3`}
                    style={{ width: `${widthPercent}%` }}
                  >
                    {widthPercent > 15 && (
                      <span className="text-xs font-medium text-white">
                        {stage.count}
                      </span>
                    )}
                  </div>
                </div>

                {/* 转化率和流失率 */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {t('analytics.funnel.conversion_rate')}: {stage.conversion_rate.toFixed(1)}%
                  </span>
                  {index > 0 && (
                    <span className="text-red-500">
                      {t('analytics.funnel.drop_off')}: {stage.drop_off_rate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 时间周期 */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          {t('analytics.funnel.period')}: {period}
        </div>
      </div>
    </AdminCard>
  )
}
