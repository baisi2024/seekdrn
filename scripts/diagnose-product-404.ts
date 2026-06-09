// 诊断脚本：验证产品详情页404问题
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// 手动加载 .env.local
config({ path: '.env.local' })

async function diagnose() {
  console.log('=== 产品详情页404诊断 ===\n')

  // 1. 检查环境变量
  console.log('1. 检查环境变量:')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 已设置' : '❌ 未设置')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✅ 已设置 (${supabaseAnonKey.substring(0, 20)}...)` : '❌ 未设置')
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? `✅ 已设置 (${supabaseServiceKey.substring(0, 20)}...)` : '❌ 未设置')

  // 检查 key 格式
  const isAnonKeyJWT = supabaseAnonKey?.startsWith('eyJ')
  const isServiceKeyJWT = supabaseServiceKey?.startsWith('eyJ')
  console.log('  ANON_KEY 格式:', isAnonKeyJWT ? '✅ JWT格式' : '❌ 非JWT格式（可能是占位符）')
  console.log('  SERVICE_KEY 格式:', isServiceKeyJWT ? '✅ JWT格式' : '❌ 非JWT格式（可能是占位符）')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('\n❌ 环境变量缺失，无法继续诊断')
    return
  }

  // 2. 测试数据库连接
  console.log('\n2. 测试数据库连接:')
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 测试基本连接
    const { data: testConnection, error: connectionError } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true })

    if (connectionError) {
      console.log('  ❌ 数据库连接失败:', connectionError.message)
      console.log('  错误详情:', connectionError)
      return
    }

    console.log('  ✅ 数据库连接成功')

    // 3. 查询产品数据
    console.log('\n3. 查询产品数据:')
    const { data: products, error: queryError } = await supabase
      .from('products')
      .select('id, model, slug, published')
      .limit(10)

    if (queryError) {
      console.log('  ❌ 查询失败:', queryError.message)
      return
    }

    console.log(`  ✅ 查询成功，找到 ${products?.length || 0} 个产品`)
    console.log('\n  产品列表:')
    products?.forEach((p, i) => {
      console.log(`  ${i + 1}. model: ${p.model}, slug: ${p.slug}, published: ${p.published}`)
    })

    // 4. 测试特定产品查询
    console.log('\n4. 测试特定产品查询 (slug=dg100):')
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', 'dg100')
      .maybeSingle()

    if (productError) {
      console.log('  ❌ 查询失败:', productError.message)
      return
    }

    if (!product) {
      console.log('  ❌ 未找到产品 (slug=dg100)')
      console.log('  可能原因：')
      console.log('    - 产品不存在')
      console.log('    - slug 不匹配')
      console.log('    - published 不是 true')
    } else {
      console.log('  ✅ 找到产品:')
      console.log('    id:', product.id)
      console.log('    model:', product.model)
      console.log('    slug:', product.slug)
      console.log('    published:', product.published)
    }

    // 5. 检查 published 字段
    console.log('\n5. 检查 published 字段:')
    const { data: publishedProducts, error: publishedError } = await supabase
      .from('products')
      .select('id, model, slug, published')
      .eq('slug', 'dg100')

    if (publishedError) {
      console.log('  ❌ 查询失败:', publishedError.message)
      return
    }

    if (publishedProducts && publishedProducts.length > 0) {
      const p = publishedProducts[0]
      console.log(`  产品 dg100 的 published 值: ${p.published} (${typeof p.published})`)
      if (p.published !== true) {
        console.log('  ⚠️  产品未发布，这会导致404')
      }
    }

  } catch (error) {
    console.log('  ❌ 异常:', error)
  }
}

diagnose()
