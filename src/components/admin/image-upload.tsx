'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X, Upload, Play } from 'lucide-react'

interface MediaUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  max?: number
  accept?: string
}

export function MediaUpload({ images, onChange, max = 10, accept = 'image/*' }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < Math.min(files.length, max - images.length); i++) {
        formData.append('files', files[i])
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const { urls } = await res.json()
      onChange([...images, ...urls])
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }, [images, max, onChange])

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const isVideo = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase()
    return ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext || '')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {isVideo(img) ? (
              <div className="relative w-full h-full bg-black">
                <video src={img} className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
            ) : (
              <Image src={img} alt={`Media ${i + 1}`} fill className="object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {uploading ? 'Uploading...' : 'Upload'}
            </span>
            <input
              type="file"
              accept={accept}
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  )
}

export { MediaUpload as ImageUpload }
