import { createClient } from '@supabase/supabase-js'
import { matchRelatedCases } from '../match-related-cases'

// 验证环境变量
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

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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
