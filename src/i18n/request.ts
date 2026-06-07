import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: {
      common: (await import(`../../messages/${locale}/common.json`)).default,
      home: (await import(`../../messages/${locale}/home.json`)).default,
      products: (await import(`../../messages/${locale}/products.json`)).default,
      solutions: (await import(`../../messages/${locale}/solutions.json`)).default,
      'case-studies': (await import(`../../messages/${locale}/case-studies.json`)).default,
      compliance: (await import(`../../messages/${locale}/compliance.json`)).default,
      footer: (await import(`../../messages/${locale}/footer.json`)).default,
      admin: (await import(`../../messages/${locale}/admin.json`)).default,
    },
  }
})
