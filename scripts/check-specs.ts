// 检查产品规格数据格式
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

async function checkSpecs() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('=== 检查产品规格数据格式 ===\n')

  const { data: specs, error } = await supabase
    .from('product_specs')
    .select('*')
    .limit(5)

  if (error) {
    console.log('查询失败:', error)
    return
  }

  console.log('规格数据示例:')
  specs?.forEach((spec, i) => {
    console.log(`\n${i + 1}. 规格 ID: ${spec.id}`)
    console.log('   label:', JSON.stringify(spec.label, null, 2))
    console.log('   value:', JSON.stringify(spec.value, null, 2))
    console.log('   unit:', JSON.stringify(spec.unit, null, 2))
  })

  // 检查 spec_groups
  const { data: products } = await supabase
    .from('products')
    .select('id, model, spec_groups')
    .eq('slug', 'dg100')
    .maybeSingle()

  if (products) {
    console.log('\n\n产品 dg100 的 spec_groups:')
    console.log(JSON.stringify(products.spec_groups, null, 2))
  }
}

checkSpecs()
