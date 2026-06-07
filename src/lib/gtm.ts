declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    })
  }
}

export function trackCTAClick(location: string, buttonText: string) {
  trackEvent('cta_click', { button_location: location, button_text: buttonText })
}

export function trackDemoFormSubmit(country: string, application: string) {
  trackEvent('demo_form_submit', { country, application })
}

export function trackDemoRequestSuccess(complianceStatus: string) {
  trackEvent('demo_request_success', { compliance_status: complianceStatus })
}

export function trackDatasheetDownload(productModel: string) {
  trackEvent('datasheet_download', { product_model: productModel })
}
