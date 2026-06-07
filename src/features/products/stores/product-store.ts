import { create } from 'zustand'
import type { Product, FilterState } from '../types'

interface ProductStore {
  products: Product[]
  total: number
  filters: Partial<FilterState>
  compareList: string[]
  compareResults: Product[]
  loading: boolean

  fetchProducts: (filters?: Partial<FilterState>) => Promise<void>
  setFilters: (filters: Partial<FilterState>) => void
  addToCompare: (id: string) => Promise<void>
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  fetchCompareResults: () => Promise<void>
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  total: 0,
  filters: {},
  compareList: [],
  compareResults: [],
  loading: false,

  fetchProducts: async (filters) => {
    set({ loading: true })
    try {
      const newFilters = { ...get().filters, ...filters }
      const params = new URLSearchParams()
      if (newFilters.category) params.set('category', newFilters.category)
      if (newFilters.search) params.set('search', newFilters.search)
      if (newFilters.page) params.set('page', String(newFilters.page))
      if (newFilters.pageSize) params.set('pageSize', String(newFilters.pageSize))

      const res = await fetch(`/api/admin/products?${params.toString()}`)
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Failed to fetch products')

      set({ products: result.products || [], total: result.total || 0, filters: newFilters, loading: false })
    } catch (error) {
      console.error('Failed to fetch products:', error)
      set({ loading: false })
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } })
  },

  addToCompare: async (id) => {
    const { compareList } = get()
    if (compareList.length >= 4 || compareList.includes(id)) return
    set({ compareList: [...compareList, id] })
    await get().fetchCompareResults()
  },

  removeFromCompare: (id) => {
    set({ compareList: get().compareList.filter(i => i !== id) })
  },

  clearCompare: () => {
    set({ compareList: [], compareResults: [] })
  },

  fetchCompareResults: async () => {
    const { compareList } = get()
    if (compareList.length === 0) {
      set({ compareResults: [] })
      return
    }
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'compare', ids: compareList }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to compare products')
      set({ compareResults: result.data || [] })
    } catch (error) {
      console.error('Failed to fetch compare results:', error)
    }
  }
}))