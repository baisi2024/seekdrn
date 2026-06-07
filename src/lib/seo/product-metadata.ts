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

function truncate(str: string, max: number): string {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 3) + '...' : str
}

function extractKeywords(translation: Record<string, string>): string[] {
  const text = [translation.name, translation.overview, translation.advantages, translation.capabilities]
    .filter(Boolean).join(' ')
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  return [...new Set(words)].slice(0, 10)
}
