import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const solutionId = searchParams.get('solution_id')

    let query = supabaseAdmin
      .from('solution_cases')
      .select('*, case_studies(id, title, slug, published)')
      .order('sort_order', { ascending: true })

    if (solutionId) {
      query = query.eq('solution_id', solutionId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching solution cases:', error)
    return NextResponse.json({ error: 'Failed to fetch solution cases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { solution_id, case_study_id, sort_order } = body

    if (!solution_id || !case_study_id) {
      return NextResponse.json(
        { error: 'solution_id and case_study_id are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('solution_cases')
      .insert([{ solution_id, case_study_id, sort_order: sort_order || 0 }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating solution case:', error)
    return NextResponse.json({ error: 'Failed to create solution case' }, { status: 500 })
  }
}
