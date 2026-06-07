export interface HeroConfig {
  title?: Record<string, string>
  subtitle?: Record<string, string>
  image_url?: string
  category?: string
  indicators?: Array<{ label: string; value: number }>
}

export interface TrustBarConfig {
  stats?: Array<{ label: Record<string, string>; value: string }>
}

export interface CtaConfig {
  title?: Record<string, string>
  subtitle?: Record<string, string>
  button_text?: Record<string, string>
}

export interface SeoMetadata {
  default_title?: Record<string, string>
  default_description?: Record<string, string>
  og_image?: string
}

export interface SiteSettings {
  id: number
  site_name: Record<string, string>
  seo_description: Record<string, string>
  contact_email: string
  contact_whatsapp: string
  enabled_languages: string[]
  enable_chinese: boolean
  enable_chinese_by_ip: boolean
  hero_config?: HeroConfig
  trust_bar_config?: TrustBarConfig
  cta_config?: CtaConfig
  seo_metadata?: SeoMetadata
  gtm_id?: string
  about_config?: Record<string, unknown>
  advantages_config?: Record<string, unknown>
}