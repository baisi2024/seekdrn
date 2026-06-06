export interface ProductTag {
  id: string
  slug: string
  translations: Record<string, { name: string }>
  color: string
  created_at: string
  product_count?: number
}

export interface TagFormData {
  slug: string
  translations: Record<string, { name: string }>
  color: string
}
