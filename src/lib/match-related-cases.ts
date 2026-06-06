import { supabaseAdmin } from './supabase/admin'

interface CaseStudy {
  id: string
  slug: string
  industry: string
  country: string
  translations: Record<string, any>
  results: Record<string, any>
  video_url: string
  images: string[]
}

interface ProductCaseRelation {
  case_study_id: string
  is_manual: boolean
  relevance_score: number
}

export async function matchRelatedCases(productId: string): Promise<CaseStudy[]> {
  // 1. 获取产品信息
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id, category')
    .eq('id', productId)
    .maybeSingle()

  if (!product) return []

  // 2. 获取手动配置的案例
  const { data: manualRelations } = await supabaseAdmin
    .from('product_case_relations')
    .select('case_study_id, is_manual, relevance_score')
    .eq('product_id', productId)
    .eq('is_manual', true)
    .order('sort_order')

  let caseIds = manualRelations?.map(r => r.case_study_id) || []

  // 3. 如果手动案例少于3个，自动匹配补充
  if (caseIds.length < 3) {
    const autoCases = await autoMatchCases(productId, product.category, caseIds)
    caseIds = [...caseIds, ...autoCases].slice(0, 3)
  }

  // 4. 获取案例详情
  if (caseIds.length === 0) return []

  const { data: cases } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .in('id', caseIds)
    .eq('published', true)

  return cases || []
}

async function autoMatchCases(
  productId: string,
  category: string,
  excludeIds: string[]
): Promise<string[]> {
  // 按行业匹配
  const { data: industryCases } = await supabaseAdmin
    .from('case_studies')
    .select('id')
    .eq('industry', category)
    .eq('published', true)
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .limit(3 - excludeIds.length)

  return industryCases?.map(c => c.id) || []
}
