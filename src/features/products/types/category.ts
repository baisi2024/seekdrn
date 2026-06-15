import type { CategoryHeroStat } from './product'

export interface Category {
  id: string
  slug: string
  parent_id: string | null
  translations: Record<string, { name: string; description?: string }>
  icon: string | null
  image: string | null
  sort_order: number
  children?: Category[]
  product_count?: number
  created_at: string
  updated_at: string
  hero_stats?: CategoryHeroStat[]
}

export interface CategoryTree {
  nodes: Category[]
  flatList: Category[]
}
