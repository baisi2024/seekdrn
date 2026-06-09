declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export type GtmEventName =
  | 'cta_click'
  | 'form_submit_start'
  | 'form_submit_success'
  | 'form_submit_error'
  | 'product_detail_view'
  | 'solution_detail_view'
  | 'case_detail_view'
  | 'datasheet_download'
  | 'filter_apply'
  | 'search_submit'
  | 'language_switch'
  | 'demo_form_submit'
  | 'demo_request_success'

type GtmParams = Record<string, unknown>

export function pushGtmEvent(eventName: GtmEventName | string, params?: GtmParams) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    })
  }
}

export function trackEvent(eventName: GtmEventName | string, params?: GtmParams) {
  pushGtmEvent(eventName, params)
}

export function trackConversionEvent(eventName: GtmEventName, params?: GtmParams) {
  pushGtmEvent(eventName, {
    event_category: 'conversion',
    ...params,
  })
}

export function trackCTAClick(location: string, buttonText: string, params?: GtmParams) {
  trackConversionEvent('cta_click', {
    button_location: location,
    button_text: buttonText,
    ...params,
  })
}

export function trackFormSubmitStart(intent: string, params?: GtmParams) {
  trackConversionEvent('form_submit_start', { intent, ...params })
}

export function trackFormSubmitSuccess(intent: string, params?: GtmParams) {
  trackConversionEvent('form_submit_success', { intent, ...params })
}

export function trackFormSubmitError(intent: string, params?: GtmParams) {
  trackConversionEvent('form_submit_error', { intent, ...params })
}

export function trackDemoFormSubmit(country: string, application: string) {
  pushGtmEvent('demo_form_submit', { country, application })
}

export function trackDemoRequestSuccess(complianceStatus: string) {
  pushGtmEvent('demo_request_success', { compliance_status: complianceStatus })
}

export function trackDatasheetDownload(params: {
  product_model: string
  document_type: string
  locale: string
}) {
  trackEvent('datasheet_download', params)
}

export function trackInlineFormOpen(params: {
  page_type: string
  intent: string
  product_model?: string
  solution_slug?: string
  case_slug?: string
  locale: string
}) {
  trackEvent('inline_form_open', params)
}

export function trackInlineFormStart(params: {
  page_type: string
  intent: string
  locale: string
}) {
  trackEvent('inline_form_start', params)
}

export function trackInlineFormSubmitStart(params: {
  page_type: string
  intent: string
  locale: string
}) {
  trackEvent('inline_form_submit_start', params)
}

export function trackInlineFormSubmitSuccess(params: {
  page_type: string
  intent: string
  product_model?: string
  locale: string
}) {
  trackEvent('inline_form_submit_success', params)
}

export function trackInlineFormSubmitError(params: {
  page_type: string
  intent: string
  error: string
  locale: string
}) {
  trackEvent('inline_form_submit_error', params)
}

export function trackDetailView(
  type: 'product' | 'solution' | 'case',
  params?: GtmParams,
) {
  const eventMap = {
    product: 'product_detail_view',
    solution: 'solution_detail_view',
    case: 'case_detail_view',
  } as const

  pushGtmEvent(eventMap[type], params)
}

export function trackFilterApply(filterType: string, value: string | string[], params?: GtmParams) {
  pushGtmEvent('filter_apply', { filter_type: filterType, value, ...params })
}

export function trackSearchSubmit(query: string, params?: GtmParams) {
  pushGtmEvent('search_submit', { query, ...params })
}

export function trackLanguageSwitch(fromLocale: string, toLocale: string, params?: GtmParams) {
  pushGtmEvent('language_switch', { from_locale: fromLocale, to_locale: toLocale, ...params })
}

export function trackSocialShare(params: {
  platform: string
  page_type: string
  locale: string
}) {
  trackEvent('social_share', params)
}
