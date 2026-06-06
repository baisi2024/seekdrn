'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DownloadsManager } from '@/components/admin/downloads-manager'

export default function DownloadsManagePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [downloads, setDownloads] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [params.id])

  async function fetchData() {
    // 获取产品信息
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    if (productData) {
      setProduct(productData)
    }

    // 获取下载列表
    const { data: downloadsData } = await supabase
      .from('product_downloads')
      .select('*')
      .eq('product_id', params.id)
      .order('sort_order')

    if (downloadsData) {
      setDownloads(downloadsData)
    }

    setLoading(false)
  }

  async function handleSave(downloadsData: any[]) {
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

  if (!product) {
    return <div className="p-8">Product not found</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Downloads</h1>
        <p className="text-gray-600">Product: {product.model}</p>
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
