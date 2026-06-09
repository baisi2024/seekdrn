import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const eventName = searchParams.get('event_name')
    const days = parseInt(searchParams.get('days') || '7', 10)

    // 验证参数
    if (!eventName) {
      return NextResponse.json(
        { error: 'event_name parameter is required' },
        { status: 400 }
      )
    }

    if (isNaN(days) || days <= 0 || days > 365) {
      return NextResponse.json(
        { error: 'days parameter must be between 1 and 365' },
        { status: 400 }
      )
    }

    // 计算日期范围
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days + 1)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    // 查询指定事件的数据
    const { data, error } = await supabaseAdmin
      .from('analytics_events')
      .select('created_at')
      .eq('event_name', eventName)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // 按日期分组统计
    const dailyCounts = new Map<string, number>()

    // 初始化所有日期（填充缺失日期）
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      dailyCounts.set(dateStr, 0)
    }

    // 统计每天的事件数量
    data?.forEach((event) => {
      const dateStr = new Date(event.created_at).toISOString().split('T')[0]
      const currentCount = dailyCounts.get(dateStr) || 0
      dailyCounts.set(dateStr, currentCount + 1)
    })

    // 转换为数组格式并计算统计信息
    const trends = Array.from(dailyCounts.entries()).map(([date, count]) => ({
      date,
      count,
    }))

    // 计算统计信息
    const totalEvents = trends.reduce((sum, day) => sum + day.count, 0)
    const avgEvents = totalEvents / days
    const maxEvents = Math.max(...trends.map((day) => day.count))
    const minEvents = Math.min(...trends.map((day) => day.count))

    return NextResponse.json({
      event_name: eventName,
      days,
      trends,
      statistics: {
        total: totalEvents,
        average: Math.round(avgEvents * 100) / 100,
        max: maxEvents,
        min: minEvents,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics trends' },
      { status: 500 }
    )
  }
}
