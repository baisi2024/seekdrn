#!/usr/bin/env node

/**
 * 架构规则检测脚本
 * 检测客户端组件是否违规使用 supabaseAdmin
 */

const fs = require('fs')
const path = require('path')

const CLIENT_COMPONENTS_DIR = 'src'
const PATTERNS = {
  useClient: /^['"]use client['"]/,
  supabaseAdminImport: /import\s+.*supabaseAdmin.*from\s+['"]@\/lib\/supabase\/admin['"]/,
  apiImport: /import\s+.*from\s+['"]@\/features\/products\/api\/(tags|categories|products|media|documents|faqs|seo|relations)['"]/,
}

const violations = []
const warnings = []

function checkFile(filePath, content) {
  const lines = content.split('\n')
  const relativePath = path.relative(process.cwd(), filePath)

  // 检查是否是客户端组件
  const hasUseClient = lines.some(line => PATTERNS.useClient.test(line.trim()))

  if (!hasUseClient) return

  // 检查是否导入了 supabaseAdmin
  const hasSupabaseAdminImport = lines.some(line => PATTERNS.supabaseAdminImport.test(line))

  if (hasSupabaseAdminImport) {
    violations.push({
      file: relativePath,
      type: 'P0',
      message: '客户端组件直接导入 supabaseAdmin',
      severity: 'CRITICAL',
    })
  }

  // 检查是否导入了使用 supabaseAdmin 的 API 函数
  lines.forEach((line, index) => {
    const match = line.match(PATTERNS.apiImport)
    if (match) {
      warnings.push({
        file: relativePath,
        line: index + 1,
        type: 'P1',
        message: `客户端组件导入使用 supabaseAdmin 的 API: ${match[1]}`,
        severity: 'HIGH',
      })
    }
  })
}

function walkDir(dir) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      walkDir(filePath)
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf-8')
      checkFile(filePath, content)
    }
  })
}

console.log('🔍 检查客户端/服务端架构规则...\n')

try {
  walkDir(path.join(process.cwd(), CLIENT_COMPONENTS_DIR))

  if (violations.length === 0 && warnings.length === 0) {
    console.log('✅ 未发现架构违规问题\n')
    process.exit(0)
  }

  if (violations.length > 0) {
    console.log('🔴 严重违规 (P0 - 必须立即修复):\n')
    violations.forEach(v => {
      console.log(`  ${v.file}`)
      console.log(`    问题: ${v.message}`)
      console.log(`    严重程度: ${v.severity}\n`)
    })
  }

  if (warnings.length > 0) {
    console.log('🟠 警告 (P1 - 高优先级):\n')
    warnings.forEach(w => {
      console.log(`  ${w.file}:${w.line}`)
      console.log(`    问题: ${w.message}`)
      console.log(`    严重程度: ${w.severity}\n`)
    })
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📖 修复指南:')
  console.log('')
  console.log('方案 A: 创建 API Route')
  console.log('  1. 在 src/app/api/admin/ 下创建 route.ts')
  console.log('  2. 在 API Route 中使用 supabaseAdmin')
  console.log('  3. 客户端组件使用 fetch 调用 API')
  console.log('')
  console.log('方案 B: 使用客户端 Supabase')
  console.log('  import { createClient } from "@/lib/supabase/client"')
  console.log('  const supabase = createClient()')
  console.log('')
  console.log('方案 C: 改为服务端组件')
  console.log('  移除 "use client" 指令')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  process.exit(violations.length > 0 ? 1 : 0)
} catch (error) {
  console.error('❌ 检查失败:', error.message)
  process.exit(1)
}
