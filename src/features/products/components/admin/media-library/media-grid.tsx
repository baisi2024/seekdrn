'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import { MediaPreview } from './media-preview'
import { getPublicUrl } from '@/features/products/api'
import { Image as ImageIcon, FileVideo, FileText, Check, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { MultilingualInput } from '@/features/products/components/admin/multilingual-input'
import { toast } from 'sonner'
import type { MediaItem } from '@/features/products/types'

interface MediaGridProps {
  items: MediaItem[]
  selected: string[]
  viewMode: 'grid' | 'list'
  loading: boolean
  onSelect: (item: MediaItem) => void
  onMediaUpdated?: () => void
}

export function MediaGrid({ items, selected, viewMode, loading, onSelect, onMediaUpdated }: MediaGridProps) {
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)
  const [editItem, setEditItem] = useState<MediaItem | null>(null)
  const [editAltText, setEditAltText] = useState<Record<string, string>>({})
  const [editTags, setEditTags] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8 text-blue-500" />
      case 'video': return <FileVideo className="w-8 h-8 text-red-500" />
      default: return <FileText className="w-8 h-8 text-muted-foreground" />
    }
  }

  function openEditDialog(item: MediaItem) {
    setEditItem(item)
    setEditAltText(item.alt_text || {})
    setEditTags(item.tags?.join(', ') || '')
  }

  async function handleSaveEdit() {
    if (!editItem) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/media/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alt_text: editAltText,
          tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success('Media updated successfully')
      setEditItem(null)
      onMediaUpdated?.()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update media')
    } finally {
      setSaving(false)
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
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${
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
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openEditDialog(item)
                }}
                className="absolute top-2 left-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <Pencil className="w-3.5 h-3.5 text-white" />
              </button>
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
              className={`flex items-center gap-4 p-4 cursor-pointer group ${
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
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openEditDialog(item)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              {selected.includes(item.id) && (
                <Check className="w-5 h-5 text-blue-500" />
              )}
            </div>
          ))}
        </div>
      )}

      <MediaPreview item={previewItem} onClose={() => setPreviewItem(null)} />

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MultilingualInput
              label="Alt Text"
              value={editAltText}
              onChange={setEditAltText}
              type="textarea"
            />
            <div>
              <Label>Tags</Label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated tags</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
