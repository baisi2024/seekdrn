import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// 转化漏斗阶段定义
const FUNNEL_STAGES = [
  'inline_form_open',
  'inline_form_start',
  'inline_form_submit_start',
  'inline_form_submit_success',
] as const

type FunnelStage = (typeof FUNNEL_STAGES)[number]

interface FunnelStageData {
  stage: FunnelStage
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

// 解析时间周期参数
function getStartDate(period: string): Date {
  const now = new Date()
  const days = parseInt(period.replace(/\D/g, '')) || 30

  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    default:
      // 支持自定义天数，如 14d, 60d 等
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<FunnelResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    const startDate = getStartDate(period)

    // 查询所有转化事件
    const { data, error } = await supabaseAdmin
      .from('analytics_events')
      .select('event_name, created_at')
      .in('event_name', FUNNEL_STAGES)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching funnel data:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 统计各阶段数量
    const stageCounts: Record<FunnelStage, number> = {
      inline_form_open: 0,
      inline_form_start: 0,
      inline_form_submit_start: 0,
      inline_form_submit_success: 0,
    }

    data?.forEach((event) => {
      const eventName = event.event_name as FunnelStage
      if (stageCounts[eventName] !== undefined) {
        stageCounts[eventName]++
      }
    })

    // 计算转化率和流失率
    const stages: FunnelStageData[] = []
    let previousCount = stageCounts.inline_form_open

    FUNNEL_STAGES.forEach((stage, index) => {
      const count = stageCounts[stage]

      // 转化率：相对于第一阶段的百分比
      const conversionRate =
        index === 0
          ? 100
          : stageCounts.inline_form_open > 0
            ? (count / stageCounts.inline_form_open) * 100
            : 0

      // 流失率：相对于前一阶段的流失百分比
      const dropOffRate =
        index === 0
          ? 0
          : previousCount > 0
            ? ((previousCount - count) / previousCount) * 100
            : 0

      stages.push({
        stage,
        count,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        drop_off_rate: Math.round(dropOffRate * 100) / 100,
      })

      previousCount = count
    })

    // 计算总体转化率
    const totalOpens = stageCounts.inline_form_open
    const totalSubmissions = stageCounts.inline_form_submit_success
    const overallConversionRate =
      totalOpens > 0 ? (totalSubmissions / totalOpens) * 100 : 0

    const response: FunnelResponse = {
      period,
      total_stages: FUNNEL_STAGES.length,
      stages,
      summary: {
        total_opens: totalOpens,
        total_submissions: totalSubmissions,
        overall_conversion_rate: Math.round(overallConversionRate * 100) / 100,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Funnel API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
