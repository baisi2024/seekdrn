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
