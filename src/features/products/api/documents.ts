import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductDocument, DocumentFormData, DocumentType } from '../types'

export async function getDocuments(productId: string, type?: DocumentType) {
  let query = supabaseAdmin
    .from('product_documents')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order')

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) throw error
  return data as ProductDocument[]
}

export async function getDocument(id: string) {
  const { data, error } = await supabaseAdmin
    .from('product_documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ProductDocument
}

export async function createDocument(productId: string, document: DocumentFormData) {
  // Get the max sort_order for this product
  const { data: existingDocs } = await supabaseAdmin
    .from('product_documents')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = existingDocs && existingDocs.length > 0 
    ? existingDocs[0].sort_order + 1 
    : 0

  const { data, error } = await supabaseAdmin
    .from('product_documents')
    .insert([{
      product_id: productId,
      ...document,
      sort_order: nextSortOrder,
    }])
    .select()
    .single()

  if (error) throw error
  return data as ProductDocument
}

export async function updateDocument(id: string, document: Partial<DocumentFormData>) {
  const { data, error } = await supabaseAdmin
    .from('product_documents')
    .update(document)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ProductDocument
}

export async function deleteDocument(id: string) {
  const { error } = await supabaseAdmin
    .from('product_documents')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function reorderDocuments(productId: string, documentIds: string[]) {
  const updates = documentIds.map((id, index) => 
    supabaseAdmin
      .from('product_documents')
      .update({ sort_order: index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)
  
  if (errors.length > 0) {
    throw new Error('Failed to reorder documents')
  }
}
