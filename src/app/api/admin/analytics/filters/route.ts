import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'

    // 计算时间范围
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'week':
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
    }

    // 查询筛选器应用事件
    const { data: filterEvents, error: filterError } = await supabaseAdmin
      .from('analytics_events')
      .select('metadata, created_at')
      .eq('event_name', 'filter_apply')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (filterError) {
      console.error('Error fetching filter events:', filterError)
      return NextResponse.json(
        { error: 'Failed to fetch filter events' },
        { status: 500 }
      )
    }

    // 查询搜索提交事件
    const { data: searchEvents, error: searchError } = await supabaseAdmin
      .from('analytics_events')
      .select('metadata, created_at')
      .eq('event_name', 'search_submit')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (searchError) {
      console.error('Error fetching search events:', searchError)
      return NextResponse.json(
        { error: 'Failed to fetch search events' },
        { status: 500 }
      )
    }

    // 统计筛选器使用情况
    const filterStats: Record<
      string,
      { count: number; values: Record<string, number> }
    > = {}

    filterEvents?.forEach((event) => {
      const metadata = event.metadata as Record<string, unknown>
      const filterType = (metadata?.filter_type as string) || 'unknown'
      const filterValue = (metadata?.filter_value as string) || 'unknown'

      if (!filterStats[filterType]) {
        filterStats[filterType] = { count: 0, values: {} }
      }

      filterStats[filterType].count++
      filterStats[filterType].values[filterValue] =
        (filterStats[filterType].values[filterValue] || 0) + 1
    })

    // 转换为数组并排序
    const sortedFilterStats = Object.entries(filterStats)
      .map(([type, stats]) => ({
        filter_type: type,
        count: stats.count,
        values: Object.entries(stats.values)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10), // 每个筛选类型最多显示10个值
      }))
      .sort((a, b) => b.count - a.count)

    // 统计搜索关键词
    const searchStats: Record<string, { count: number; totalResults: number }> =
      {}

    searchEvents?.forEach((event) => {
      const metadata = event.metadata as Record<string, unknown>
      const query = (metadata?.query as string) || ''
      const resultsCount = (metadata?.results_count as number) || 0

      if (query) {
        const normalizedQuery = query.toLowerCase().trim()
        if (!searchStats[normalizedQuery]) {
          searchStats[normalizedQuery] = { count: 0, totalResults: 0 }
        }
        searchStats[normalizedQuery].count++
        searchStats[normalizedQuery].totalResults += resultsCount
      }
    })

    // 转换为数组并排序
    const sortedSearchStats = Object.entries(searchStats)
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        avg_results: Math.round(stats.totalResults / stats.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // 最多显示20个搜索词

    return NextResponse.json({
      period,
      filters: sortedFilterStats,
      searches: sortedSearchStats,
      total_filters: filterEvents?.length || 0,
      total_searches: searchEvents?.length || 0,
    })
  } catch (error) {
    console.error('Analytics filters API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
