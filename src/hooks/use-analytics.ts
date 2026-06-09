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
