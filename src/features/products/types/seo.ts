export interface ProductSEO {
  product_id: string
  locale: string
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[]
  og_title: string | null
  og_description: string | null
  og_image: string | null
  structured_data: Record<string, unknown> | null
}

export interface SEOFormData {
  meta_title: string
  meta_description: string
  meta_keywords: string[]
  og_title: string
  og_description: string
  og_image: string
}

export const SEO_LIMITS = {
  meta_title: 60,
  meta_description: 160,
  og_title: 60,
  og_description: 200,
} as const
