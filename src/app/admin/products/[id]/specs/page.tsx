'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SpecGroupsEditor } from '@/components/admin/spec-groups-editor'

interface SpecGroupData {
  id: string
  label: Record<string, string>
  specs: SpecData[]
  sort_order: number
}

interface SpecData {
  id: string
  label: Record<string, string>
  value: Record<string, string>
  unit: Record<string, string>
  group_id: string
  sort_order: number
}

export default function SpecsManagePage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [specGroups, setSpecGroups] = useState<SpecGroupData[]>([])
  const [specs, setSpecs] = useState<SpecData[]>([])
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    // 获取产品信息
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    if (productData) {
      setSpecGroups((productData.spec_groups as SpecGroupData[]) || [])
    }

    // 获取规格
    const { data: specsData } = await supabase
      .from('product_specs')
      .select('*')
      .eq('product_id', params.id)
      .order('sort_order')

    if (specsData) {
      setSpecs(specsData as SpecData[])
    }

    setLoading(false)
  }, [params.id, supabase])

  useEffect(() => {
    // 使用 requestAnimationFrame 避免同步 setState
    requestAnimationFrame(() => {
      fetchData()
    })
  }, [fetchData])

  async function handleSave(groups: SpecGroupData[], specsData: SpecData[]) {
    // 更新产品规格组
    const { error: productError } = await supabase
      .from('products')
      .update({ spec_groups: groups })
      .eq('id', params.id)

    if (productError) throw productError

    // 删除旧规格
    await supabase
      .from('product_specs')
      .delete()
      .eq('product_id', params.id)

    // 插入新规格
    if (specsData.length > 0) {
      const { error: specsError } = await supabase
        .from('product_specs')
        .insert(specsData.map(s => ({
          ...s,
          product_id: params.id
        })))

      if (specsError) throw specsError
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Specifications</h1>
      </div>

      <SpecGroupsEditor
        productId={params.id as string}
        initialGroups={specGroups}
        initialSpecs={specs}
        onSave={handleSave}
      />
    </div>
  )
}
