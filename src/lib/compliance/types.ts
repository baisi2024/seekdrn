/**
 * 政策项目类型定义
 */
export interface PolicyItem {
  id: string
  section: string
  translations: Record<string, { title?: string; content: string }>
  published: boolean
  created_at: string
  updated_at?: string
}

/**
 * 政策更新数据类型
 */
export interface PolicyUpdate {
  translations: Record<string, { title?: string; content: string }>
  published?: boolean
}

/**
 * 政策配置类型
 */
export interface PolicyConfig {
  section: string
  slug: string
  name: {
    en: string
    zh: string
  }
}
