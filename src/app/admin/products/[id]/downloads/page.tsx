'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DownloadsManager } from '@/components/admin/downloads-manager'

interface DownloadData {
  id?: string
  type: 'manual' | 'datasheet' | 'certificate' | 'media'
  title: Record<string, string>
  description: Record<string, string>
  file_url: string
  file_size?: number
  file_type?: string
  language?: string
  sort_order: number
}

export default function DownloadsManagePage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [downloads, setDownloads] = useState<DownloadData[]>([])
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    // 获取下载列表
    const { data: downloadsData } = await supabase
      .from('product_downloads')
      .select('*')
      .eq('product_id', params.id)
      .order('sort_order')

    if (downloadsData) {
      setDownloads(downloadsData as DownloadData[])
    }

    setLoading(false)
  }, [params.id, supabase])

  useEffect(() => {
    // 使用 requestAnimationFrame 避免同步 setState
    requestAnimationFrame(() => {
      fetchData()
    })
  }, [fetchData])

  async function handleSave(downloadsData: DownloadData[]) {
    // 删除旧下载记录
    await supabase
      .from('product_downloads')
      .delete()
      .eq('product_id', params.id)

    // 插入新下载记录
    if (downloadsData.length > 0) {
      const { error } = await supabase
        .from('product_downloads')
        .insert(downloadsData.map(d => ({
          ...d,
          id: undefined, // 移除临时ID
          product_id: params.id
        })))

      if (error) throw error
    }
  }

  async function handleUpload(file: File): Promise<string> {
    // 使用现有的上传API
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const { url } = await response.json()
    return url
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Downloads</h1>
      </div>

      <DownloadsManager
        productId={params.id as string}
        initialDownloads={downloads}
        onSave={handleSave}
        onUpload={handleUpload}
      />
    </div>
  )
}
