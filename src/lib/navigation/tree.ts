import type { NavigationItem } from './types'

/**
 * 将扁平数组转换为树形结构
 * @param items 扁平的导航项数组
 * @returns 树形结构的导航项数组
 */
export function buildTree(items: NavigationItem[]): NavigationItem[] {
  if (items.length === 0) return []

  // 创建一个映射，用于快速查找
  const itemMap = new Map<string, NavigationItem>()
  const rootItems: NavigationItem[] = []

  // 首先将所有项添加到映射中，并复制对象以避免修改原始数据
  items.forEach((item) => {
    itemMap.set(item.id, { ...item })
  })

  // 构建树形结构
  items.forEach((item) => {
    const currentItem = itemMap.get(item.id)!
    
    if (item.parent_id === null) {
      // 根项
      rootItems.push(currentItem)
    } else {
      // 子项，添加到父项的 children 数组中
      const parent = itemMap.get(item.parent_id)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(currentItem)
      }
    }
  })

  // 递归排序函数
  function sortChildren(items: NavigationItem[]): void {
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        // 按 order_index 排序子项
        item.children.sort((a, b) => a.order_index - b.order_index)
        // 递归排序子项的子项
        sortChildren(item.children)
      }
    })
  }

  // 按 order_index 排序根项
  rootItems.sort((a, b) => a.order_index - b.order_index)
  
  // 递归排序所有子项
  sortChildren(rootItems)

  return rootItems
}

/**
 * 将树形结构转换为扁平数组
 * @param items 树形结构的导航项数组
 * @returns 扁平的导航项数组
 */
export function flattenTree(items: NavigationItem[]): NavigationItem[] {
  const result: NavigationItem[] = []

  function flatten(items: NavigationItem[]): void {
    items.forEach((item) => {
      // 复制项并移除 children 属性
      const { children, ...itemWithoutChildren } = item
      result.push(itemWithoutChildren as NavigationItem)
      
      // 递归处理子项
      if (children && children.length > 0) {
        flatten(children)
      }
    })
  }

  flatten(items)
  return result
}
