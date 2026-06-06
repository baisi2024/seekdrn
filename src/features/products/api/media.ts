import { supabaseAdmin } from '@/lib/supabase/admin'
import { uploadToR2, getPublicUrl } from '@/lib/r2'
import type { MediaItem, MediaFilter } from '../types'

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  document: ['application/pdf', 'application/csv', 'application/vnd.ms-excel']
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export async function getMedia(filters?: Partial<MediaFilter>) {
  let query = supabaseAdmin
    .from('media')
    .select('*')
    .order(filters?.sortBy || 'created_at', { ascending: filters?.sortOrder === 'asc' })

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  if (filters?.search) {
    query = query.ilike('filename', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data as MediaItem[]
}

export async function uploadMedia(files: File[], tags: string[] = []) {
  const results: MediaItem[] = []

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} exceeds maximum size of 100MB`)
    }

    const type = getMediaType(file.type)
    if (!type) {
      throw new Error(`File type ${file.type} is not allowed`)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const key = `media/${new Date().toISOString().split('T')[0]}/${crypto.randomUUID()}.${file.name.split('.').pop()}`

    await uploadToR2(key, buffer, file.type)

    const { data, error } = await supabaseAdmin
      .from('media')
      .insert([{
        filename: file.name,
        r2_key: key,
        type,
        mime_type: file.type,
        size: file.size,
        tags,
        alt_text: {},
        metadata: {}
      }])
      .select()
      .single()

    if (error) throw error
    results.push(data as MediaItem)
  }

  return results
}

export async function updateMedia(id: string, data: Partial<MediaItem>) {
  const { data: updated, error } = await supabaseAdmin
    .from('media')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated as MediaItem
}

export async function deleteMedia(id: string) {
  const { data: item } = await supabaseAdmin
    .from('media')
    .select('r2_key')
    .eq('id', id)
    .single()

  if (item) {
    // Note: R2 deletion would need to be implemented
    const { error } = await supabaseAdmin
      .from('media')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

function getMediaType(mimeType: string): 'image' | 'video' | 'document' | null {
  for (const [type, mimes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimes.includes(mimeType)) {
      return type as 'image' | 'video' | 'document'
    }
  }
  return null
}

export { getPublicUrl }
