export interface Product {
  id: string
  model: string
  slug: string
  category_id: string | null
  category?: Category
  translations: Record<string, Record<string, string>>
  translation_status: Record<string, Record<string, TranslationStatus>>
  images: string[]
  videos: string[]
  tags: string[]
  published: boolean
  featured: boolean
  compliance_flag: boolean
  spec_groups: SpecGroup[]
  sort_order: number
  created_at: string
  updated_at: string
}

export type TranslationStatus = 'translated' | 'pending' | 'syncing' | 'missing'

export interface SpecGroup {
  id: string
  name: Record<string, string>
  specs: Spec[]
}

export interface Spec {
  label: Record<string, string>
  value: string
  unit?: string
}

export interface FilterState {
  search: string
  category: string | null
  tags: string[]
  specs: Record<string, string | [number, number]>
  sort: 'relevance' | 'price_asc' | 'price_desc' | 'newest'
  page: number
  pageSize: number
}

export interface ToolbarConfig {
  groups: Array<'history' | 'text' | 'heading' | 'list' | 'block' | 'insert'>
}
