import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function showData() {
  console.log('📊 SeekDrone 数据库数据统计\n')
  console.log('━'.repeat(60) + '\n')

  // 1. Site Settings
  const { data: settings } = await supabase.from('site_settings').select('*').single()
  if (settings) {
    console.log('✅ site_settings (1 条记录)')
    console.log('   • 站点名称:', settings.site_name?.en || 'N/A')
    console.log('   • 联系邮箱:', settings.contact_email || 'N/A')
    console.log('   • 启用语言:', settings.enabled_languages?.join(', ') || 'N/A')
    console.log()
  }

  // 2. Navigation
  const { data: nav } = await supabase.from('navigation').select('*')
  if (nav && nav.length > 0) {
    console.log(`✅ navigation (${nav.length} 条记录)`)
    nav.forEach(item => {
      console.log(`   • [${item.position}] ${item.translations?.en || item.url}`)
    })
    console.log()
  }

  // 3. Email Templates
  const { data: templates } = await supabase.from('email_templates').select('*')
  if (templates && templates.length > 0) {
    console.log(`✅ email_templates (${templates.length} 条记录)`)
    templates.forEach(item => {
      console.log(`   • ${item.template_key}: ${item.description}`)
    })
    console.log()
  }

  // 4. Solutions
  const { data: solutions } = await supabase.from('solutions').select('*')
  if (solutions && solutions.length > 0) {
    console.log(`✅ solutions (${solutions.length} 条记录)`)
    solutions.forEach(item => {
      console.log(`   • ${item.slug}: ${item.translations?.en?.title || 'N/A'}`)
    })
    console.log()
  }

  // 5. Footer Content
  const { data: footer } = await supabase.from('footer_content').select('*')
  if (footer && footer.length > 0) {
    console.log(`✅ footer_content (${footer.length} 条记录)`)
    footer.forEach(item => {
      console.log(`   • [${item.section}] ${item.translations?.en?.title || 'N/A'}`)
    })
    console.log()
  }

  // 6. Products
  const { data: products } = await supabase.from('products').select('*')
  if (products && products.length > 0) {
    console.log(`✅ products (${products.length} 条记录)`)
    products.forEach(item => {
      console.log(`   • ${item.model}: ${item.translations?.en?.name || 'N/A'}`)
      console.log(`     分类: ${item.category} | 特色: ${item.featured ? '是' : '否'} | 已发布: ${item.published ? '是' : '否'}`)
    })
    console.log()
  }

  // 7. Case Studies
  const { data: cases } = await supabase.from('case_studies').select('*')
  console.log(`⚠️  case_studies (${cases?.length || 0} 条记录) - 待导入\n`)

  // 8. Inquiries
  const { data: inquiries } = await supabase.from('inquiries').select('*')
  console.log(`⚠️  inquiries (${inquiries?.length || 0} 条记录) - 用户提交后会有数据\n`)

  // 9. Media
  const { data: media } = await supabase.from('media').select('*')
  console.log(`⚠️  media (${media?.length || 0} 条记录) - 上传文件后会有数据\n`)

  // Summary
  console.log('━'.repeat(60))
  console.log('\n📈 数据统计总结:\n')

  const totalRecords =
    (settings ? 1 : 0) +
    (nav?.length || 0) +
    (templates?.length || 0) +
    (solutions?.length || 0) +
    (footer?.length || 0) +
    (products?.length || 0)

  console.log(`   总记录数: ${totalRecords} 条`)
  console.log(`   已填充表: 6 个`)
  console.log(`   空表: 3 个 (case_studies, inquiries, media)\n`)

  console.log('━'.repeat(60))
  console.log('\n💡 提示:\n')
  console.log('   • case_studies - 可在管理后台添加案例研究')
  console.log('   • inquiries - 用户提交咨询表单后自动填充')
  console.log('   • media - 上传媒体文件后自动填充\n')
}

showData().catch(console.error)
