/**
 * 验证数据库数据
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verify() {
  console.log('\n📊 数据库验证报告:\n')

  // 获取产品
  const { data: products } = await supabase
    .from('products')
    .select('model, category, featured, published')
    .order('sort_order')

  console.log('产品列表:')
  products?.forEach(p => {
    const featured = p.featured ? '⭐' : '  '
    const published = p.published ? '✅' : '❌'
    console.log(`  ${featured} ${p.model.padEnd(12)} (${p.category.padEnd(15)}) ${published}`)
  })

  // 获取案例研究
  const { data: cases } = await supabase
    .from('case_studies')
    .select('slug, industry, featured, published')
    .order('sort_order')

  console.log('\n案例研究:')
  cases?.forEach(c => {
    const featured = c.featured ? '⭐' : '  '
    const published = c.published ? '✅' : '❌'
    console.log(`  ${featured} ${c.slug.padEnd(35)} (${c.industry.padEnd(12)}) ${published}`)
  })

  // 获取标签
  const { data: tags } = await supabase
    .from('product_tags')
    .select('slug')

  console.log(`\n标签数量: ${tags?.length || 0}`)

  // 统计
  console.log('\n📈 数据统计:')
  console.log(`   - 产品总数: ${products?.length || 0}`)
  console.log(`   - 特色产品: ${products?.filter(p => p.featured).length || 0}`)
  console.log(`   - 已发布产品: ${products?.filter(p => p.published).length || 0}`)
  console.log(`   - 案例研究总数: ${cases?.length || 0}`)
  console.log(`   - 特色案例: ${cases?.filter(c => c.featured).length || 0}`)
  console.log(`   - 已发布案例: ${cases?.filter(c => c.published).length || 0}`)

  console.log('\n✅ 验证完成!\n')
}

verify()
