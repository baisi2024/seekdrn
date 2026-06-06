export interface ProductFAQ {
  id: string
  product_id: string
  locale: string
  question: string
  answer: string
  sort_order: number
  created_at: string
}

export interface FAQFormData {
  question: string
  answer: string
}
