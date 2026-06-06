import type { PolicyConfig } from './types'

/**
 * 政策配置列表
 */
export const POLICIES: PolicyConfig[] = [
  {
    section: 'export_compliance',
    slug: 'export',
    name: {
      en: 'Export Compliance',
      zh: '出口合规'
    }
  },
  {
    section: 'privacy_policy',
    slug: 'privacy',
    name: {
      en: 'Privacy Policy',
      zh: '隐私政策'
    }
  },
  {
    section: 'terms_of_use',
    slug: 'terms',
    name: {
      en: 'Terms of Use',
      zh: '使用条款'
    }
  },
  {
    section: 'cookie_policy',
    slug: 'cookie',
    name: {
      en: 'Cookie Policy',
      zh: 'Cookie 政策'
    }
  }
]

/**
 * 政策 slug 映射
 */
export const POLICY_SLUG_MAP = Object.fromEntries(
  POLICIES.map(p => [p.slug, p.section])
) as Record<string, string>
