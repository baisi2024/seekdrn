import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Category, CategoryTree } from '../types'

export async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .select('*')
    .order('sort_order')

  if (error) throw error
  return data as Category[]
}

export async function getCategoryTree(): Promise<CategoryTree> {
  const categories = await getCategories()

  const buildTree = (items: Category[], parentId: string | null = null): Category[] => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id)
      }))
  }

  return {
    nodes: buildTree(categories),
    flatList: categories
  }
}

export async function createCategory(category: Partial<Category>) {
  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .insert([category])
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function deleteCategory(id: string) {
  const { error } = await supabaseAdmin
    .from('product_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}
