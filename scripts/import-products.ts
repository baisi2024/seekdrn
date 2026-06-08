// @ts-nocheck
/**
 * 多语言产品数据导入脚本
 *
 * 读取 docs/products_{lang}.json 文件，转换为数据库格式，批量插入 Supabase。
 *
 * 使用方式：
 *   npx tsx scripts/import-products.ts [--dry-run] [--clean]
 *
 * 选项：
 *   --dry-run  只输出转换结果，不实际写入数据库
 *   --clean    先删除已有产品数据再导入
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// 动态导入 pg（仅用于 DDL 操作）
let pgModule: typeof import('pg') | null = null

// ─── 配置 ─────────────────────────────────────────────

const LOCALES = ['en', 'zh', 'ar', 'es', 'fr', 'pt', 'id', 'th', 'vi', 'fa', 'ru'] as const
type Locale = (typeof LOCALES)[number]

const DOCS_DIR = path.resolve(__dirname, '../docs')
const SPEC_LABEL_DIR = path.resolve(__dirname, '../docs/spec-labels')

// JSON category → 数据库 category slug 映射
const CATEGORY_MAP: Record<string, string> = {
  'Drones': 'uav',
  'Quadruped Intelligent Robot System': 'quadruped-robot',
  'Unmanned Vehicle System': 'unmanned-vehicle',
}

// JSON 字段 → 数据库 translations 键名映射
const FIELD_MAP: Record<string, string> = {
  'description': 'overview',
  'advantages': 'advantages',
  'capabilities': 'capabilities',
  'applications': 'applications',
}

// ─── 类型 ─────────────────────────────────────────────

interface ProductJSON {
  name: string
  category: string
  slug: string
  url: string
  fullTitle: string
  description: string
  advantages: string
  capabilities: string
  applications: string
  specs: Record<string, string>
  specCount: number
  hasChinese: boolean
}

// ─── 工具函数 ─────────────────────────────────────────

function loadProducts(locale: Locale): ProductJSON[] {
  const filePath = path.join(DOCS_DIR, `products_${locale}.json`)
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ 文件不存在: ${filePath}`)
    return []
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/**
 * 将纯文本转为简单 HTML 段落
 * 数据库中 overview/advantages 等字段期望富文本格式
 */
function toRichText(text: string): string {
  if (!text) return ''
  // 如果已经是 HTML，直接返回
  if (text.includes('<p>') || text.includes('<br')) return text
  // 按换行分段
  const paragraphs = text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean)
  if (paragraphs.length <= 1) return `<p>${text}</p>`
  return paragraphs.map(p => `<p>${p}</p>`).join('')
}

/**
 * 匹配不同语言的 spec 键名
 * 策略：按位置索引匹配（所有语言文件的 spec 顺序一致）
 */
function buildSpecTranslations(
  allLocaleSpecs: Map<Locale, Record<string, string>>
): Array<{ label: Record<string, string>; value: Record<string, string>; sort_order: number }> {
  // 以英文版为基准确定 spec 数量和顺序
  const enSpecs = allLocaleSpecs.get('en')
  if (!enSpecs) return []

  const enKeys = Object.keys(enSpecs)
  const result: Array<{ label: Record<string, string>; value: Record<string, string>; sort_order: number }> = []

  for (let i = 0; i < enKeys.length; i++) {
    const enKey = enKeys[i]
    const label: Record<string, string> = {}
    const value: Record<string, string> = {}

    for (const locale of LOCALES) {
      const localeSpecs = allLocaleSpecs.get(locale)
      if (!localeSpecs) continue

      const keys = Object.keys(localeSpecs)
      if (i < keys.length) {
        const localKey = keys[i]
        label[locale] = localKey
        value[locale] = localeSpecs[localKey]
      }
    }

    result.push({ label, value, sort_order: i })
  }

  return result
}

// ─── 主流程 ───────────────────────────────────────────

async function main() {
  // 动态导入 pg
  try { pgModule = await import('pg') } catch { /* pg not available */ }

  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const clean = args.includes('--clean')

  console.log('=== 多语言产品数据导入 ===')
  console.log(`模式: ${dryRun ? 'DRY RUN (不写入数据库)' : 'LIVE'}`)
  console.log(`清理: ${clean ? '是' : '否'}`)
  console.log()

  // ── 1. 加载所有语言的产品数据 ──
  console.log('1. 加载产品数据...')
  const allProducts = new Map<Locale, ProductJSON[]>()
  for (const locale of LOCALES) {
    const products = loadProducts(locale)
    allProducts.set(locale, products)
    console.log(`  ${locale}: ${products.length} 个产品`)
  }

  // 以英文版为基准确定产品列表
  const enProducts = allProducts.get('en')!
  if (enProducts.length === 0) {
    console.error('❌ 英文产品数据为空，无法继续')
    process.exit(1)
  }

  // ── 2. 连接数据库 ──
  let supabase: ReturnType<typeof createClient> | null = null
  if (!dryRun) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ 缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY')
      process.exit(1)
    }
    supabase = createClient(supabaseUrl, supabaseKey)
    console.log('  ✅ 数据库连接成功')
  }

  // ── 2.5 执行分类迁移（如果需要）──
  if (supabase && !dryRun) {
    console.log('\n2.5 检查并执行分类迁移...')
    const migrationSQL = fs.readFileSync(
      path.resolve(__dirname, '../supabase/migrations/016_product_category_extensions.sql'),
      'utf8'
    )
    // 使用 RPC 执行 SQL（需要 Supabase service role）
    // 由于 Supabase JS 客户端不支持直接执行 DDL，我们改用分步操作

    // 检查新分类是否已存在
    const { data: existingCats } = await supabase
      .from('product_categories')
      .select('slug')

    const existingSlugs = new Set((existingCats || []).map(c => c.slug))

    // 插入新分类
    if (!existingSlugs.has('quadruped-robot')) {
      const { error } = await supabase.from('product_categories').insert([{
        slug: 'quadruped-robot',
        translations: {
          en: { name: 'Quadruped Robot' },
          zh: { name: '四足机器人' },
          ar: { name: 'روبوت رباعي الأرجل' },
          es: { name: 'Robot Cuadrúpedo' },
          fr: { name: 'Robot Quadrupède' },
          pt: { name: 'Robô Quadrúpede' },
          id: { name: 'Robot Berkaki Empat' },
          th: { name: 'หุ่นยนต์สี่ขา' },
          vi: { name: 'Robot Bốn Chân' },
          fa: { name: 'ربات چهارپا' },
          ru: { name: 'Четвероногий робот' },
        },
        sort_order: 5,
      }])
      if (error) console.warn('  ⚠ 插入 quadruped-robot 失败:', error.message)
      else console.log('  ✅ 插入分类 quadruped-robot')
    } else {
      console.log('  ℹ 分类 quadruped-robot 已存在')
    }

    if (!existingSlugs.has('unmanned-vehicle')) {
      const { error } = await supabase.from('product_categories').insert([{
        slug: 'unmanned-vehicle',
        translations: {
          en: { name: 'Unmanned Vehicle' },
          zh: { name: '无人车辆' },
          ar: { name: 'مركبة غير مأهولة' },
          es: { name: 'Vehículo No Tripulado' },
          fr: { name: 'Véhicule Non Habité' },
          pt: { name: 'Veículo Não Tripulado' },
          id: { name: 'Kendaraan Tanpa Awak' },
          th: { name: 'ยานพาหนะไร้คนขับ' },
          vi: { name: 'Phương tiện Không người lái' },
          fa: { name: 'خودرو بدون سرنشین' },
          ru: { name: 'Беспилотный транспорт' },
        },
        sort_order: 6,
      }])
      if (error) console.warn('  ⚠ 插入 unmanned-vehicle 失败:', error.message)
      else console.log('  ✅ 插入分类 unmanned-vehicle')
    } else {
      console.log('  ℹ 分类 unmanned-vehicle 已存在')
    }

    // 更新已有分类的翻译
    // 先扩展 products.category 的 CHECK 约束
    // 使用 Supabase SQL API 执行 DDL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const projectRef = supabaseUrl.match(/\/\/([a-z]+)\.supabase/)?.[1]

    if (projectRef) {
      // 使用 Supabase Management API 的 SQL 执行端点
      try {
        const resp = await fetch(`https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
                    ALTER TABLE products ADD CONSTRAINT products_category_check
                      CHECK (category IN ('uav', 'payload', 'cuas', 'ground_control', 'quadruped-robot', 'unmanned-vehicle'));`
          })
        })

        if (resp.ok) {
          console.log('  ✅ 扩展 products.category CHECK 约束')
        } else {
          const text = await resp.text()
          // RPC 方式不行，尝试 pg 直连
          console.warn('  ⚠ RPC 方式失败:', text.slice(0, 100))
          await tryDDLWithPg()
        }
      } catch {
        await tryDDLWithPg()
      }
    } else {
      await tryDDLWithPg()
    }

    async function tryDDLWithPg() {
      const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
      if (databaseUrl && pgModule) {
        const pool = new pgModule.Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
        try {
          await pool.query(`
            ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
            ALTER TABLE products ADD CONSTRAINT products_category_check
              CHECK (category IN ('uav', 'payload', 'cuas', 'ground_control', 'quadruped-robot', 'unmanned-vehicle'));
          `)
          console.log('  ✅ 扩展 products.category CHECK 约束 (via pg)')
        } catch (e: any) {
          console.warn('  ⚠ DDL 执行失败:', e.message)
          console.warn('  ⚠ 请在 Supabase Dashboard SQL Editor 中手动执行 017_extend_category_check.sql')
        } finally {
          await pool.end()
        }
      } else {
        console.warn('  ⚠ 无法自动执行 DDL')
        console.warn('  ⚠ 请在 Supabase Dashboard SQL Editor 中手动执行:')
        console.warn('    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;')
        console.warn('    ALTER TABLE products ADD CONSTRAINT products_category_check')
        console.warn('      CHECK (category IN (\'uav\', \'payload\', \'cuas\', \'ground_control\', \'quadruped-robot\', \'unmanned-vehicle\'));')
      }
    }

    const catUpdates: Array<[string, Record<string, { name: string }>]> = [
      ['uav', {
        en: { name: 'UAV' }, zh: { name: '无人机' }, ar: { name: 'طائرة بدون طيار' },
        es: { name: 'VANT' }, fr: { name: 'UAV' }, pt: { name: 'VANT' },
        id: { name: 'UAV' }, th: { name: 'อากาศยานไร้คนขับ' }, vi: { name: 'UAV' },
        fa: { name: 'پهپاد' }, ru: { name: 'БПЛА' },
      }],
      ['payload', {
        en: { name: 'Payload' }, zh: { name: '载荷' }, ar: { name: 'الحمولة' },
        es: { name: 'Carga Útil' }, fr: { name: 'Charge Utile' }, pt: { name: 'Carga Útil' },
        id: { name: 'Muatan' }, th: { name: 'น้ำหนักบรรทุก' }, vi: { name: 'Khối lượng hữu ích' },
        fa: { name: 'بار مفید' }, ru: { name: 'Полезная нагрузка' },
      }],
      ['cuas', {
        en: { name: 'C-UAS' }, zh: { name: '反无人机' }, ar: { name: 'مضاد للطائرات بدون طيار' },
        es: { name: 'Contra-Drones' }, fr: { name: 'Anti-Drones' }, pt: { name: 'Anti-Drones' },
        id: { name: 'Anti-Drone' }, th: { name: 'ต้านโดรน' }, vi: { name: 'Chống Drone' },
        fa: { name: 'ضد پهپاد' }, ru: { name: 'ПротивоБПЛА' },
      }],
      ['ground_control', {
        en: { name: 'Ground Control' }, zh: { name: '地面站' }, ar: { name: 'محطة التحكم الأرضية' },
        es: { name: 'Estación de Control Terrestre' }, fr: { name: 'Station de Contrôle au Sol' },
        pt: { name: 'Estação de Controle Terrestre' }, id: { name: 'Stasiun Kontrol Darat' },
        th: { name: 'สถานีควบคุมภาคพื้นดิน' }, vi: { name: 'Trạm Điều khiển Mặt đất' },
        fa: { name: 'ایستگاه کنترل زمینی' }, ru: { name: 'Наземная станция управления' },
      }],
    ]

    for (const [slug, translations] of catUpdates) {
      const { error } = await supabase
        .from('product_categories')
        .update({ translations })
        .eq('slug', slug)
      if (error) console.warn(`  ⚠ 更新分类 ${slug} 翻译失败:`, error.message)
      else console.log(`  ✅ 更新分类 ${slug} 翻译`)
    }
  }

  // ── 3. 获取分类 ID 映射 ──
  console.log('\n2. 获取分类映射...')
  const categoryMap = new Map<string, string>() // slug → id
  if (supabase) {
    const { data: categories, error } = await supabase
      .from('product_categories')
      .select('id, slug')
    if (error) {
      console.error('❌ 获取分类失败:', error.message)
      process.exit(1)
    }
    for (const cat of categories || []) {
      categoryMap.set(cat.slug, cat.id)
      console.log(`  ${cat.slug} → ${cat.id}`)
    }
  }

  // ── 4. 清理已有数据（可选）──
  if (clean && supabase) {
    console.log('\n3. 清理已有产品数据...')
    // 先删 specs（外键依赖）
    const { error: specErr } = await supabase.from('product_specs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (specErr) console.warn('  ⚠ 清理 specs 失败:', specErr.message)
    else console.log('  ✅ 已清理 product_specs')

    const { error: prodErr } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (prodErr) console.warn('  ⚠ 清理 products 失败:', prodErr.message)
    else console.log('  ✅ 已清理 products')
  }

  // ── 5. 转换并导入产品 ──
  console.log(`\n${clean ? '4' : '3'}. 转换并导入产品...`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < enProducts.length; i++) {
    const enProduct = enProducts[i]
    const categorySlug = CATEGORY_MAP[enProduct.category] || 'uav'
    const categoryId = categoryMap.get(categorySlug) || null

    // ── 构建 translations ──
    const translations: Record<string, Record<string, string>> = {}
    for (const locale of LOCALES) {
      const localeProducts = allProducts.get(locale)
      if (!localeProducts || i >= localeProducts.length) continue

      const p = localeProducts[i]
      translations[locale] = {
        name: p.name,
        overview: toRichText(p.description),
        advantages: toRichText(p.advantages),
        capabilities: toRichText(p.capabilities),
        applications: toRichText(p.applications),
      }
    }

    // ── 构建 specs ──
    const allLocaleSpecs = new Map<Locale, Record<string, string>>()
    for (const locale of LOCALES) {
      const localeProducts = allProducts.get(locale)
      if (!localeProducts || i >= localeProducts.length) continue
      allLocaleSpecs.set(locale, localeProducts[i].specs || {})
    }
    const specRecords = buildSpecTranslations(allLocaleSpecs)

    // ── 构建 product 记录 ──
    const productRecord = {
      model: enProduct.name,
      slug: enProduct.slug,
      category: categorySlug,
      category_id: categoryId,
      translations,
      images: [] as string[],
      videos: [] as string[],
      published: true,
      featured: false,
      compliance_flag: true,
      sort_order: i,
      spec_groups: [{
        id: 'default',
        label: { en: 'Specifications', zh: '技术参数' },
        sort_order: 0,
      }],
    }

    if (dryRun) {
      console.log(`\n  [DRY RUN] 产品 ${i + 1}/${enProducts.length}: ${enProduct.name}`)
      console.log(`    category: ${categorySlug} (${categoryId})`)
      console.log(`    translations locales: ${Object.keys(translations).join(', ')}`)
      console.log(`    specs count: ${specRecords.length}`)
      if (i === 0) {
        console.log(`    translations.en.overview (前100字): ${translations.en?.overview?.slice(0, 100)}`)
        console.log(`    translations.zh.overview (前100字): ${translations.zh?.overview?.slice(0, 100)}`)
        console.log(`    spec[0]: ${JSON.stringify(specRecords[0])}`)
      }
      successCount++
      continue
    }

    // ── 实际写入数据库 ──
    if (!supabase) continue

    // 检查产品是否已存在
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', enProduct.slug)
      .maybeSingle()

    let productId: string

    if (existing) {
      // 更新已有产品
      const { data: updated, error } = await supabase
        .from('products')
        .update({
          translations,
          category: categorySlug,
          category_id: categoryId,
          compliance_flag: true,
          sort_order: i,
        })
        .eq('id', existing.id)
        .select('id')
        .single()

      if (error) {
        console.error(`  ❌ 更新产品 ${enProduct.name} 失败:`, error.message)
        errorCount++
        continue
      }
      productId = updated.id
      console.log(`  🔄 更新产品 ${enProduct.name} (${productId})`)
    } else {
      // 插入新产品
      const { data: inserted, error } = await supabase
        .from('products')
        .insert([productRecord])
        .select('id')
        .single()

      if (error) {
        console.error(`  ❌ 插入产品 ${enProduct.name} 失败:`, error.message)
        errorCount++
        continue
      }
      productId = inserted.id
      console.log(`  ✅ 插入产品 ${enProduct.name} (${productId})`)
    }

    // ── 写入 specs ──
    // 先删除旧 specs
    await supabase.from('product_specs').delete().eq('product_id', productId)

    if (specRecords.length > 0) {
      const specInserts = specRecords.map(spec => ({
        product_id: productId,
        label: spec.label,
        value: spec.value,
        group_id: 'default',
        sort_order: spec.sort_order,
      }))

      const { error: specError } = await supabase
        .from('product_specs')
        .insert(specInserts)

      if (specError) {
        console.error(`    ⚠ 写入 specs 失败:`, specError.message)
      } else {
        console.log(`    ✅ ${specRecords.length} 条 specs 已写入`)
      }
    }

    successCount++
  }

  // ── 6. 汇总 ──
  console.log('\n=== 导入完成 ===')
  console.log(`成功: ${successCount}/${enProducts.length}`)
  if (errorCount > 0) console.log(`失败: ${errorCount}`)
}

main().catch(err => {
  console.error('导入脚本异常:', err)
  process.exit(1)
})
