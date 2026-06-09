import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today'

    // 计算时间范围
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'today':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
    }

    // 查询表单提交数
    const { count: formSubmissions } = await supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'inline_form_submit_success')
      .gte('created_at', startDate.toISOString())

    // 查询产品浏览量
    const { count: productViews } = await supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'product_detail_view')
      .gte('created_at', startDate.toISOString())

    // 查询下载数
    const { count: downloads } = await supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'datasheet_download')
      .gte('created_at', startDate.toISOString())

    // 计算转化率
    const conversionRate = productViews && productViews > 0
      ? ((formSubmissions || 0) / productViews * 100).toFixed(2)
      : '0.00'

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      data: {
        formSubmissions: formSubmissions || 0,
        productViews: productViews || 0,
        downloads: downloads || 0,
        conversionRate: `${conversionRate}%`,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    )
  }
}
