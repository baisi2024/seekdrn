/**
 * 验证所有内容的多语言完整性
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const REQUIRED_LANGUAGES = ['en', 'zh', 'ar', 'es', 'fr', 'pt', 'id']

async function verifyContent() {
  console.log('\n📊 内容完整性验证报告\n')
  console.log('=' .repeat(60))

  // 1. 验证产品
  console.log('\n📦 产品验证\n')

  const { data: products } = await supabase
    .from('products')
    .select('model, slug, translations, published')
    .order('sort_order')

  let productComplete = 0
  let productPartial = 0

  products?.forEach(p => {
    const langs = Object.keys(p.translations || {})
    const missing = REQUIRED_LANGUAGES.filter(l => !langs.includes(l))

    if (missing.length === 0) {
      console.log(`  ✅ ${p.model.padEnd(12)} - 完整 (${langs.length} 种语言)`)
      productComplete++
    } else if (langs.length > 1) {
      console.log(`  ⚠️  ${p.model.padEnd(12)} - 部分 (${langs.length}/${REQUIRED_LANGUAGES.length}) 缺: ${missing.join(', ')}`)
      productPartial++
    } else {
      console.log(`  ❌ ${p.model.padEnd(12)} - 仅 ${langs.join(', ')}`)
      productPartial++
    }
  })

  console.log(`\n  统计: ${productComplete} 完整, ${productPartial} 部分`)

  // 2. 验证案例研究
  console.log('\n📖 案例研究验证\n')

  const { data: cases } = await supabase
    .from('case_studies')
    .select('slug, translations, published')
    .order('sort_order')

  let caseComplete = 0
  let casePartial = 0

  cases?.forEach(c => {
    const langs = Object.keys(c.translations || {})
    const missing = REQUIRED_LANGUAGES.filter(l => !langs.includes(l))

    if (missing.length === 0) {
      console.log(`  ✅ ${c.slug.padEnd(35)} - 完整 (${langs.length} 种语言)`)
      caseComplete++
    } else if (langs.length > 1) {
      console.log(`  ⚠️  ${c.slug.padEnd(35)} - 部分 (${langs.length}/${REQUIRED_LANGUAGES.length})`)
      casePartial++
    } else {
      console.log(`  ❌ ${c.slug.padEnd(35)} - 仅 ${langs.join(', ')}`)
      casePartial++
    }
  })

  console.log(`\n  统计: ${caseComplete} 完整, ${casePartial} 部分`)

  // 3. 验证合规内容
  console.log('\n📋 合规内容验证\n')

  const sections = ['export_compliance', 'privacy_policy', 'terms_of_use', 'cookie_policy']

  const { data: compliance } = await supabase
    .from('footer_content')
    .select('section, translations')
    .in('section', sections)

  compliance?.forEach(item => {
    const langs = Object.keys(item.translations || {})
    const missing = REQUIRED_LANGUAGES.filter(l => !langs.includes(l))

    if (missing.length === 0) {
      console.log(`  ✅ ${item.section.padEnd(20)} - 完整 (${langs.length} 种语言)`)
    } else {
      console.log(`  ⚠️  ${item.section.padEnd(20)} - 部分 (${langs.length}/${REQUIRED_LANGUAGES.length}) 缺: ${missing.join(', ')}`)
    }
  })

  // 4. 验证标签
  console.log('\n🏷️  标签验证\n')

  const { data: tags } = await supabase
    .from('product_tags')
    .select('slug, translations')

  let tagComplete = 0
  let tagPartial = 0

  tags?.forEach(t => {
    const langs = Object.keys(t.translations || {})
    const missing = REQUIRED_LANGUAGES.filter(l => !langs.includes(l))

    if (missing.length === 0) {
      tagComplete++
    } else if (langs.length > 1) {
      tagPartial++
    }
  })

  console.log(`  ✅ 完整翻译: ${tagComplete} 个`)
  console.log(`  ⚠️  部分翻译: ${tagPartial} 个`)

  // 5. 总结
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 总体统计\n')

  console.log(`  产品:`)
  console.log(`    - 总数: ${products?.length || 0}`)
  console.log(`    - 已发布: ${products?.filter(p => p.published).length || 0}`)
  console.log(`    - 多语言完整: ${productComplete}`)

  console.log(`\n  案例研究:`)
  console.log(`    - 总数: ${cases?.length || 0}`)
  console.log(`    - 已发布: ${cases?.filter(c => c.published).length || 0}`)
  console.log(`    - 多语言完整: ${caseComplete}`)

  console.log(`\n  合规内容: ${compliance?.length || 0} 条`)
  console.log(`  标签: ${tags?.length || 0} 个`)

  console.log('\n✅ 验证完成!\n')
}

verifyContent()
