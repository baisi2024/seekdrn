import { create } from 'zustand'
import type { MediaItem, MediaFilter } from '../types'

interface MediaStore {
  items: MediaItem[]
  selected: string[]
  viewMode: 'grid' | 'list'
  filter: Partial<MediaFilter>
  loading: boolean
  uploading: boolean

  fetchMedia: (filter?: Partial<MediaFilter>) => Promise<void>
  setSelected: (ids: string[]) => void
  toggleSelect: (id: string) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setFilter: (filter: Partial<MediaFilter>) => void
  uploadFiles: (files: File[], tags?: string[]) => Promise<void>
  deleteSelected: () => Promise<void>
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  items: [],
  selected: [],
  viewMode: 'grid',
  filter: {},
  loading: false,
  uploading: false,

  fetchMedia: async (filter) => {
    set({ loading: true })
    try {
      const newFilter = { ...get().filter, ...filter }
      const params = new URLSearchParams()
      if (newFilter.type) params.set('type', newFilter.type)
      if (newFilter.search) params.set('search', newFilter.search)
      if (newFilter.sortBy) params.set('sortBy', newFilter.sortBy)
      if (newFilter.sortOrder) params.set('sortOrder', newFilter.sortOrder)

      const res = await fetch(`/api/admin/media?${params.toString()}`)
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Failed to fetch media')

      set({ items: result.data || [], filter: newFilter, loading: false })
    } catch (error) {
      console.error('Failed to fetch media:', error)
      set({ loading: false })
    }
  },

  setSelected: (ids) => set({ selected: ids }),

  toggleSelect: (id) => {
    const { selected } = get()
    if (selected.includes(id)) {
      set({ selected: selected.filter(i => i !== id) })
    } else {
      set({ selected: [...selected, id] })
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setFilter: (filter) => set({ filter: { ...get().filter, ...filter } }),

  uploadFiles: async (files, tags = []) => {
    set({ uploading: true })
    try {
      const formData = new FormData()
      for (const file of files) {
        formData.append('files', file)
      }
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags))
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Upload failed')

      const newItems = result.data || result.items || []
      set({ items: [...newItems, ...get().items], uploading: false })
    } catch (error) {
      console.error('Failed to upload files:', error)
      set({ uploading: false })
      throw error
    }
  },

  deleteSelected: async () => {
    const { selected } = get()
    set({ loading: true })
    try {
      for (const id of selected) {
        const res = await fetch('/api/admin/media', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
        if (!res.ok) {
          const result = await res.json()
          throw new Error(result.error || 'Delete failed')
        }
      }
      set({
        items: get().items.filter(i => !selected.includes(i.id)),
        selected: [],
        loading: false
      })
    } catch (error) {
      console.error('Failed to delete media:', error)
      set({ loading: false })
    }
  }
}))