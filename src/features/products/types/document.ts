export type DocumentType = 'manual' | 'datasheet' | 'certificate' | 'brochure' | 'other'

export interface ProductDocument {
  id: string
  product_id: string
  type: DocumentType
  translations: Record<string, { title: string; description?: string }>
  file_url: string
  file_size: number | null
  file_type: string | null
  language: string | null
  sort_order: number
  created_at: string
}

export interface DocumentFormData {
  type: DocumentType
  translations: Record<string, { title: string; description?: string }>
  file_url: string
  language: string
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, Record<string, string>> = {
  manual: { en: 'Manual', zh: '手册' },
  datasheet: { en: 'Datasheet', zh: '数据表' },
  certificate: { en: 'Certificate', zh: '证书' },
  brochure: { en: 'Brochure', zh: '宣传册' },
  other: { en: 'Other', zh: '其他' },
}
