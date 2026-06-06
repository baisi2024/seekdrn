import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Product, FilterState } from '../types'

export async function getProducts(filters?: Partial<FilterState>) {
  let query = supabaseAdmin
    .from('products')
    .select('*, category:product_categories(*)', { count: 'exact' })
    .order('sort_order')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category_id', filters.category)
  }

  if (filters?.search) {
    query = query.textSearch('search_vector', filters.search)
  }

  if (filters?.page && filters?.pageSize) {
    const from = (filters.page - 1) * filters.pageSize
    const to = from + filters.pageSize - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { products: data as Product[], total: count || 0 }
}

export async function getProduct(id: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, category:product_categories(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Product
}

export async function createProduct(product: Partial<Product>) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([product])
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string) {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getRelatedProducts(productId: string, limit = 4) {
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('category_id, tags')
    .eq('id', productId)
    .single()

  if (!product) return []

  const { data } = await supabaseAdmin
    .from('products')
    .select('*, category:product_categories(*)')
    .eq('published', true)
    .neq('id', productId)
    .or(`category_id.eq.${product.category_id}`)
    .limit(limit)

  return data as Product[]
}

export async function compareProducts(productIds: string[]) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, category:product_categories(*)')
    .in('id', productIds)

  if (error) throw error
  return data as Product[]
}
