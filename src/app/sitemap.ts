import type { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { routing } from '@/i18n/routing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://seekdrone.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: '', priority: 1, changeFreq: 'daily' as const },
    { path: '/products', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/case-studies', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/compliance', priority: 0.7, changeFreq: 'monthly' as const },
  ]

  const { data: products } = await supabaseAdmin.from('products').select('slug, updated_at').eq('published', true)
  const { data: cases } = await supabaseAdmin.from('case_studies').select('slug, updated_at')
  const { data: solutions } = await supabaseAdmin.from('solutions').select('slug, updated_at').eq('published', true)

  const entries: MetadataRoute.Sitemap = []

  for (const page of staticPages) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(lang => [lang, `${BASE_URL}/${lang}${page.path}`])
          ),
        },
      })
    }
  }

  for (const product of products || []) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/products/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(lang => [lang, `${BASE_URL}/${lang}/products/${product.slug}`])
          ),
        },
      })
    }
  }

  for (const c of cases || []) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/case-studies/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(lang => [lang, `${BASE_URL}/${lang}/case-studies/${c.slug}`])
          ),
        },
      })
    }
  }

  for (const solution of solutions || []) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/solutions/${solution.slug}`,
        lastModified: solution.updated_at ? new Date(solution.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(lang => [lang, `${BASE_URL}/${lang}/solutions/${solution.slug}`])
          ),
        },
      })
    }
  }

  return entries
}