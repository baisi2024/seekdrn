export interface MediaItem {
  id: string
  filename: string
  r2_key: string
  type: 'image' | 'video' | 'document'
  mime_type: string
  size: number
  width?: number
  height?: number
  duration?: number
  alt_text: Record<string, string>
  tags: string[]
  metadata: MediaMetadata
  created_at: string
}

export interface MediaMetadata {
  thumbnail?: string
  color?: string
}

export interface MediaFilter {
  search: string
  type: 'all' | 'image' | 'video' | 'document'
  tags: string[]
  dateRange: [Date | null, Date | null]
  sortBy: 'created_at' | 'filename' | 'size'
  sortOrder: 'asc' | 'desc'
}

export interface MediaLibraryProps {
  mode: 'select' | 'manage'
  accept?: 'image' | 'video' | 'all'
  multiple?: boolean
  maxSelect?: number
  onSelect?: (items: MediaItem[]) => void
}
