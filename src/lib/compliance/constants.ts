import type { PolicyConfig } from './types'

/**
 * 政策配置列表
 */
export const POLICIES: PolicyConfig[] = [
  {
    slug: 'privacy-policy',
    title: '隐私政策',
    description: '我们如何收集、使用和保护您的个人信息',
    category: '数据保护',
    defaultContent: '# 隐私政策\n\n本隐私政策说明了我们如何收集、使用和保护您的个人信息。',
  },
  {
    slug: 'terms-of-service',
    title: '服务条款',
    description: '使用我们产品和服务的条款和条件',
    category: '法律条款',
    defaultContent: '# 服务条款\n\n欢迎使用我们的产品和服务。使用前请仔细阅读本条款。',
  },
  {
    slug: 'export-compliance',
    title: '出口合规政策',
    description: '产品出口相关的合规要求和限制',
    category: '合规',
    defaultContent: '# 出口合规政策\n\n本政策说明了产品出口相关的合规要求和限制。',
  },
  {
    slug: 'data-processing',
    title: '数据处理协议',
    description: '数据处理的方式和安全措施',
    category: '数据保护',
    defaultContent: '# 数据处理协议\n\n本协议说明了我们如何处理和保护数据。',
  },
]

/**
 * 政策 slug 映射
 */
export const POLICY_SLUG_MAP: Record<string, PolicyConfig> = POLICIES.reduce(
  (acc, policy) => {
    acc[policy.slug] = policy
    return acc
  },
  {} as Record<string, PolicyConfig>
)
