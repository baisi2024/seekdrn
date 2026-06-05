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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')

async function executeSql(sql: string, description: string) {
  console.log(`   📄 ${description}...`)

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql })
    })

    if (response.ok) {
      console.log('      ✅ Success')
      return true
    } else {
      const text = await response.text()
      console.log(`      ❌ Failed: ${response.status} ${response.statusText}`)
      return false
    }
  } catch (err: any) {
    console.log(`      ❌ Error: ${err.message}`)
    return false
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up SeekDrone database...\n')
  console.log(`📍 Project: ${projectRef}`)
  console.log(`🔗 URL: ${supabaseUrl}\n`)

  console.log('━'.repeat(50))
  console.log('STEP 1: Creating database schema\n')

  // Execute migration files
  const migrations = [
    { file: '001_initial_schema.sql', desc: 'Creating tables and indexes' },
    { file: '002_rls_policies.sql', desc: 'Enabling RLS policies' }
  ]

  for (const { file, desc } of migrations) {
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', file)
    const sql = readFileSync(sqlPath, 'utf-8')

    const success = await executeSql(sql, desc)
    if (!success) {
      console.log('\n⚠️  Migration failed. Please run manually in Supabase SQL Editor:')
      console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql\n`)
      return false
    }
  }

  console.log('\n━'.repeat(50))
  console.log('STEP 2: Importing seed data\n')

  // Execute seed files
  const seeds = [
    'site_settings.sql',
    'navigation.sql',
    'email_templates.sql',
    'solutions.sql',
    'footer_content.sql',
    'products.sql'
  ]

  for (const file of seeds) {
    const sqlPath = join(__dirname, '..', 'supabase', 'seed', file)
    const sql = readFileSync(sqlPath, 'utf-8')

    await executeSql(sql, file)
  }

  console.log('\n━'.repeat(50))
  console.log('✨ Setup completed!\n')
  console.log('📝 Next step: Create admin user')
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/auth/users\n`)
  console.log('   Email: admin@seekdrone.com')
  console.log('   Password: [Set a strong password]')
  console.log('   ✅ Auto Confirm User: Check\n')

  return true
}

setupDatabase().catch(console.error)
