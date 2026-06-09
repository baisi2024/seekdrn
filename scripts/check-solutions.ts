// 检查解决方案数据
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

async function checkSolutions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('=== 检查解决方案数据 ===\n')

  const { data: solutions, error } = await supabase
    .from('solutions')
    .select('id, slug, published')
    .order('slug')

  if (error) {
    console.log('查询失败:', error)
    return
  }

  console.log(`数据库中共有 ${solutions?.length} 个解决方案:\n`)
  solutions?.forEach((s, i) => {
    console.log(`${i + 1}. slug: ${s.slug.padEnd(30)} published: ${s.published}`)
  })
}

checkSolutions()
