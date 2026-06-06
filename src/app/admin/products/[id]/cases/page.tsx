'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CaseRelationsManager } from '@/components/admin/case-relations-manager'

export default function CasesManagePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [relations, setRelations] = useState<any[]>([])
  const [allCaseStudies, setAllCaseStudies] = useState<any[]>([])
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

    // 获取案例关联
    const { data: relationsData } = await supabase
      .from('product_case_relations')
      .select(`
        *,
        case_studies (*)
      `)
      .eq('product_id', params.id)
      .order('sort_order')

    if (relationsData) {
      setRelations(relationsData)
    }

    // 获取所有案例
    const { data: casesData } = await supabase
      .from('case_studies')
      .select('*')
      .eq('published', true)

    if (casesData) {
      setAllCaseStudies(casesData)
    }

    setLoading(false)
  }

  async function handleSave(relationsData: any[]) {
    // 删除旧关联
    await supabase
      .from('product_case_relations')
      .delete()
      .eq('product_id', params.id)

    // 插入新关联
    if (relationsData.length > 0) {
      const { error } = await supabase
        .from('product_case_relations')
        .insert(relationsData.map(r => ({
          product_id: params.id,
          case_study_id: r.case_study_id,
          is_manual: r.is_manual,
          relevance_score: r.relevance_score,
          sort_order: r.sort_order
        })))

      if (error) throw error
    }
  }

  async function handleAutoMatch(): Promise<any[]> {
    // 调用自动匹配API
    const response = await fetch(`/api/admin/products/${params.id}/case-relations/auto-match`, {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error('Auto-match failed')
    }

    const { relations } = await response.json()
    return relations
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
        <h1 className="text-2xl font-bold">Manage Related Cases</h1>
        <p className="text-muted-foreground">Product: {product.model}</p>
      </div>
      
      <CaseRelationsManager
        productId={params.id as string}
        initialRelations={relations}
        allCaseStudies={allCaseStudies}
        onSave={handleSave}
        onAutoMatch={handleAutoMatch}
      />
    </div>
  )
}
