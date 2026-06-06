/**
 * 政策项目类型定义
 */
export interface PolicyItem {
  id: string
  slug: string
  title: string
  description: string
  content: string
  version: string
  effectiveDate: string
  lastUpdated: string
  status: 'active' | 'draft' | 'archived'
  category: string
}

/**
 * 政策更新记录类型
 */
export interface PolicyUpdate {
  id: string
  policyId: string
  version: string
  changes: string
  updatedBy: string
  updatedAt: string
}

/**
 * 政策配置类型
 */
export interface PolicyConfig {
  slug: string
  title: string
  description: string
  category: string
  defaultContent: string
}
