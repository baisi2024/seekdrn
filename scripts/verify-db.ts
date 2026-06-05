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

async function verifyDatabase() {
  console.log('🔍 Verifying SeekDrone database setup...\n')

  const checks = [
    { table: 'site_settings', name: 'Site Settings' },
    { table: 'navigation', name: 'Navigation' },
    { table: 'email_templates', name: 'Email Templates' },
    { table: 'solutions', name: 'Solutions' },
    { table: 'footer_content', name: 'Footer Content' },
    { table: 'products', name: 'Products' },
    { table: 'case_studies', name: 'Case Studies' },
    { table: 'inquiries', name: 'Inquiries' },
    { table: 'media', name: 'Media' }
  ]

  let allPassed = true

  for (const { table, name } of checks) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (error) {
      console.log(`❌ ${name}: Table not found or inaccessible`)
      allPassed = false
    } else {
      const count = data ? data.length : 0
      const hasData = count > 0 ? '✓ has data' : '⚠ empty'
      console.log(`✅ ${name}: Table exists (${hasData})`)
    }
  }

  console.log('\n' + '━'.repeat(50))

  if (allPassed) {
    console.log('✨ Database setup verified successfully!\n')
    console.log('📝 Next steps:')
    console.log('   1. Create admin user in Supabase Dashboard')
    console.log('   2. Visit http://localhost:3000 to view the website')
    console.log('   3. Visit http://localhost:3000/admin/login to access admin panel\n')
  } else {
    console.log('⚠️  Database setup incomplete.\n')
    console.log('Please follow the setup guide:')
    console.log('   docs/DATABASE_SETUP.md\n')
  }

  return allPassed
}

verifyDatabase().catch(console.error)
