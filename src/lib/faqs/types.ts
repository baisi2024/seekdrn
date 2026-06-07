export interface FAQ {
  id: string
  translations: Record<string, { question: string; answer: string }>
  sort_order: number
  published: boolean
  created_at: string
}