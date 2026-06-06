import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductFAQ, FAQFormData } from '../types'

export async function getFAQs(productId: string, locale?: string) {
  let query = supabaseAdmin
    .from('product_faqs')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order')

  if (locale) {
    query = query.eq('locale', locale)
  }

  const { data, error } = await query

  if (error) throw error
  return data as ProductFAQ[]
}

export async function getFAQ(id: string) {
  const { data, error } = await supabaseAdmin
    .from('product_faqs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ProductFAQ
}

export async function createFAQ(productId: string, locale: string, faq: FAQFormData) {
  // Get the max sort_order for this product and locale
  const { data: existingFaqs } = await supabaseAdmin
    .from('product_faqs')
    .select('sort_order')
    .eq('product_id', productId)
    .eq('locale', locale)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = existingFaqs && existingFaqs.length > 0 
    ? existingFaqs[0].sort_order + 1 
    : 0

  const { data, error } = await supabaseAdmin
    .from('product_faqs')
    .insert([{
      product_id: productId,
      locale,
      ...faq,
      sort_order: nextSortOrder,
    }])
    .select()
    .single()

  if (error) throw error
  return data as ProductFAQ
}

export async function updateFAQ(id: string, faq: Partial<FAQFormData>) {
  const { data, error } = await supabaseAdmin
    .from('product_faqs')
    .update(faq)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ProductFAQ
}

export async function deleteFAQ(id: string) {
  const { error } = await supabaseAdmin
    .from('product_faqs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function reorderFAQs(productId: string, locale: string, faqIds: string[]) {
  const updates = faqIds.map((id, index) => 
    supabaseAdmin
      .from('product_faqs')
      .update({ sort_order: index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)
  
  if (errors.length > 0) {
    throw new Error('Failed to reorder FAQs')
  }
}
