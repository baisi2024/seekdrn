// src/app/api/admin/compliance/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { POLICIES } from '@/lib/compliance/constants'

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
      .in('section', POLICIES.map(p => p.slug))

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // 合并政策配置和数据库数据
    const policies = POLICIES.map(policyConfig => {
      const dbData = policiesData?.find(p => p.section === policyConfig.slug)

      return {
        id: dbData?.id || '',
        slug: policyConfig.slug,
        title: policyConfig.title,
        description: policyConfig.description,
        content: dbData?.translations || {},
        version: '1.0',
        effectiveDate: dbData?.created_at || new Date().toISOString(),
        lastUpdated: dbData?.updated_at || new Date().toISOString(),
        status: dbData?.published ? 'active' : 'draft',
        category: policyConfig.category,
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
