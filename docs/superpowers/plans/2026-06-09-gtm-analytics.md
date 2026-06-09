# GTM + 埋点功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的 GTM 埋点系统和后台分析面板，追踪用户行为并展示关键业务指标

**Architecture:** 采用混合方案 - GTM 追踪所有用户行为到 Google Analytics，关键转化事件同时存储到 Supabase，后台分析面板展示实时业务指标和历史趋势

**Tech Stack:** Next.js, Supabase, Google Tag Manager, Recharts (图表), @next/third-parties/google

---

## 文件结构

### 新增文件
```
supabase/migrations/022_analytics_events.sql
src/lib/analytics/events.ts
src/lib/analytics/session.ts
src/hooks/use-analytics.ts
src/app/api/analytics/events/route.ts
src/app/api/admin/analytics/overview/route.ts
src/app/api/admin/analytics/funnel/route.ts
src/app/api/admin/analytics/popular/route.ts
src/app/api/admin/analytics/trends/route.ts
src/app/api/admin/analytics/filters/route.ts
src/app/admin/analytics/page.tsx
src/app/admin/analytics/analytics-client.tsx
src/components/admin/analytics/overview-cards.tsx
src/components/admin/analytics/conversion-funnel.tsx
src/components/admin/analytics/popular-content.tsx
src/components/admin/analytics/trend-chart.tsx
src/components/admin/analytics/filter-stats.tsx
messages/zh/admin.json (更新)
messages/en/admin.json (更新)
```

### 修改文件
```
src/lib/gtm.ts
src/app/[locale]/products/[slug]/page.tsx
src/app/[locale]/solutions/[slug]/page.tsx
src/app/[locale]/case-studies/[slug]/page.tsx
src/components/public/inline-lead-form.tsx
src/components/public/product-filter.tsx
src/components/public/datasheet-download-button.tsx
src/components/public/language-switcher.tsx
src/components/public/lead-form-cta-button.tsx
src/components/public/share-buttons.tsx
src/components/admin/sidebar.tsx
```

---

## Task 1: 创建数据库表和索引

**Files:**
- Create: `supabase/migrations/022_analytics_events.sql`

- [ ] **Step 1: 创建 analytics_events 表**

```sql
-- 创建分析事件表
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  page_type VARCHAR(50),
  locale VARCHAR(10),
  metadata JSONB DEFAULT '{}',
  session_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_locale ON analytics_events(locale);

-- 添加注释
COMMENT ON TABLE analytics_events IS '存储关键业务分析事件';
COMMENT ON COLUMN analytics_events.event_name IS '事件名称';
COMMENT ON COLUMN analytics_events.event_category IS '事件分类: conversion, engagement, navigation';
COMMENT ON COLUMN analytics_events.page_type IS '页面类型: product, solution, case, home';
COMMENT ON COLUMN analytics_events.locale IS '语言版本';
COMMENT ON COLUMN analytics_events.metadata IS '事件参数，灵活存储';
COMMENT ON COLUMN analytics_events.session_id IS '会话ID，用于追踪用户会话';
```

- [ ] **Step 2: 运行迁移**

Run: `npx supabase db push`
Expected: Migration applied successfully

- [ ] **Step 3: 验证表创建**

Run: `npx supabase db inspect analytics_events`
Expected: Table structure shown with all columns and indexes

- [ ] **Step 4: 提交**

```bash
git add supabase/migrations/022_analytics_events.sql
git commit -m "feat: add analytics_events table for tracking"
```

---

## Task 2: 实现会话管理工具

**Files:**
- Create: `src/lib/analytics/session.ts`

- [ ] **Step 1: 创建会话管理工具**

```typescript
// src/lib/analytics/session.ts
const SESSION_KEY = 'analytics_session_id'
const SESSION_EXPIRY = 30 * 60 * 1000 // 30 minutes

export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  // 尝试从 sessionStorage 获取
  const stored = sessionStorage.getItem(SESSION_KEY)
  if (stored) {
    const parsed = JSON.parse(stored)
    // 检查是否过期
    if (Date.now() - parsed.timestamp < SESSION_EXPIRY) {
      return parsed.sessionId
    }
  }

  // 创建新会话
  const sessionId = generateSessionId()
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      sessionId,
      timestamp: Date.now(),
    })
  )
  return sessionId
}

function generateSessionId(): string {
  // 生成随机会话 ID: timestamp + random string
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${random}`
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY)
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/analytics/session.ts
git commit -m "feat: add session management for analytics"
```

---

## Task 3: 实现事件记录工具

**Files:**
- Create: `src/lib/analytics/events.ts`

- [ ] **Step 1: 创建事件记录工具**

```typescript
// src/lib/analytics/events.ts
import { getSessionId } from './session'

export interface AnalyticsEvent {
  event_name: string
  event_category?: 'conversion' | 'engagement' | 'navigation'
  page_type?: string
  locale?: string
  metadata?: Record<string, unknown>
}

/**
 * 记录分析事件到 Supabase
 * 仅用于关键转化事件，普通事件通过 GTM 追踪
 */
export async function trackAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const sessionId = getSessionId()

    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        session_id: sessionId,
      }),
    })

    if (!response.ok) {
      console.error('Failed to track analytics event:', response.statusText)
    }
  } catch (error) {
    // 静默失败，不影响主流程
    console.error('Error tracking analytics event:', error)
  }
}

// 便捷方法：追踪转化事件
export function trackConversion(
  eventName: string,
  metadata?: Record<string, unknown>,
  locale?: string
): Promise<void> {
  return trackAnalyticsEvent({
    event_name: eventName,
    event_category: 'conversion',
    locale,
    metadata,
  })
}

// 便捷方法：追踪互动事件
export function trackEngagement(
  eventName: string,
  metadata?: Record<string, unknown>,
  locale?: string
): Promise<void> {
  return trackAnalyticsEvent({
    event_name: eventName,
    event_category: 'engagement',
    locale,
    metadata,
  })
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/analytics/events.ts
git commit -m "feat: add analytics event tracking utilities"
```

---

## Task 4: 创建埋点 Hook

**Files:**
- Create: `src/hooks/use-analytics.ts`

- [ ] **Step 1: 创建埋点 Hook**

```typescript
// src/hooks/use-analytics.ts
'use client'

import { useCallback } from 'react'
import { trackAnalyticsEvent, trackConversion, trackEngagement } from '@/lib/analytics/events'
import {
  pushGtmEvent,
  trackCTAClick,
  trackFormSubmitStart,
  trackFormSubmitSuccess,
  trackFormSubmitError,
  trackDetailView,
  trackFilterApply,
  trackSearchSubmit,
  trackLanguageSwitch,
  trackDatasheetDownload,
} from '@/lib/gtm'

export function useAnalytics(locale?: string) {
  // 页面浏览追踪
  const trackPageView = useCallback(
    (type: 'product' | 'solution' | 'case', params: Record<string, unknown>) => {
      // GTM 追踪
      trackDetailView(type, params)

      // Supabase 追踪（仅产品详情）
      if (type === 'product') {
        trackAnalyticsEvent({
          event_name: `${type}_detail_view`,
          event_category: 'engagement',
          page_type: type,
          locale,
          metadata: params,
        })
      }
    },
    [locale]
  )

  // CTA 点击追踪
  const trackCTA = useCallback(
    (location: string, buttonText: string, params?: Record<string, unknown>) => {
      // GTM 追踪
      trackCTAClick(location, buttonText, params)

      // Supabase 追踪（关键转化）
      trackConversion('cta_click', { button_location: location, button_text: buttonText, ...params }, locale)
    },
    [locale]
  )

  // 表单事件追踪
  const trackFormOpen = useCallback(
    (params: { page_type: string; intent: string; product_model?: string }) => {
      pushGtmEvent('inline_form_open', { ...params, locale })
      trackEngagement('inline_form_open', params, locale)
    },
    [locale]
  )

  const trackFormStart = useCallback(
    (params: { page_type: string; intent: string }) => {
      pushGtmEvent('inline_form_start', { ...params, locale })
    },
    [locale]
  )

  const trackFormSubmit = useCallback(
    (intent: string, params?: Record<string, unknown>) => {
      trackFormSubmitStart(intent, params)
    },
    []
  )

  const trackFormSuccess = useCallback(
    (intent: string, params?: Record<string, unknown>) => {
      // GTM 追踪
      trackFormSubmitSuccess(intent, params)

      // Supabase 追踪（关键转化）
      trackConversion('inline_form_submit_success', { intent, ...params }, locale)
    },
    [locale]
  )

  const trackFormError = useCallback(
    (intent: string, params?: Record<string, unknown>) => {
      trackFormSubmitError(intent, params)
      trackConversion('inline_form_submit_error', { intent, ...params }, locale)
    },
    [locale]
  )

  // 下载追踪
  const trackDownload = useCallback(
    (params: { product_model: string; document_type: string; document_name: string }) => {
      // GTM 追踪
      trackDatasheetDownload({ ...params, locale: locale || 'en' })

      // Supabase 追踪（关键转化）
      trackConversion('datasheet_download', params, locale)
    },
    [locale]
  )

  // 筛选追踪
  const trackFilter = useCallback(
    (filterType: string, value: string | string[], params?: Record<string, unknown>) => {
      trackFilterApply(filterType, value, params)
    },
    []
  )

  // 搜索追踪
  const trackSearch = useCallback(
    (query: string, resultsCount: number) => {
      trackSearchSubmit(query, { results_count: resultsCount })
    },
    []
  )

  // 语言切换追踪
  const trackLanguageChange = useCallback(
    (fromLocale: string, toLocale: string) => {
      trackLanguageSwitch(fromLocale, toLocale)
    },
    []
  )

  // 分享追踪
  const trackShare = useCallback(
    (platform: string, pageType: string, contentId?: string) => {
      pushGtmEvent('social_share', { platform, page_type: pageType, content_id: contentId, locale })
      trackEngagement('social_share', { platform, page_type: pageType, content_id: contentId }, locale)
    },
    [locale]
  )

  return {
    trackPageView,
    trackCTA,
    trackFormOpen,
    trackFormStart,
    trackFormSubmit,
    trackFormSuccess,
    trackFormError,
    trackDownload,
    trackFilter,
    trackSearch,
    trackLanguageChange,
    trackShare,
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/use-analytics.ts
git commit -m "feat: add useAnalytics hook for easy tracking"
```

---

## Task 5: 创建事件记录 API

**Files:**
- Create: `src/app/api/analytics/events/route.ts`

- [ ] **Step 1: 创建 API 路由**

```typescript
// src/app/api/analytics/events/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      event_name,
      event_category,
      page_type,
      locale,
      metadata,
      session_id,
    } = body

    // 验证必需字段
    if (!event_name) {
      return NextResponse.json(
        { error: 'event_name is required' },
        { status: 400 }
      )
    }

    // 插入事件
    const { error } = await supabaseAdmin.from('analytics_events').insert({
      event_name,
      event_category,
      page_type,
      locale,
      metadata: metadata || {},
      session_id,
    })

    if (error) {
      console.error('Error inserting analytics event:', error)
      return NextResponse.json(
        { error: 'Failed to record event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics event API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/analytics/events/route.ts
git commit -m "feat: add API endpoint for recording analytics events"
```

---

## Task 6: 创建后台分析 API - 概览数据

**Files:**
- Create: `src/app/api/admin/analytics/overview/route.ts`

- [ ] **Step 1: 创建概览 API**

```typescript
// src/app/api/admin/analytics/overview/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
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
      default: // today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    // 获取表单提交数
    const { count: formSubmissions } = await supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'inline_form_submit_success')
      .gte('created_at', startDate.toISOString())

    // 获取产品详情浏览量
    const { count: productViews } = await supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'product_detail_view')
      .gte('created_at', startDate.toISOString())

    // 获取数据表下载数
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
      formSubmissions: formSubmissions || 0,
      productViews: productViews || 0,
      downloads: downloads || 0,
      conversionRate: `${conversionRate}%`,
      period,
    })
  } catch (error) {
    console.error('Analytics overview API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/admin/analytics/overview/route.ts
git commit -m "feat: add analytics overview API endpoint"
```

---

## Task 7: 创建后台分析 API - 转化漏斗

**Files:**
- Create: `src/app/api/admin/analytics/funnel/route.ts`

- [ ] **Step 1: 创建转化漏斗 API**

```typescript
// src/app/api/admin/analytics/funnel/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'

    // 计算时间范围
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default: // week
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // 获取各阶段数据
    const stages = [
      'inline_form_open',
      'inline_form_start',
      'inline_form_submit_start',
      'inline_form_submit_success',
    ]

    const funnelData = await Promise.all(
      stages.map(async (stage) => {
        const { count } = await supabaseAdmin
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_name', stage)
          .gte('created_at', startDate.toISOString())
        return { stage, count: count || 0 }
      })
    )

    // 计算转化率
    const funnelWithRates = funnelData.map((item, index) => {
      const rate = index === 0
        ? 100
        : funnelData[index - 1].count > 0
          ? ((item.count / funnelData[index - 1].count) * 100).toFixed(2)
          : 0
      return {
        ...item,
        conversionRate: Number(rate),
      }
    })

    return NextResponse.json({
      stages: funnelWithRates,
      period,
    })
  } catch (error) {
    console.error('Analytics funnel API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/admin/analytics/funnel/route.ts
git commit -m "feat: add analytics conversion funnel API endpoint"
```

---

## Task 8: 创建后台分析 API - 热门内容

**Files:**
- Create: `src/app/api/admin/analytics/popular/route.ts`

- [ ] **Step 1: 创建热门内容 API**

```typescript
// src/app/api/admin/analytics/popular/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'products'
    const limit = parseInt(searchParams.get('limit') || '10')

    const now = new Date()
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    let data: Array<{ name: string; count: number }> = []

    if (type === 'products') {
      // 热门产品（按浏览量）
      const { data: events } = await supabaseAdmin
        .from('analytics_events')
        .select('metadata')
        .eq('event_name', 'product_detail_view')
        .gte('created_at', startDate.toISOString())

      if (events) {
        const productCounts = events.reduce((acc, event) => {
          const model = event.metadata?.product_model as string
          if (model) {
            acc[model] = (acc[model] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>)

        data = Object.entries(productCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit)
      }
    } else if (type === 'downloads') {
      // 热门下载
      const { data: events } = await supabaseAdmin
        .from('analytics_events')
        .select('metadata')
        .eq('event_name', 'datasheet_download')
        .gte('created_at', startDate.toISOString())

      if (events) {
        const downloadCounts = events.reduce((acc, event) => {
          const name = event.metadata?.document_name as string
          if (name) {
            acc[name] = (acc[name] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>)

        data = Object.entries(downloadCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit)
      }
    } else if (type === 'locales') {
      // 语言分布
      const { data: events } = await supabaseAdmin
        .from('analytics_events')
        .select('locale')
        .gte('created_at', startDate.toISOString())

      if (events) {
        const localeCounts = events.reduce((acc, event) => {
          const locale = event.locale || 'unknown'
          acc[locale] = (acc[locale] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        data = Object.entries(localeCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      }
    }

    return NextResponse.json({
      data,
      type,
    })
  } catch (error) {
    console.error('Analytics popular API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/admin/analytics/popular/route.ts
git commit -m "feat: add analytics popular content API endpoint"
```

---

## Task 9: 创建后台分析 API - 趋势数据

**Files:**
- Create: `src/app/api/admin/analytics/trends/route.ts`

- [ ] **Step 1: 创建趋势 API**

```typescript
// src/app/api/admin/analytics/trends/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventName = searchParams.get('event_name') || 'inline_form_submit_success'
    const days = parseInt(searchParams.get('days') || '7')

    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    // 获取事件数据
    const { data: events } = await supabaseAdmin
      .from('analytics_events')
      .select('created_at')
      .eq('event_name', eventName)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // 按日期分组
    const trendData: Array<{ date: string; count: number }> = []
    const dateCounts: Record<string, number> = {}

    if (events) {
      events.forEach((event) => {
        const date = new Date(event.created_at).toISOString().split('T')[0]
        dateCounts[date] = (dateCounts[date] || 0) + 1
      })
    }

    // 填充缺失的日期
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      trendData.unshift({
        date,
        count: dateCounts[date] || 0,
      })
    }

    return NextResponse.json({
      data: trendData,
      eventName,
      days,
    })
  } catch (error) {
    console.error('Analytics trends API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/admin/analytics/trends/route.ts
git commit -m "feat: add analytics trends API endpoint"
```

---

## Task 10: 创建后台分析 API - 筛选统计

**Files:**
- Create: `src/app/api/admin/analytics/filters/route.ts`

- [ ] **Step 1: 创建筛选统计 API**

```typescript
// src/app/api/admin/analytics/filters/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'

    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // 获取筛选器使用数据
    const { data: filterEvents } = await supabaseAdmin
      .from('analytics_events')
      .select('metadata')
      .eq('event_name', 'filter_apply')
      .gte('created_at', startDate.toISOString())

    // 统计筛选类型
    const filterStats: Array<{ filter_type: string; count: number }> = []
    const filterCounts: Record<string, number> = {}

    if (filterEvents) {
      filterEvents.forEach((event) => {
        const filterType = event.metadata?.filter_type as string
        if (filterType) {
          filterCounts[filterType] = (filterCounts[filterType] || 0) + 1
        }
      })
    }

    Object.entries(filterCounts)
      .map(([filter_type, count]) => ({ filter_type, count }))
      .sort((a, b) => b.count - a.count)
      .forEach((item) => filterStats.push(item))

    // 获取搜索数据
    const { data: searchEvents } = await supabaseAdmin
      .from('analytics_events')
      .select('metadata')
      .eq('event_name', 'search_submit')
      .gte('created_at', startDate.toISOString())

    // 统计搜索关键词
    const searchStats: Array<{ query: string; count: number }> = []
    const queryCounts: Record<string, number> = {}

    if (searchEvents) {
      searchEvents.forEach((event) => {
        const query = event.metadata?.query as string
        if (query) {
          queryCounts[query] = (queryCounts[query] || 0) + 1
        }
      })
    }

    Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .forEach((item) => searchStats.push(item))

    return NextResponse.json({
      filters: filterStats,
      searches: searchStats,
      period,
    })
  } catch (error) {
    console.error('Analytics filters API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/admin/analytics/filters/route.ts
git commit -m "feat: add analytics filter stats API endpoint"
```

---

## Task 11: 创建后台分析组件 - 概览卡片

**Files:**
- Create: `src/components/admin/analytics/overview-cards.tsx`

- [ ] **Step 1: 创建概览卡片组件**

```typescript
// src/components/admin/analytics/overview-cards.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Eye, Download, TrendingUp } from 'lucide-react'

interface OverviewData {
  formSubmissions: number
  productViews: number
  downloads: number
  conversionRate: string
}

interface Props {
  period: string
}

export function OverviewCards({ period }: Props) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/analytics/overview?period=${period}`)
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Failed to fetch overview:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: '表单提交',
      value: data?.formSubmissions || 0,
      icon: FileText,
    },
    {
      title: '产品浏览',
      value: data?.productViews || 0,
      icon: Eye,
    },
    {
      title: '数据表下载',
      value: data?.downloads || 0,
      icon: Download,
    },
    {
      title: '转化率',
      value: data?.conversionRate || '0%',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/admin/analytics/overview-cards.tsx
git commit -m "feat: add overview cards component for analytics"
```

---

## Task 12: 创建后台分析组件 - 转化漏斗

**Files:**
- Create: `src/components/admin/analytics/conversion-funnel.tsx`

- [ ] **Step 1: 创建转化漏斗组件**

```typescript
// src/components/admin/analytics/conversion-funnel.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface FunnelStage {
  stage: string
  count: number
  conversionRate: number
}

interface Props {
  period: string
}

const stageLabels: Record<string, string> = {
  inline_form_open: '表单打开',
  inline_form_start: '开始填写',
  inline_form_submit_start: '提交中',
  inline_form_submit_success: '提交成功',
}

export function ConversionFunnel({ period }: Props) {
  const [stages, setStages] = useState<FunnelStage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/analytics/funnel?period=${period}`)
        const json = await res.json()
        setStages(json.stages)
      } catch (error) {
        console.error('Failed to fetch funnel:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>转化漏斗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...stages.map((s) => s.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle>转化漏斗</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0

            return (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {stageLabels[stage.stage] || stage.stage}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {stage.count} 次
                    </span>
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {stage.conversionRate.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-8 w-full rounded bg-muted">
                  <div
                    className="h-full rounded bg-primary transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/admin/analytics/conversion-funnel.tsx
git commit -m "feat: add conversion funnel component for analytics"
```

---

## Task 13: 创建后台分析组件 - 热门内容

**Files:**
- Create: `src/components/admin/analytics/popular-content.tsx`

- [ ] **Step 1: 创建热门内容组件**

```typescript
// src/components/admin/analytics/popular-content.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PopularItem {
  name: string
  count: number
}

interface Props {
  type: 'products' | 'downloads' | 'locales'
}

const titles: Record<string, string> = {
  products: '热门产品',
  downloads: '热门下载',
  locales: '语言分布',
}

export function PopularContent({ type }: Props) {
  const [data, setData] = useState<PopularItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/analytics/popular?type=${type}&limit=10`)
        const json = await res.json()
        setData(json.data)
      } catch (error) {
        console.error('Failed to fetch popular:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [type])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titles[type]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titles[type]}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无数据</p>
        ) : (
          <div className="space-y-2">
            {data.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span className="truncate max-w-[200px]">{item.name}</span>
                </div>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function PopularContentTabs() {
  return (
    <Tabs defaultValue="products">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="products">热门产品</TabsTrigger>
        <TabsTrigger value="downloads">热门下载</TabsTrigger>
        <TabsTrigger value="locales">语言分布</TabsTrigger>
      </TabsList>
      <TabsContent value="products">
        <PopularContent type="products" />
      </TabsContent>
      <TabsContent value="downloads">
        <PopularContent type="downloads" />
      </TabsContent>
      <TabsContent value="locales">
        <PopularContent type="locales" />
      </TabsContent>
    </Tabs>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/admin/analytics/popular-content.tsx
git commit -m "feat: add popular content component for analytics"
```

---

## Task 14: 创建后台分析组件 - 趋势图表

**Files:**
- Create: `src/components/admin/analytics/trend-chart.tsx`

- [ ] **Step 1: 创建趋势图表组件**

```typescript
// src/components/admin/analytics/trend-chart.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TrendData {
  date: string
  count: number
}

interface Props {
  eventName: string
  days: number
}

const eventLabels: Record<string, string> = {
  inline_form_submit_success: '表单提交',
  product_detail_view: '产品浏览',
  datasheet_download: '数据表下载',
  cta_click: 'CTA 点击',
}

export function TrendChart({ eventName, days }: Props) {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(eventName)
  const [selectedDays, setSelectedDays] = useState(days)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch(
          `/api/admin/analytics/trends?event_name=${selectedEvent}&days=${selectedDays}`
        )
        const json = await res.json()
        setData(json.data)
      } catch (error) {
        console.error('Failed to fetch trends:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedEvent, selectedDays])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>趋势图表</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>趋势图表</CardTitle>
          <div className="flex gap-2">
            <Select
              value={selectedEvent}
              onValueChange={setSelectedEvent}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inline_form_submit_success">表单提交</SelectItem>
                <SelectItem value="product_detail_view">产品浏览</SelectItem>
                <SelectItem value="datasheet_download">数据表下载</SelectItem>
                <SelectItem value="cta_click">CTA 点击</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedDays.toString()}
              onValueChange={(v) => setSelectedDays(Number(v))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 天</SelectItem>
                <SelectItem value="14">14 天</SelectItem>
                <SelectItem value="30">30 天</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <div className="flex h-full items-end gap-1">
            {data.map((item) => {
              const height = (item.count / maxCount) * 100
              return (
                <div
                  key={item.date}
                  className="group relative flex-1 cursor-pointer"
                >
                  <div
                    className="w-full rounded-t bg-primary transition-all group-hover:bg-primary/80"
                    style={{ height: `${height}%`, minHeight: '2px' }}
                  />
                  <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs group-hover:block">
                    {item.date}: {item.count}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/admin/analytics/trend-chart.tsx
git commit -m "feat: add trend chart component for analytics"
```

---

## Task 15: 创建后台分析组件 - 筛选统计

**Files:**
- Create: `src/components/admin/analytics/filter-stats.tsx`

- [ ] **Step 1: 创建筛选统计组件**

```typescript
// src/components/admin/analytics/filter-stats.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface FilterStats {
  filters: Array<{ filter_type: string; count: number }>
  searches: Array<{ query: string; count: number }>
}

interface Props {
  period: string
}

export function FilterStats({ period }: Props) {
  const [data, setData] = useState<FilterStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/analytics/filters?period=${period}`)
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Failed to fetch filter stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
                  <Skeleton key={j} className="h-6 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>筛选器使用</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.filters.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无数据</p>
          ) : (
            <div className="space-y-2">
              {data?.filters.slice(0, 10).map((filter) => (
                <div
                  key={filter.filter_type}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{filter.filter_type}</span>
                  <span className="font-medium">{filter.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>搜索关键词</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.searches.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无数据</p>
          ) : (
            <div className="space-y-2">
              {data?.searches.slice(0, 10).map((search) => (
                <div
                  key={search.query}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate max-w-[200px]">{search.query}</span>
                  <span className="font-medium">{search.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/admin/analytics/filter-stats.tsx
git commit -m "feat: add filter stats component for analytics"
```

---

## Task 16: 创建后台分析页面

**Files:**
- Create: `src/app/admin/analytics/page.tsx`
- Create: `src/app/admin/analytics/analytics-client.tsx`

- [ ] **Step 1: 创建服务端页面**

```typescript
// src/app/admin/analytics/page.tsx
import { AnalyticsClient } from './analytics-client'

export default function AnalyticsPage() {
  return <AnalyticsClient />
}
```

- [ ] **Step 2: 创建客户端页面**

```typescript
// src/app/admin/analytics/analytics-client.tsx
'use client'

import { useState } from 'react'
import { OverviewCards } from '@/components/admin/analytics/overview-cards'
import { ConversionFunnel } from '@/components/admin/analytics/conversion-funnel'
import { PopularContentTabs } from '@/components/admin/analytics/popular-content'
import { TrendChart } from '@/components/admin/analytics/trend-chart'
import { FilterStats } from '@/components/admin/analytics/filter-stats'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AnalyticsClient() {
  const [period, setPeriod] = useState('week')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">数据分析</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">今日</SelectItem>
            <SelectItem value="week">本周</SelectItem>
            <SelectItem value="month">本月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <OverviewCards period={period} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ConversionFunnel period={period} />
        <TrendChart eventName="inline_form_submit_success" days={7} />
      </div>

      <PopularContentTabs />

      <FilterStats period={period} />
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add src/app/admin/analytics/page.tsx src/app/admin/analytics/analytics-client.tsx
git commit -m "feat: add analytics admin page"
```

---

## Task 17: 更新后台侧边栏导航

**Files:**
- Modify: `src/components/admin/sidebar.tsx`

- [ ] **Step 1: 添加分析菜单项**

在侧边栏菜单中添加数据分析链接：

```typescript
// 在菜单项数组中添加
{
  title: '数据分析',
  href: '/admin/analytics',
  icon: BarChart3, // 需要导入 lucide-react 的 BarChart3
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/admin/sidebar.tsx
git commit -m "feat: add analytics link to admin sidebar"
```

---

## Task 18: 添加翻译文本

**Files:**
- Modify: `messages/zh/admin.json`
- Modify: `messages/en/admin.json`

- [ ] **Step 1: 添加中文翻译**

```json
{
  "analytics_page": {
    "title": "数据分析",
    "overview": {
      "title": "概览",
      "form_submissions": "表单提交",
      "product_views": "产品浏览",
      "downloads": "数据表下载",
      "conversion_rate": "转化率"
    },
    "funnel": {
      "title": "转化漏斗",
      "form_open": "表单打开",
      "form_start": "开始填写",
      "form_submit": "提交中",
      "form_success": "提交成功"
    },
    "popular": {
      "title": "热门内容",
      "products": "热门产品",
      "downloads": "热门下载",
      "locales": "语言分布"
    },
    "trends": {
      "title": "趋势图表",
      "days_7": "7 天",
      "days_14": "14 天",
      "days_30": "30 天"
    },
    "filters": {
      "title": "筛选统计",
      "filter_usage": "筛选器使用",
      "search_keywords": "搜索关键词"
    }
  }
}
```

- [ ] **Step 2: 添加英文翻译**

```json
{
  "analytics_page": {
    "title": "Analytics",
    "overview": {
      "title": "Overview",
      "form_submissions": "Form Submissions",
      "product_views": "Product Views",
      "downloads": "Downloads",
      "conversion_rate": "Conversion Rate"
    },
    "funnel": {
      "title": "Conversion Funnel",
      "form_open": "Form Open",
      "form_start": "Start Filling",
      "form_submit": "Submitting",
      "form_success": "Submit Success"
    },
    "popular": {
      "title": "Popular Content",
      "products": "Popular Products",
      "downloads": "Popular Downloads",
      "locales": "Language Distribution"
    },
    "trends": {
      "title": "Trend Chart",
      "days_7": "7 Days",
      "days_14": "14 Days",
      "days_30": "30 Days"
    },
    "filters": {
      "title": "Filter Statistics",
      "filter_usage": "Filter Usage",
      "search_keywords": "Search Keywords"
    }
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add messages/zh/admin.json messages/en/admin.json
git commit -m "feat: add analytics translations"
```

---

## Task 19: 集成埋点到产品详情页

**Files:**
- Modify: `src/app/[locale]/products/[slug]/page.tsx`

- [ ] **Step 1: 添加页面浏览追踪**

在产品详情页组件中添加埋点：

```typescript
// 在页面组件中导入
import { useAnalytics } from '@/hooks/use-analytics'
import { useEffect } from 'react'

// 在组件内部
const analytics = useAnalytics(locale)

useEffect(() => {
  if (product) {
    analytics.trackPageView('product', {
      product_model: product.model,
      product_name: product.name,
      category: product.category?.name,
    })
  }
}, [product])
```

- [ ] **Step 2: 提交**

```bash
git add src/app/[locale]/products/[slug]/page.tsx
git commit -m "feat: add page view tracking to product detail page"
```

---

## Task 20: 集成埋点到解决方案页

**Files:**
- Modify: `src/app/[locale]/solutions/[slug]/page.tsx`

- [ ] **Step 1: 添加页面浏览追踪**

```typescript
// 在解决方案页面组件中添加
import { useAnalytics } from '@/hooks/use-analytics'
import { useEffect } from 'react'

const analytics = useAnalytics(locale)

useEffect(() => {
  if (solution) {
    analytics.trackPageView('solution', {
      solution_slug: solution.slug,
      solution_name: solution.title,
    })
  }
}, [solution])
```

- [ ] **Step 2: 提交**

```bash
git add src/app/[locale]/solutions/[slug]/page.tsx
git commit -m "feat: add page view tracking to solution page"
```

---

## Task 21: 集成埋点到案例页

**Files:**
- Modify: `src/app/[locale]/case-studies/[slug]/page.tsx`

- [ ] **Step 1: 添加页面浏览追踪**

```typescript
// 在案例页面组件中添加
import { useAnalytics } from '@/hooks/use-analytics'
import { useEffect } from 'react'

const analytics = useAnalytics(locale)

useEffect(() => {
  if (caseStudy) {
    analytics.trackPageView('case', {
      case_slug: caseStudy.slug,
      case_name: caseStudy.title,
    })
  }
}, [caseStudy])
```

- [ ] **Step 2: 提交**

```bash
git add src/app/[locale]/case-studies/[slug]/page.tsx
git commit -m "feat: add page view tracking to case study page"
```

---

## Task 22: 集成埋点到表单组件

**Files:**
- Modify: `src/components/public/inline-lead-form.tsx`

- [ ] **Step 1: 添加表单追踪**

在表单组件中添加完整的转化漏斗追踪：

```typescript
// 导入
import { useAnalytics } from '@/hooks/use-analytics'

// 在组件内部
const analytics = useAnalytics(locale)
const [formStarted, setFormStarted] = useState(false)

// 表单打开时
useEffect(() => {
  analytics.trackFormOpen({
    page_type: 'inline',
    intent: intent || 'general',
    product_model: productModel,
  })
}, [])

// 表单开始填写时（第一个字段输入）
const handleFieldFocus = () => {
  if (!formStarted) {
    setFormStarted(true)
    analytics.trackFormStart({
      page_type: 'inline',
      intent: intent || 'general',
    })
  }
}

// 表单提交时
const handleSubmit = async (data: FormData) => {
  analytics.trackFormSubmit(intent || 'general', { product_model: productModel })

  try {
    // ... 提交逻辑
    analytics.trackFormSuccess(intent || 'general', {
      product_model: productModel,
      inquiry_id: result.id,
    })
  } catch (error) {
    analytics.trackFormError(intent || 'general', {
      product_model: productModel,
      error_type: error.message,
    })
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/inline-lead-form.tsx
git commit -m "feat: add form tracking to inline lead form"
```

---

## Task 23: 集成埋点到下载按钮

**Files:**
- Modify: `src/components/public/datasheet-download-button.tsx`

- [ ] **Step 1: 添加下载追踪**

```typescript
// 导入
import { useAnalytics } from '@/hooks/use-analytics'

// 在组件内部
const analytics = useAnalytics(locale)

const handleDownload = () => {
  analytics.trackDownload({
    product_model: productModel,
    document_type: documentType,
    document_name: documentName,
  })

  // 执行下载
  window.open(downloadUrl, '_blank')
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/datasheet-download-button.tsx
git commit -m "feat: add download tracking to datasheet button"
```

---

## Task 24: 集成埋点到筛选组件

**Files:**
- Modify: `src/components/public/product-filter.tsx`

- [ ] **Step 1: 添加筛选追踪**

```typescript
// 导入
import { useAnalytics } from '@/hooks/use-analytics'

// 在组件内部
const analytics = useAnalytics(locale)

const handleFilterChange = (filterType: string, value: string | string[]) => {
  analytics.trackFilter(filterType, value, {
    page_type: 'products',
  })

  // 执行筛选
  onFilterChange(filterType, value)
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/product-filter.tsx
git commit -m "feat: add filter tracking to product filter"
```

---

## Task 25: 集成埋点到语言切换器

**Files:**
- Modify: `src/components/public/language-switcher.tsx`

- [ ] **Step 1: 添加语言切换追踪**

```typescript
// 导入
import { useAnalytics } from '@/hooks/use-analytics'

// 在组件内部
const analytics = useAnalytics()

const handleLanguageChange = (newLocale: string) => {
  analytics.trackLanguageChange(locale, newLocale)

  // 执行切换
  router.push(`/${newLocale}${pathname}`)
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/language-switcher.tsx
git commit -m "feat: add language switch tracking"
```

---

## Task 26: 集成埋点到 CTA 按钮

**Files:**
- Modify: `src/components/public/lead-form-cta-button.tsx`

- [ ] **Step 1: 添加 CTA 点击追踪**

```typescript
// 导入
import { useAnalytics } from '@/hooks/use-analytics'

// 在组件内部
const analytics = useAnalytics(locale)

const handleClick = () => {
  analytics.trackCTA(location, buttonText, {
    page_type: pageType,
  })

  // 执行点击操作
  onClick?.()
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/lead-form-cta-button.tsx
git commit -m "feat: add CTA click tracking"
```

---

## Task 27: 集成埋点到分享按钮

**Files:**
- Modify: `src/components/public/share-buttons.tsx`

- [ ] **Step 1: 添加分享追踪**

```typescript
// 导入
import { useAnalytics } from '@/hooks/use-analytics'

// 在组件内部
const analytics = useAnalytics(locale)

const handleShare = (platform: string) => {
  analytics.trackShare(platform, pageType, contentId)

  // 执行分享
  // ... 分享逻辑
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/share-buttons.tsx
git commit -m "feat: add share tracking to share buttons"
```

---

## Task 28: 测试埋点功能

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: Server started successfully

- [ ] **Step 2: 测试页面浏览追踪**

1. 访问产品详情页
2. 打开浏览器控制台，查看 Network 标签
3. 确认有 `/api/analytics/events` 请求
4. 确认 Google Tag Manager 中有 `product_detail_view` 事件

- [ ] **Step 3: 测试表单追踪**

1. 打开表单
2. 填写表单
3. 提交表单
4. 确认控制台中有以下事件：
   - `inline_form_open`
   - `inline_form_start`
   - `inline_form_submit_start`
   - `inline_form_submit_success`

- [ ] **Step 4: 测试后台分析页面**

1. 访问 `/admin/analytics`
2. 确认概览卡片显示数据
3. 确认转化漏斗显示正确
4. 确认趋势图表正常渲染

- [ ] **Step 5: 提交**

```bash
git commit -m "test: verify analytics tracking functionality"
```

---

## Task 29: 创建环境变量文档

**Files:**
- Create: `docs/ANALYTICS_SETUP.md`

- [ ] **Step 1: 创建文档**

```markdown
# GTM + 埋点功能配置指南

## 环境变量配置

### 必需配置

在 `.env.local` 文件中添加：

\`\`\`env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX
\`\`\`

### 可选配置（Google Analytics API）

如需在后台展示历史数据，需配置 Google Analytics API：

\`\`\`env
GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id
GOOGLE_ANALYTICS_CLIENT_EMAIL=your_service_account_email
GOOGLE_ANALYTICS_PRIVATE_KEY=your_private_key
\`\`\`

## GTM 配置步骤

1. 登录 [Google Tag Manager](https://tagmanager.google.com/)
2. 创建新容器或使用现有容器
3. 复制容器 ID（格式：GTM-XXXXXX）
4. 在 GTM 中配置触发器和代码：
   - 创建自定义事件触发器
   - 创建 Google Analytics: GA4 Event 代码
   - 将触发器和代码关联

## 常见事件列表

### 页面浏览
- product_detail_view
- solution_detail_view
- case_detail_view

### 用户交互
- cta_click
- datasheet_download
- social_share

### 表单转化
- inline_form_open
- inline_form_start
- inline_form_submit_start
- inline_form_submit_success
- inline_form_submit_error

### 筛选和搜索
- filter_apply
- search_submit
- language_switch

## 数据查看

### Google Analytics
访问 [Google Analytics](https://analytics.google.com/) 查看用户行为数据

### 后台分析面板
访问 `/admin/analytics` 查看实时业务指标

## 故障排查

### 埋点不生效
1. 检查 GTM ID 是否正确配置
2. 检查 GTM 容器是否发布
3. 使用 Google Tag Assistant 调试

### 后台数据不显示
1. 检查数据库表是否创建成功
2. 检查 API 是否正常响应
3. 查看浏览器控制台错误信息
\`\`\`

- [ ] **Step 2: 提交**

```bash
git add docs/ANALYTICS_SETUP.md
git commit -m "docs: add analytics setup guide"
```

---

## 完成检查清单

- [ ] 数据库表创建成功
- [ ] 所有 API 端点正常工作
- [ ] 后台分析页面正常显示
- [ ] 页面浏览追踪正常
- [ ] 表单转化追踪正常
- [ ] 下载追踪正常
- [ ] 筛选追踪正常
- [ ] 语言切换追踪正常
- [ ] CTA 点击追踪正常
- [ ] 分享追踪正常
- [ ] 翻译文本完整
- [ ] 文档完整

---

## 后续工作

完成以上任务后，你需要做以下工作：

1. **配置 GTM 容器**：
   - 登录 Google Tag Manager
   - 创建自定义事件触发器
   - 创建 GA4 事件代码
   - 发布容器

2. **验证埋点**：
   - 使用 Google Tag Assistant 验证事件
   - 在 Google Analytics 中查看实时数据
   - 在后台分析面板查看数据

3. **可选：配置 Google Analytics API**：
   - 创建 Google Cloud 服务账号
   - 启用 Analytics Data API
   - 下载 JSON 密钥文件
   - 配置环境变量

4. **监控和优化**：
   - 定期检查埋点数据
   - 根据业务需求调整追踪事件
   - 优化后台分析面板展示
