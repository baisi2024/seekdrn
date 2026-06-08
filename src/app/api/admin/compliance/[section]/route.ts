// src/app/api/admin/compliance/[section]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { POLICIES } from '@/lib/compliance/constants'
import { revalidatePath } from 'next/cache'

/**
 * GET /api/admin/compliance/[section]
 * 获取单个政策详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params

    // 验证 section 是否有效
    if (!POLICIES.some(p => p.slug === section)) {
      return NextResponse.json({ error: 'Invalid policy section' }, { status: 400 })
    }

    const { data: policy, error } = await supabaseAdmin
      .from('footer_content')
      .select('*')
      .eq('section', section)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // 如果数据库中没有记录，返回默认值
    const result = policy ? policy : {
      id: '',
      section,
      translations: {},
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({ policy: result })
  } catch (error) {
    console.error('Error fetching policy:', error)
    return NextResponse.json({ error: 'Failed to fetch policy' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/compliance/[section]
 * 更新政策内容（支持插入和更新）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params
    const body = await request.json()

    // 验证 section 是否有效
    if (!POLICIES.some(p => p.slug === section)) {
      return NextResponse.json({ error: 'Invalid policy section' }, { status: 400 })
    }

    // 准备更新数据
    const updateData = {
      section,
      translations: body.translations || {},
      published: body.published ?? false
    }

    // 使用 upsert 操作（插入或更新）
    const { data: policy, error } = await supabaseAdmin
      .from('footer_content')
      .upsert(updateData, {
        onConflict: 'section'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // 触发 ISR 重新验证
    // 重新验证所有语言版本的政策页面
    const locales = ['en', 'ar', 'es', 'fr', 'pt', 'id', 'zh']
    for (const locale of locales) {
      revalidatePath(`/${locale}/compliance/${section}`, 'page')
    }

    return NextResponse.json({ policy })
  } catch (error) {
    console.error('Error updating policy:', error)
    return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 })
  }
}
