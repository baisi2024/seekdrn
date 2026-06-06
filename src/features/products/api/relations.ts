import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Product } from '../types'

export type RelationType = 'related' | 'accessory' | 'alternative' | 'complementary'

export interface ProductRelation {
  id: string
  product_id: string
  related_product_id: string
  relation_type: RelationType
  sort_order: number
  created_at: string
}

export interface RelationFormData {
  related_product_id: string
  relation_type: RelationType
}

export async function getRelations(productId: string, type?: RelationType) {
  let query = supabaseAdmin
    .from('product_relations')
    .select(`
      *,
      related_product:products!product_relations_related_product_id_fkey(*)
    `)
    .eq('product_id', productId)
    .order('sort_order')

  if (type) {
    query = query.eq('relation_type', type)
  }

  const { data, error } = await query

  if (error) throw error
  return data as (ProductRelation & { related_product: Product })[]
}

export async function addRelation(productId: string, relation: RelationFormData) {
  // Check if relation already exists
  const { data: existing } = await supabaseAdmin
    .from('product_relations')
    .select('id')
    .eq('product_id', productId)
    .eq('related_product_id', relation.related_product_id)
    .eq('relation_type', relation.relation_type)
    .maybeSingle()

  if (existing) {
    throw new Error('Relation already exists')
  }

  // Get the max sort_order for this product and relation type
  const { data: existingRelations } = await supabaseAdmin
    .from('product_relations')
    .select('sort_order')
    .eq('product_id', productId)
    .eq('relation_type', relation.relation_type)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = existingRelations && existingRelations.length > 0 
    ? existingRelations[0].sort_order + 1 
    : 0

  const { data, error } = await supabaseAdmin
    .from('product_relations')
    .insert([{
      product_id: productId,
      ...relation,
      sort_order: nextSortOrder,
    }])
    .select()
    .single()

  if (error) throw error
  return data as ProductRelation
}

export async function removeRelation(relationId: string) {
  const { error } = await supabaseAdmin
    .from('product_relations')
    .delete()
    .eq('id', relationId)

  if (error) throw error
}

export async function reorderRelations(productId: string, type: RelationType, relationIds: string[]) {
  const updates = relationIds.map((id, index) => 
    supabaseAdmin
      .from('product_relations')
      .update({ sort_order: index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)
  
  if (errors.length > 0) {
    throw new Error('Failed to reorder relations')
  }
}

export async function getProductsByRelation(productId: string, type: RelationType) {
  const relations = await getRelations(productId, type)
  return relations.map(r => r.related_product)
}

export async function bulkAddRelations(productId: string, relations: RelationFormData[]) {
  const results = await Promise.all(
    relations.map(relation => addRelation(productId, relation))
  )
  return results
}

export async function copyRelationsFromProduct(sourceProductId: string, targetProductId: string, types?: RelationType[]) {
  let query = supabaseAdmin
    .from('product_relations')
    .select('*')
    .eq('product_id', sourceProductId)

  if (types && types.length > 0) {
    query = query.in('relation_type', types)
  }

  const { data: sourceRelations, error } = await query

  if (error) throw error

  if (!sourceRelations || sourceRelations.length === 0) {
    return []
  }

  // Add relations to target product
  const results = await Promise.all(
    sourceRelations.map(relation => 
      addRelation(targetProductId, {
        related_product_id: relation.related_product_id,
        relation_type: relation.relation_type as RelationType,
      })
    )
  )

  return results
}
