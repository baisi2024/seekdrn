'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CaseRelationsManager } from '@/components/admin/case-relations-manager'

interface CaseStudyData {
  id: string
  slug: string
  industry: string
  country: string
  translations: Record<string, Record<string, string>>
}

interface CaseRelationData {
  id?: string
  case_study_id: string
  case_study?: CaseStudyData
  is_manual: boolean
  relevance_score: number
  sort_order: number
}

export default function CasesManagePage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [relations, setRelations] = useState<CaseRelationData[]>([])
  const [allCaseStudies, setAllCaseStudies] = useState<CaseStudyData[]>([])
  const supabase = createClient()

  const fetchData = useCallback(async () => {
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
      setRelations(relationsData as CaseRelationData[])
    }

    // 获取所有案例
    const { data: casesData } = await supabase
      .from('case_studies')
      .select('*')
      .eq('published', true)

    if (casesData) {
      setAllCaseStudies(casesData as CaseStudyData[])
    }

    setLoading(false)
  }, [params.id, supabase])

  useEffect(() => {
    // 使用 requestAnimationFrame 避免同步 setState
    requestAnimationFrame(() => {
      fetchData()
    })
  }, [fetchData])

  async function handleSave(relationsData: CaseRelationData[]) {
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

  async function handleAutoMatch(): Promise<CaseRelationData[]> {
    // 调用自动匹配API
    const response = await fetch(`/api/admin/products/${params.id}/case-relations/auto-match`, {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error('Auto-match failed')
    }

    const { relations } = await response.json()
    return relations as CaseRelationData[]
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Related Cases</h1>
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
