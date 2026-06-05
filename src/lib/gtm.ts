export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
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
