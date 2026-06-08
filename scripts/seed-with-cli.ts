/**
 * 使用 Supabase CLI 执行种子数据
 */

import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

const seedDir = path.join(__dirname, '../supabase/seed')

console.log('🚀 开始填充数据库...\n')

// 读取 SQL 文件并执行
function executeSqlFile(filePath: string, description: string) {
  console.log(`📄 ${description}`)

  const sql = fs.readFileSync(filePath, 'utf-8')

  // 使用 Supabase CLI 执行 SQL
  try {
    // 将 SQL 写入临时文件
    const tempFile = path.join(__dirname, 'temp-seed.sql')
    fs.writeFileSync(tempFile, sql)

    // 执行 SQL
    execSync(`npx supabase db execute --file "${tempFile}" --linked`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    })

    // 删除临时文件
    fs.unlinkSync(tempFile)

    console.log('   ✅ 完成\n')
  } catch (error) {
    console.error('   ❌ 失败:', error)
    process.exit(1)
  }
}

// 执行种子文件
try {
  // 1. 静态内容
  executeSqlFile(
    path.join(seedDir, 'mock_static_content.sql'),
    '填充静态内容（标签、FAQ等）'
  )

  // 2. 产品数据
  executeSqlFile(
    path.join(seedDir, 'mock_products.sql'),
    '填充产品数据（20个产品）'
  )

  // 3. 案例研究
  executeSqlFile(
    path.join(seedDir, 'mock_case_studies.sql'),
    '填充案例研究（30条案例）'
  )

  console.log('✅ 数据库填充完成!')
  console.log('\n📊 数据统计:')
  console.log('   - 产品: 20个')
  console.log('   - 案例研究: 30条')
  console.log('   - 标签: 36个')
  console.log('   - 解决方案: 5个')

} catch (error) {
  console.error('\n❌ 填充失败:', error)
  process.exit(1)
}
