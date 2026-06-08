/**
 * 执行数据库种子数据脚本
 *
 * 用法: npx tsx scripts/seed-database.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') })
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\n请在 .env.local 文件中配置这些变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSqlFile(filePath: string) {
  console.log(`📄 执行: ${path.basename(filePath)}`)

  const sql = fs.readFileSync(filePath, 'utf-8')

  // 分割SQL语句（简单处理，按分号分割）
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('\\'))

  let successCount = 0
  let errorCount = 0

  for (const statement of statements) {
    try {
      // 使用 RPC 执行 SQL（需要数据库支持）
      const { error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error) {
        // 如果 RPC 不可用，尝试直接执行
        console.error(`   ⚠️  语句执行跳过: ${statement.substring(0, 50)}...`)
        errorCount++
      } else {
        successCount++
      }
    } catch (err) {
      console.error(`   ❌ 执行失败: ${statement.substring(0, 50)}...`)
      errorCount++
    }
  }

  console.log(`   ✅ 成功: ${successCount}, ❌ 失败: ${errorCount}`)
}

async function seedDatabase() {
  console.log('🚀 开始填充数据库...\n')

  const seedDir = path.join(__dirname, '../supabase/seed')

  try {
    // 1. 静态内容
    console.log('📦 步骤 1: 填充静态内容')
    await executeSqlFile(path.join(seedDir, 'mock_static_content.sql'))
    console.log()

    // 2. 产品数据
    console.log('📦 步骤 2: 填充产品数据')
    await executeSqlFile(path.join(seedDir, 'mock_products.sql'))
    console.log()

    // 3. 案例研究
    console.log('📦 步骤 3: 填充案例研究')
    await executeSqlFile(path.join(seedDir, 'mock_case_studies.sql'))
    console.log()

    // 验证数据
    console.log('📊 验证数据...')
    const { data: products } = await supabase.from('products').select('id')
    const { data: cases } = await supabase.from('case_studies').select('id')
    const { data: tags } = await supabase.from('product_tags').select('id')
    const { data: solutions } = await supabase.from('solutions').select('id')

    console.log(`   - 产品数量: ${products?.length || 0}`)
    console.log(`   - 案例研究数量: ${cases?.length || 0}`)
    console.log(`   - 标签数量: ${tags?.length || 0}`)
    console.log(`   - 解决方案数量: ${solutions?.length || 0}`)

    console.log('\n✅ 数据库填充完成!')
  } catch (error) {
    console.error('\n❌ 填充失败:', error)
    process.exit(1)
  }
}

// 由于 Supabase 不支持直接执行原始 SQL，我们需要使用 Supabase 客户端 API
async function seedWithClient() {
  console.log('🚀 开始填充数据库（使用 Supabase 客户端）...\n')

  try {
    // 1. 清空现有数据
    console.log('🗑️  清空现有数据...')

    await supabase.from('product_tag_relations').delete().neq('product_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('product_relations').delete().neq('product_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('product_specs').delete().neq('product_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('case_studies').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('product_tags').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('   ✅ 数据清空完成\n')

    // 2. 插入产品标签
    console.log('🏷️  插入产品标签...')

    const tags = [
      { slug: 'long-endurance', translations: { en: 'Long Endurance', zh: '长航时' } },
      { slug: 'reconnaissance', translations: { en: 'Reconnaissance', zh: '侦察' } },
      { slug: 'multi-role', translations: { en: 'Multi-Role', zh: '多用途' } },
      { slug: 'modular', translations: { en: 'Modular', zh: '模块化' } },
      { slug: 'heavy-lift', translations: { en: 'Heavy Lift', zh: '重载' } },
      { slug: 'logistics', translations: { en: 'Logistics', zh: '物流' } },
      { slug: 'eo-ir', translations: { en: 'EO/IR', zh: '光电/红外' } },
      { slug: 'high-resolution', translations: { en: 'High Resolution', zh: '高分辨率' } },
      { slug: 'multispectral', translations: { en: 'Multispectral', zh: '多光谱' } },
      { slug: 'lidar', translations: { en: 'LiDAR', zh: '激光雷达' } },
      { slug: 'mapping', translations: { en: 'Mapping', zh: '测绘' } },
      { slug: 'portable', translations: { en: 'Portable', zh: '便携' } },
      { slug: 'counter-uas', translations: { en: 'Counter-UAS', zh: '反无人机' } },
      { slug: 'vtol', translations: { en: 'VTOL', zh: '垂直起降' } },
      { slug: 'long-range', translations: { en: 'Long Range', zh: '长航程' } },
      { slug: 'all-weather', translations: { en: 'All-Weather', zh: '全天候' } },
      { slug: 'hae', translations: { en: 'HALE', zh: '高空长航时' } },
      { slug: 'swarm', translations: { en: 'Swarm', zh: '蜂群' } },
      { slug: 'maritime', translations: { en: 'Maritime', zh: '海事' } },
      { slug: 'integrated', translations: { en: 'Integrated', zh: '综合' } }
    ]

    const { error: tagsError } = await supabase.from('product_tags').insert(tags)
    if (tagsError) throw tagsError

    console.log(`   ✅ 插入 ${tags.length} 个标签\n`)

    // 3. 插入产品（示例：插入部分产品）
    console.log('📦 插入产品数据...')

    const products = [
      {
        model: 'SD-200',
        slug: 'sd-200',
        category: 'uav',
        specs: {
          'Weight': '8.5kg',
          'Maximum Endurance': '120min',
          'Maximum Speed': '15m/s',
          'Max Range': '50km'
        },
        translations: {
          en: {
            name: 'SD-200 Reconnaissance UAV',
            overview: 'The SD-200 is a long-endurance reconnaissance UAV designed for extended surveillance missions.',
            features: 'Long-endurance flight, Advanced EO/IR sensors, LiDAR mapping',
            applications: 'Border surveillance, Infrastructure monitoring'
          },
          zh: {
            name: 'SD-200 侦察无人机',
            overview: 'SD-200 是一款长航时侦察无人机，专为长时间监视任务设计。',
            features: '长航时飞行，先进光电/红外传感器，激光雷达测绘',
            applications: '边境监视，基础设施监测'
          }
        },
        featured: true,
        published: true,
        sort_order: 5
      },
      {
        model: 'SD-350',
        slug: 'sd-350',
        category: 'uav',
        specs: {
          'Weight': '15kg',
          'Maximum Endurance': '90min',
          'Maximum Speed': '20m/s',
          'Max Range': '35km'
        },
        translations: {
          en: {
            name: 'SD-350 Multi-Role UAV',
            overview: 'The SD-350 is a versatile multi-role UAV platform capable of performing various missions.',
            features: 'Modular payload system, Multiple sensor options',
            applications: 'Aerial surveying, Precision agriculture'
          },
          zh: {
            name: 'SD-350 多用途无人机',
            overview: 'SD-350 是一款多功能无人机平台，能够执行多种任务。',
            features: '模块化载荷系统，多种传感器选项',
            applications: '航空测绘，精准农业'
          }
        },
        featured: false,
        published: true,
        sort_order: 6
      },
      {
        model: 'SD-600',
        slug: 'sd-600',
        category: 'uav',
        specs: {
          'Weight': '18kg',
          'Maximum Endurance': '150min',
          'Maximum Speed': '25m/s',
          'Max Range': '80km'
        },
        translations: {
          en: {
            name: 'SD-600 VTOL UAV',
            overview: 'The SD-600 is a hybrid VTOL UAV combining vertical takeoff capability with fixed-wing efficiency.',
            features: 'VTOL capability, Extended range',
            applications: 'Long-range reconnaissance, Pipeline inspection'
          },
          zh: {
            name: 'SD-600 垂直起降无人机',
            overview: 'SD-600 是一款混合垂直起降无人机，结合垂直起飞能力与固定翼效率。',
            features: '垂直起降能力，长航程',
            applications: '远程侦察，管道巡检'
          }
        },
        featured: true,
        published: true,
        sort_order: 15
      },
      {
        model: 'PL-100',
        slug: 'pl-100',
        category: 'payload',
        specs: {
          'Weight': '2.5kg',
          'Resolution': '4K EO + 640×512 IR',
          'Zoom': '30x Optical'
        },
        translations: {
          en: {
            name: 'PL-100 EO/IR Payload',
            overview: 'The PL-100 is a high-performance electro-optical/infrared payload.',
            features: '4K EO camera, Thermal imaging, 30x optical zoom',
            applications: 'Target identification, Surveillance'
          },
          zh: {
            name: 'PL-100 光电/红外载荷',
            overview: 'PL-100 是一款高性能光电/红外载荷。',
            features: '4K光电相机，热成像，30倍光学变焦',
            applications: '目标识别，监视'
          }
        },
        featured: true,
        published: true,
        sort_order: 8
      },
      {
        model: 'CUAS-100',
        slug: 'cuas-100',
        category: 'cuas',
        specs: {
          'Weight': '8kg',
          'Detection Range': '5km',
          'Neutralization Range': '2km'
        },
        translations: {
          en: {
            name: 'CUAS-100 Portable Counter-UAS',
            overview: 'The CUAS-100 is a man-portable counter-UAS system.',
            features: 'Portable design, Rapid response',
            applications: 'Event security, VIP protection'
          },
          zh: {
            name: 'CUAS-100 便携反无人机系统',
            overview: 'CUAS-100 是一款便携式反无人机系统。',
            features: '便携设计，快速响应',
            applications: '活动安保，要员保护'
          }
        },
        featured: true,
        published: true,
        sort_order: 13
      }
    ]

    const { error: productsError } = await supabase.from('products').insert(products)
    if (productsError) throw productsError

    console.log(`   ✅ 插入 ${products.length} 个产品\n`)

    // 4. 插入案例研究（示例：插入部分案例）
    console.log('📖 插入案例研究数据...')

    const caseStudies = [
      {
        slug: 'border-surveillance-australia',
        industry: 'defense',
        country: 'Australia',
        translations: {
          en: {
            title: 'Border Surveillance Enhancement',
            client: 'Australian Border Force',
            summary: 'Deployed SD-200 and SD-600 UAV systems for 24/7 border monitoring.',
            challenge: 'Australia needed to monitor vast coastal borders with limited personnel.',
            solution: 'Implemented a network of SD-200 and SD-600 UAVs with GC-200 ground stations.',
            outcome: 'Achieved 95% coverage of priority border areas.'
          },
          zh: {
            title: '边境监视增强',
            client: '澳大利亚边境部队',
            summary: '部署SD-200和SD-600无人机系统进行24/7边境监视。',
            challenge: '澳大利亚需要以有限的人员监控广阔的海岸边界。',
            solution: '实施了SD-200和SD-600无人机网络，配备GC-200地面站。',
            outcome: '实现优先边境区域95%覆盖。'
          }
        },
        results: [
          { label: 'Coverage', value: '95%' },
          { label: 'Incident Reduction', value: '67%' }
        ],
        featured: true,
        published: true,
        sort_order: 1
      },
      {
        slug: 'pipeline-inspection-canada',
        industry: 'energy',
        country: 'Canada',
        translations: {
          en: {
            title: 'Pipeline Integrity Monitoring',
            client: 'Major Canadian Energy Company',
            summary: 'Automated inspection of 5,000km pipeline network.',
            challenge: 'Manual pipeline inspection was dangerous and time-consuming.',
            solution: 'Deployed SD-350 UAVs with PL-300 LiDAR for automated inspections.',
            outcome: 'Inspection costs reduced by 75%.'
          },
          zh: {
            title: '管道完整性监测',
            client: '加拿大主要能源公司',
            summary: '对5000公里管道网络进行自动巡检。',
            challenge: '人工管道巡检危险、耗时。',
            solution: '部署配备PL-300激光雷达的SD-350无人机进行自动巡检。',
            outcome: '巡检成本降低75%。'
          }
        },
        results: [
          { label: 'Cost Reduction', value: '75%' },
          { label: 'Coverage', value: '100%' }
        ],
        featured: true,
        published: true,
        sort_order: 2
      },
      {
        slug: 'precision-agriculture-brazil',
        industry: 'agriculture',
        country: 'Brazil',
        translations: {
          en: {
            title: 'Precision Agriculture Implementation',
            client: 'Large Brazilian Soybean Farm',
            summary: 'Integrated PL-200 multispectral imaging for crop health monitoring.',
            challenge: 'Traditional crop monitoring was inconsistent and reactive.',
            solution: 'Implemented weekly multispectral surveys using SD-350 UAVs.',
            outcome: 'Crop yield increased by 18%.'
          },
          zh: {
            title: '精准农业实施',
            client: '巴西大型大豆农场',
            summary: '整合PL-200多光谱成像进行作物健康监测。',
            challenge: '传统作物监测不一致且被动。',
            solution: '使用配备PL-200载荷的SD-350无人机进行每周多光谱调查。',
            outcome: '作物产量提高18%。'
          }
        },
        results: [
          { label: 'Yield Increase', value: '18%' },
          { label: 'Water Savings', value: '22%' }
        ],
        featured: false,
        published: true,
        sort_order: 3
      }
    ]

    const { error: casesError } = await supabase.from('case_studies').insert(caseStudies)
    if (casesError) throw casesError

    console.log(`   ✅ 插入 ${caseStudies.length} 条案例研究\n`)

    // 验证数据
    console.log('📊 验证数据...')
    const { data: allProducts } = await supabase.from('products').select('id, model')
    const { data: allCases } = await supabase.from('case_studies').select('id, slug')
    const { data: allTags } = await supabase.from('product_tags').select('id, slug')

    console.log(`   - 产品数量: ${allProducts?.length || 0}`)
    console.log(`   - 案例研究数量: ${allCases?.length || 0}`)
    console.log(`   - 标签数量: ${allTags?.length || 0}`)

    console.log('\n✅ 数据库填充完成!')
    console.log('\n💡 提示: 这只是示例数据。要填充完整数据，请使用 Supabase CLI:')
    console.log('   npx supabase db seed')

  } catch (error) {
    console.error('\n❌ 填充失败:', error)
    process.exit(1)
  }
}

// 执行填充
seedWithClient()
