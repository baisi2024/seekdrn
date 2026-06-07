export interface SiteContent {
  id: string
  section: string
  key: string
  translations: Record<string, unknown>
  image_url?: string
  sort_order: number
  published: boolean
}