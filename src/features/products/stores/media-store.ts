import { create } from 'zustand'
import type { MediaItem, MediaFilter } from '../types'
import { getMedia, uploadMedia, deleteMedia } from '../api'

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
      const items = await getMedia(newFilter)
      set({ items, filter: newFilter, loading: false })
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
      const newItems = await uploadMedia(files, tags)
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
        await deleteMedia(id)
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
