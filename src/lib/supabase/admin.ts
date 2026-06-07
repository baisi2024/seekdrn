import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { matchRelatedCases } from '../match-related-cases'

/**
 * 延迟初始化的 Supabase Admin Client
 *
 * 使用单例模式 + Proxy 实现延迟初始化：
 * - 模块加载时不验证环境变量
 * - 只在实际使用时才验证和创建 client
 * - 保持向后兼容，无需修改使用方代码
 *
 * 这样可以避免服务器组件在构建时因环境变量缺失而报错
 */

let adminClient: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is required. Please check your .env file.'
    )
  }

  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required. Please check your .env file. ' +
      'This key is needed for admin operations.'
    )
  }

  adminClient = createClient(supabaseUrl, supabaseServiceKey)
  return adminClient
}

// 使用 Proxy 实现延迟初始化，保持向后兼容
// 所有对 supabaseAdmin 的属性访问都会转发到实际的 client
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseAdmin()
    // 绑定方法到原始 client，确保 this 指向正确
    const value = client[prop as keyof SupabaseClient]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

export async function getProductWithEnhancements(slug: string, locale: string) {
  // 获取产品基本信息
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      product_specs(*),
      product_downloads(*)
    `)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error || !product) {
    return null
  }

  // 获取相关案例
  const relatedCases = await matchRelatedCases(product.id)

  // 组织规格组
  const specGroups = organizeSpecGroups(product.product_specs, product.spec_groups)

  return {
    ...product,
    spec_groups: specGroups,
    related_cases: relatedCases
  }
}

function organizeSpecGroups(specs: any[], specGroupsConfig: any[]) {
  if (!specGroupsConfig || specGroupsConfig.length === 0) {
    // 如果没有配置分组，将所有规格放入默认组
    return [{
      id: 'default',
      label: { en: 'Specifications' },
      specs: specs || [],
      sort_order: 0
    }]
  }

  // 按分组组织规格
  return specGroupsConfig.map(group => ({
    ...group,
    specs: (specs || []).filter(spec => spec.group_id === group.id)
  })).filter(group => group.specs.length > 0)
}
