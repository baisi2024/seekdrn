import type { Metadata } from 'next'
import type { Product } from '@/features/products/types'

interface GenerateProductMetadataOptions {
  product: Product
  locale: string
  seo?: Record<string, { meta_title?: string; meta_description?: string; meta_keywords?: string[] }>
}

export function generateProductMetadata({
  product,
  locale,
  seo,
}: GenerateProductMetadataOptions): Metadata {
  const translation = product.translations?.[locale] || {}
  const seoData = seo?.[locale]
  const siteName = 'SEEKDRN'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seekdrn.com'

  const title = seoData?.meta_title || `${translation.name || product.model} | ${siteName}`
  const description = seoData?.meta_description || truncate(translation.overview || '', 160)
  const keywords = seoData?.meta_keywords || extractKeywords(translation)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const image = (seo?.[locale] as any)?.og_image || product.images?.[0] || ''

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: seoData?.meta_title || translation.name || product.model,
      description: seoData?.meta_description || truncate(translation.overview || '', 200),
      images: image ? [{ url: image }] : [],
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData?.meta_title || translation.name || product.model,
      description: seoData?.meta_description || truncate(translation.overview || '', 200),
      images: image ? [image] : [],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/products/${product.slug}`,
      languages: {
        en: `${baseUrl}/en/products/${product.slug}`,
        zh: `${baseUrl}/zh/products/${product.slug}`,
      },
    },
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&times;/gi, '×')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&le;/gi, '≤')
    .replace(/&ge;/gi, '≥')
    .replace(/&deg;/gi, '°')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#\d+;/g, '') // Remove numeric entities
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()
}

function truncate(str: string, max: number): string {
  const clean = stripHtml(str)
  if (!clean) return ''
  return clean.length > max ? clean.slice(0, max - 3) + '...' : clean
}

function extractKeywords(translation: Record<string, string>): string[] {
  const text = [translation.name, translation.overview, translation.advantages, translation.capabilities]
    .filter(Boolean).map(stripHtml).join(' ')
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  return [...new Set(words)].slice(0, 10)
}
