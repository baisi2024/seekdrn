// src/app/api/admin/analytics/popular/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'products'
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // 验证参数
    if (!['products', 'downloads', 'locales'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: products, downloads, locales' },
        { status: 400 }
      )
    }

    let data: any[] = []

    switch (type) {
      case 'products':
        data = await getPopularProducts(limit)
        break
      case 'downloads':
        data = await getPopularDownloads(limit)
        break
      case 'locales':
        data = await getPopularLocales(limit)
        break
    }

    return NextResponse.json({ data, type })
  } catch (error) {
    console.error('Error fetching popular content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular content' },
      { status: 500 }
    )
  }
}

/**
 * 获取热门产品（按浏览量）
 */
async function getPopularProducts(limit: number) {
  const { data, error } = await supabaseAdmin
    .from('analytics_events')
    .select('metadata')
    .eq('event_name', 'product_detail_view')
    .not('metadata->product_model', 'is', null)

  if (error) {
    console.error('Error fetching popular products:', error)
    return []
  }

  // 统计每个产品的浏览次数
  const productViews = new Map<string, { model: string; name: string; count: number }>()

  data.forEach((event) => {
    const metadata = event.metadata as any
    const model = metadata?.product_model
    const name = metadata?.product_name || model

    if (model) {
      const existing = productViews.get(model)
      if (existing) {
        existing.count++
      } else {
        productViews.set(model, { model, name, count: 1 })
      }
    }
  })

  // 排序并返回前 N 个
  return Array.from(productViews.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * 获取热门下载（数据表下载次数）
 */
async function getPopularDownloads(limit: number) {
  const { data, error } = await supabaseAdmin
    .from('analytics_events')
    .select('metadata')
    .eq('event_name', 'datasheet_download')
    .not('metadata->document_name', 'is', null)

  if (error) {
    console.error('Error fetching popular downloads:', error)
    return []
  }

  // 统计每个文档的下载次数
  const downloads = new Map<
    string,
    { documentName: string; documentType: string; productModel: string; count: number }
  >()

  data.forEach((event) => {
    const metadata = event.metadata as any
    const documentName = metadata?.document_name
    const documentType = metadata?.document_type || 'unknown'
    const productModel = metadata?.product_model || 'unknown'

    if (documentName) {
      const key = `${productModel}-${documentName}`
      const existing = downloads.get(key)
      if (existing) {
        existing.count++
      } else {
        downloads.set(key, {
          documentName,
          documentType,
          productModel,
          count: 1,
        })
      }
    }
  })

  // 排序并返回前 N 个
  return Array.from(downloads.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * 获取语言分布（活跃语言版本）
 */
async function getPopularLocales(limit: number) {
  const { data, error } = await supabaseAdmin
    .from('analytics_events')
    .select('locale')
    .not('locale', 'is', null)

  if (error) {
    console.error('Error fetching popular locales:', error)
    return []
  }

  // 统计每个语言的事件次数
  const localeCounts = new Map<string, number>()

  data.forEach((event) => {
    const locale = event.locale
    if (locale) {
      localeCounts.set(locale, (localeCounts.get(locale) || 0) + 1)
    }
  })

  // 计算总数和百分比
  const total = Array.from(localeCounts.values()).reduce((sum, count) => sum + count, 0)

  // 排序并返回前 N 个
  return Array.from(localeCounts.entries())
    .map(([locale, count]) => ({
      locale,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
