'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getPublicUrl } from '@/features/products/api'
import type { MediaItem } from '@/features/products/types'

interface MediaPreviewProps {
  item: MediaItem | null
  onClose: () => void
}

export function MediaPreview({ item, onClose }: MediaPreviewProps) {
  if (!item) return null

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{item.filename}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex items-center justify-center">
          {item.type === 'image' ? (
            <img
              src={getPublicUrl(item.r2_key)}
              alt={item.filename}
              className="max-w-full max-h-[60vh] object-contain"
            />
          ) : item.type === 'video' ? (
            <video
              src={getPublicUrl(item.r2_key)}
              controls
              className="max-w-full max-h-[60vh]"
            />
          ) : (
            <a
              href={getPublicUrl(item.r2_key)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download {item.filename}
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
