// src/lib/navigation/api.ts
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { NavigationItem, NavigationItemCreate, NavigationItemUpdate, ReorderRequest } from './types'
import { buildTree } from './tree'

/**
 * 获取导航树
 * @param position 位置（header 或 footer）
 * @returns 树形结构的导航项数组
 */
export async function getNavigation(position: 'header' | 'footer'): Promise<NavigationItem[]> {
  const { data, error } = await supabaseAdmin
    .from('navigation')
    .select('*')
    .eq('position', position)
    .order('order_index')

  if (error) throw error
  return buildTree(data as NavigationItem[])
}

/**
 * 创建导航项
 * @param item 导航项创建数据
 * @returns 创建的导航项
 */
export async function createNavigationItem(item: NavigationItemCreate): Promise<NavigationItem> {
  const { data, error } = await supabaseAdmin
    .from('navigation')
    .insert([item])
    .select()
    .single()

  if (error) throw error
  return data as NavigationItem
}

/**
 * 更新导航项
 * @param id 导航项 ID
 * @param updates 更新数据
 * @returns 更新后的导航项
 */
export async function updateNavigationItem(id: string, updates: NavigationItemUpdate): Promise<NavigationItem> {
  const { data, error } = await supabaseAdmin
    .from('navigation')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as NavigationItem
}

/**
 * 删除导航项
 * @param id 导航项 ID
 */
export async function deleteNavigationItem(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('navigation')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * 批量更新导航项排序
 * @param request 重排序请求
 */
export async function reorderNavigationItems(request: ReorderRequest): Promise<void> {
  // 使用 Promise.all 批量更新
  const updates = request.updates.map(({ id, parent_id, order_index }) =>
    supabaseAdmin
      .from('navigation')
      .update({ parent_id, order_index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)

  if (errors.length > 0) {
    throw new Error('Failed to reorder items')
  }
}
