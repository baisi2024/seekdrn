// src/app/api/admin/compliance/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { POLICIES } from '@/lib/compliance/constants'
import { PolicyItem } from '@/lib/compliance/types'

/**
 * GET /api/admin/compliance
 * 获取所有政策列表
 */
export async function GET() {
  try {
    // 从数据库查询所有政策数据
    const { data: policiesData, error } = await supabaseAdmin
      .from('footer_content')
      .select('*')
      .in('section', POLICIES.map(p => p.section))

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // 合并政策配置和数据库数据
    const policies: PolicyItem[] = POLICIES.map(policyConfig => {
      const dbData = policiesData?.find(p => p.section === policyConfig.section)

      return {
        id: dbData?.id || '',
        section: policyConfig.section,
        translations: dbData?.translations || {},
        published: dbData?.published ?? false,
        created_at: dbData?.created_at || new Date().toISOString(),
        updated_at: dbData?.updated_at
      }
    })

    return NextResponse.json({ policies })
  } catch (error) {
    console.error('Error fetching policies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    )
  }
}
