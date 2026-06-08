/**
 * 使用 Supabase Management API 执行种子数据
 *
 * 用法: npx tsx scripts/seed-via-api.ts
 */

import fs from 'fs'
import path from 'path'

// Supabase 项目信息
const projectRef = 'jbavapzrbjdsaprwswid'
const supabaseUrl = `https://${projectRef}.supabase.co`

// 从环境变量或配置文件获取访问令牌
// 你需要从 Supabase Dashboard 获取访问令牌
// https://supabase.com/dashboard/account/tokens
const accessToken = process.env.SUPABASE_ACCESS_TOKEN

if (!accessToken) {
  console.error('❌ 需要设置 SUPABASE_ACCESS_TOKEN 环境变量')
  console.error('   请从 https://supabase.com/dashboard/account/tokens 获取访问令牌')
  process.exit(1)
}

async function executeSql(sql: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': accessToken!
    },
    body: JSON.stringify({ sql })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SQL 执行失败: ${error}`)
  }

  return response.json()
}

async function seedDatabase() {
  console.log('🚀 开始填充数据库...\n')

  const seedDir = path.join(__dirname, '../supabase/seed')

  try {
    // 读取 SQL 文件
    const staticContentSql = fs.readFileSync(
      path.join(seedDir, 'mock_static_content.sql'),
      'utf-8'
    )

    const productsSql = fs.readFileSync(
      path.join(seedDir, 'mock_products.sql'),
      'utf-8'
    )

    const casesSql = fs.readFileSync(
      path.join(seedDir, 'mock_case_studies.sql'),
      'utf-8'
    )

    // 执行 SQL
    console.log('📄 执行静态内容 SQL...')
    await executeSql(staticContentSql)
    console.log('   ✅ 完成\n')

    console.log('📄 执行产品数据 SQL...')
    await executeSql(productsSql)
    console.log('   ✅ 完成\n')

    console.log('📄 执行案例研究 SQL...')
    await executeSql(casesSql)
    console.log('   ✅ 完成\n')

    console.log('✅ 数据库填充完成!')

  } catch (error) {
    console.error('\n❌ 填充失败:', error)
    process.exit(1)
  }
}

seedDatabase()
