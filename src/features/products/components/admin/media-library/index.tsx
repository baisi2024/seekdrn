'use client'

import { useEffect } from 'react'
import { useMediaStore } from '@/features/products/stores'
import { MediaGrid } from './media-grid'
import { MediaUploader } from './media-uploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Grid3X3, List, Search, Trash2 } from 'lucide-react'
import type { MediaLibraryProps, MediaItem } from '@/features/products/types'

export function MediaLibrary({ mode, accept = 'all', multiple = false, maxSelect = 10, onSelect }: MediaLibraryProps) {
  const { items, selected, viewMode, loading, uploading, fetchMedia, setViewMode, toggleSelect, setSelected, uploadFiles, deleteSelected } = useMediaStore()

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleSelect = (item: MediaItem) => {
    if (mode === 'select') {
      if (multiple) {
        toggleSelect(item.id)
        if (selected.length <= maxSelect && onSelect) {
          onSelect(items.filter(i => selected.includes(i.id) || i.id === item.id))
        }
      } else {
        setSelected([item.id])
        onSelect?.([item])
      }
    } else {
      toggleSelect(item.id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-9"
            onChange={(e) => fetchMedia({ search: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 border rounded-md p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted/50'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {mode === 'manage' && selected.length > 0 && (
          <Button variant="destructive" size="sm" onClick={deleteSelected}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete ({selected.length})
          </Button>
        )}
      </div>

      <MediaUploader
        accept={accept}
        uploading={uploading}
        onUpload={uploadFiles}
      />

      <MediaGrid
        items={items}
        selected={selected}
        viewMode={viewMode}
        loading={loading}
        onSelect={handleSelect}
      />
    </div>
  )
}
