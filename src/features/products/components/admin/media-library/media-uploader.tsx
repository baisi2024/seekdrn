'use client'

import { useCallback } from 'react'
import { Upload } from 'lucide-react'

interface MediaUploaderProps {
  accept: 'image' | 'video' | 'all'
  uploading: boolean
  onUpload: (files: File[], tags?: string[]) => Promise<void>
}

export function MediaUploader({ accept, uploading, onUpload }: MediaUploaderProps) {
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await onUpload(files)
    }
  }, [onUpload])

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await onUpload(files)
    }
  }, [onUpload])

  const acceptTypes = accept === 'all' ? 'image/*,video/*,.pdf,.csv' : `${accept}/*`

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
    >
      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
      <p className="text-gray-600 mb-2">
        {uploading ? 'Uploading...' : 'Drag and drop files here, or click to select'}
      </p>
      <label className="cursor-pointer">
        <span className="text-blue-500 hover:text-blue-600">Browse files</span>
        <input
          type="file"
          accept={acceptTypes}
          multiple
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}
