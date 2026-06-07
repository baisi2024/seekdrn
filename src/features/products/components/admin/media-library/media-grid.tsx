'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import { MediaPreview } from './media-preview'
import { getPublicUrl } from '@/features/products/api'
import { Image as ImageIcon, FileVideo, FileText, Check } from 'lucide-react'
import type { MediaItem } from '@/features/products/types'

interface MediaGridProps {
  items: MediaItem[]
  selected: string[]
  viewMode: 'grid' | 'list'
  loading: boolean
  onSelect: (item: MediaItem) => void
}

export function MediaGrid({ items, selected, viewMode, loading, onSelect }: MediaGridProps) {
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8 text-blue-500" />
      case 'video': return <FileVideo className="w-8 h-8 text-red-500" />
      default: return <FileText className="w-8 h-8 text-muted-foreground" />
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (items.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No media found</div>
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              onDoubleClick={() => setPreviewItem(item)}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                selected.includes(item.id) ? 'border-blue-500' : 'border-transparent hover:border-border'
              }`}
            >
              {item.type === 'image' ? (
                <NextImage
                  src={getPublicUrl(item.r2_key)}
                  alt={item.filename}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  {getIcon(item.type)}
                </div>
              )}
              {selected.includes(item.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs truncate">
                {item.filename}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              onDoubleClick={() => setPreviewItem(item)}
              className={`flex items-center gap-4 p-4 cursor-pointer ${
                selected.includes(item.id) ? 'bg-primary/10' : 'hover:bg-muted/50'
              }`}
            >
              <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center relative">
                {item.type === 'image' ? (
                  <NextImage src={getPublicUrl(item.r2_key)} alt={item.filename} fill className="object-cover" />
                ) : (
                  getIcon(item.type)
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.filename}</p>
                <p className="text-sm text-muted-foreground">{item.mime_type} • {formatSize(item.size)}</p>
              </div>
              {selected.includes(item.id) && (
                <Check className="w-5 h-5 text-blue-500" />
              )}
            </div>
          ))}
        </div>
      )}

      <MediaPreview item={previewItem} onClose={() => setPreviewItem(null)} />
    </>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
