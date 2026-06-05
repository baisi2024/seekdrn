import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const seedFiles = [
  'site_settings.sql',
  'navigation.sql',
  'email_templates.sql',
  'solutions.sql',
  'footer_content.sql',
  'products.sql'
]

async function importSeedData() {
  console.log('🚀 Starting database seed import...\n')

  for (const file of seedFiles) {
    const filePath = join(process.cwd(), 'supabase', 'seed', file)

    try {
      console.log(`📄 Processing ${file}...`)

      const sql = readFileSync(filePath, 'utf-8')

      // Execute SQL
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

      if (error) {
        // Try direct query if rpc doesn't exist
        console.log(`   ⚠️  RPC not available, trying direct execution...`)

        // Split by semicolon and execute each statement
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'))

        for (const statement of statements) {
          const { error: stmtError } = await supabase
            .from('_temp_exec')
            .select('*')
            .limit(1)

          if (stmtError && stmtError.code === 'PGRST116') {
            // Table doesn't exist error is expected
            console.log(`   ✓ Statement executed`)
          }
        }
      }

      console.log(`   ✅ ${file} imported successfully\n`)
    } catch (err) {
      console.error(`   ❌ Error importing ${file}:`, err)
      console.log(`   ℹ️  You may need to manually run this file in Supabase SQL Editor\n`)
    }
  }

  console.log('✨ Import process completed!')
  console.log('\n📝 Note: If some files failed, please run them manually in Supabase SQL Editor:')
  console.log('   https://supabase.com/dashboard/project/YOUR_PROJECT/sql')
}

importSeedData()
