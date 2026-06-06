// src/lib/navigation/types.ts

export interface NavigationItem {
  id: string
  position: 'header' | 'footer'
  parent_id: string | null
  order_index: number
  link_type: 'internal' | 'external'
  url: string
  translations: Record<string, string>
  published: boolean
  children?: NavigationItem[]
}

export interface NavigationItemCreate {
  position: 'header' | 'footer'
  parent_id?: string | null
  order_index: number
  link_type: 'internal' | 'external'
  url: string
  translations: Record<string, string>
  published?: boolean
}

export interface NavigationItemUpdate {
  parent_id?: string | null
  order_index?: number
  link_type?: 'internal' | 'external'
  url?: string
  translations?: Record<string, string>
  published?: boolean
}

export interface ReorderRequest {
  updates: Array<{
    id: string
    parent_id: string | null
    order_index: number
  }>
}
