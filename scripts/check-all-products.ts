// 检查数据库中所有产品的 slug
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

async function checkAllProducts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: products, error } = await supabase
    .from('products')
    .select('id, model, slug, published')
    .order('slug')

  if (error) {
    console.log('查询失败:', error)
    return
  }

  console.log(`数据库中共有 ${products?.length} 个产品:\n`)
  products?.forEach((p, i) => {
    console.log(`${i + 1}. model: ${p.model.padEnd(30)} slug: ${p.slug.padEnd(30)} published: ${p.published}`)
  })
}

checkAllProducts()
