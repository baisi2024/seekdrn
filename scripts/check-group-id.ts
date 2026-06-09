// 检查规格的 group_id
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

async function checkGroupId() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('=== 检查规格的 group_id ===\n')

  const { data: specs, error } = await supabase
    .from('product_specs')
    .select('id, label, group_id')
    .limit(10)

  if (error) {
    console.log('查询失败:', error)
    return
  }

  console.log('规格数据:')
  specs?.forEach((spec, i) => {
    const labelEn = (spec.label as any)?.en || spec.label
    console.log(`${i + 1}. ${labelEn} - group_id: ${spec.group_id}`)
  })

  // 检查产品 dg100 的完整规格
  const { data: product } = await supabase
    .from('products')
    .select('id, model')
    .eq('slug', 'dg100')
    .maybeSingle()

  if (product) {
    const { data: productSpecs } = await supabase
      .from('product_specs')
      .select('id, label, group_id')
      .eq('product_id', product.id)

    console.log(`\n产品 dg100 的规格 (共 ${productSpecs?.length || 0} 条):`)
    productSpecs?.forEach((spec, i) => {
      const labelEn = (spec.label as any)?.en || spec.label
      console.log(`  ${i + 1}. ${labelEn} - group_id: ${spec.group_id}`)
    })
  }
}

checkGroupId()
