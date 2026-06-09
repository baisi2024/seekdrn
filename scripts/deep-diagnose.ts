// 深度诊断：检查产品详情页404的所有可能原因
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

async function deepDiagnose() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('=== 深度诊断：产品详情页404 ===\n')

  // 1. 检查产品 dg100 的完整数据
  console.log('1. 检查产品 dg100 的完整数据:')
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', 'dg100')
    .maybeSingle()

  if (error) {
    console.log('  ❌ 查询失败:', error)
    return
  }

  if (!product) {
    console.log('  ❌ 未找到产品')
    return
  }

  console.log('  ✅ 找到产品:')
  console.log('    id:', product.id)
  console.log('    model:', product.model)
  console.log('    slug:', product.slug)
  console.log('    published:', product.published, `(${typeof product.published})`)
  console.log('    category:', product.category)
  console.log('    category_id:', product.category_id)
  console.log('    translations:', JSON.stringify(product.translations, null, 2).substring(0, 200) + '...')

  // 2. 检查产品规格
  console.log('\n2. 检查产品规格:')
  const { data: specs, error: specsError } = await supabase
    .from('product_specs')
    .select('*')
    .eq('product_id', product.id)

  if (specsError) {
    console.log('  ❌ 查询规格失败:', specsError)
  } else {
    console.log(`  ✅ 找到 ${specs?.length || 0} 条规格`)
  }

  // 3. 模拟页面查询
  console.log('\n3. 模拟页面查询 (getProductWithEnhancements):')
  const { data: pageProduct, error: pageError } = await supabase
    .from('products')
    .select(`
      *,
      product_specs(*),
      product_downloads(*),
      tag_objects:product_tags!product_tag_relations(id, slug, translations, color)
    `)
    .eq('slug', 'dg100')
    .eq('published', true)
    .maybeSingle()

  if (pageError) {
    console.log('  ❌ 查询失败:', pageError)
    console.log('  错误代码:', pageError.code)
    console.log('  错误详情:', pageError.details)
    console.log('  错误消息:', pageError.message)
  } else if (!pageProduct) {
    console.log('  ❌ 查询返回 null')
    console.log('  可能原因：')
    console.log('    - slug 不匹配')
    console.log('    - published 不是 true')
    console.log('    - 关联查询失败')
  } else {
    console.log('  ✅ 查询成功:')
    console.log('    id:', pageProduct.id)
    console.log('    model:', pageProduct.model)
    console.log('    slug:', pageProduct.slug)
    console.log('    published:', pageProduct.published)
    console.log('    specs:', pageProduct.product_specs?.length || 0, '条')
    console.log('    downloads:', pageProduct.product_downloads?.length || 0, '条')
    console.log('    tags:', pageProduct.tag_objects?.length || 0, '条')
  }

  // 4. 检查所有产品的 slug
  console.log('\n4. 检查所有产品的 slug (前10个):')
  const { data: allProducts } = await supabase
    .from('products')
    .select('model, slug, published')
    .order('created_at', { ascending: false })
    .limit(10)

  allProducts?.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.model.padEnd(30)} → ${p.slug.padEnd(40)} (published: ${p.published})`)
  })
}

deepDiagnose()
