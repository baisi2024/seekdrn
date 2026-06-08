import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Fetch notes if inquiry_notes table exists
    const { data: notes } = await supabaseAdmin
      .from('inquiry_notes')
      .select('*')
      .eq('inquiry_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({ ...data, notes: notes || [] })
  } catch (error) {
    console.error('Error fetching inquiry:', error)
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Separate notes from inquiry fields
    const { notes, ...inquiryFields } = body

    // Update inquiry fields
    if (Object.keys(inquiryFields).length > 0) {
      const { error } = await supabaseAdmin
        .from('inquiries')
        .update(inquiryFields)
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    // Add new note if provided
    if (notes && notes.content) {
      await supabaseAdmin
        .from('inquiry_notes')
        .insert([{
          inquiry_id: id,
          content: notes.content,
          created_by: notes.created_by || null,
        }])
    }

    // Return updated inquiry
    const { data, error: fetchError } = await supabaseAdmin
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    const { data: updatedNotes } = await supabaseAdmin
      .from('inquiry_notes')
      .select('*')
      .eq('inquiry_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({ ...data, notes: updatedNotes || [] })
  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
}
