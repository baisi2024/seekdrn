'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CaseStudy {
  id: string
  slug: string
  translations: Record<string, Record<string, string>>
}

interface Solution {
  id: string
  slug: string
  translations: Record<string, Record<string, string>>
}

interface Product {
  id: string
  model: string
  slug: string
  translations: Record<string, Record<string, string>>
}

interface Relation {
  id?: string
  target_id: string
  target_type: 'case_study' | 'solution' | 'product'
  target_name?: string
  sort_order: number
}

interface RelationsTabProps {
  productId: string
}

export function RelationsTab({ productId }: RelationsTabProps) {
  const t = useAdminTranslations()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Available items
  const [allCaseStudies, setAllCaseStudies] = useState<CaseStudy[]>([])
  const [allSolutions, setAllSolutions] = useState<Solution[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  
  // Relations
  const [relations, setRelations] = useState<Relation[]>([])
  
  // Search
  const [searchTerm, setSearchTerm] = useState('')
  const [addType, setAddType] = useState<'case_study' | 'solution' | 'product'>('case_study')

  useEffect(() => {
    async function loadData() {
      // Fetch all available items
      const [casesRes, solutionsRes, productsRes] = await Promise.all([
        supabase.from('case_studies').select('id, slug, translations').eq('published', true),
        supabase.from('solutions').select('id, slug, translations').eq('published', true),
        supabase.from('products').select('id, model, slug, translations').eq('published', true).neq('id', productId),
      ])

      if (casesRes.data) setAllCaseStudies(casesRes.data)
      if (solutionsRes.data) setAllSolutions(solutionsRes.data)
      if (productsRes.data) setAllProducts(productsRes.data)

      // Fetch existing relations
      const relationsData: Relation[] = []
      
      // Case study relations
      const { data: caseRelations } = await supabase
        .from('product_case_relations')
        .select('*, case_studies(translations)')
        .eq('product_id', productId)
        .order('sort_order')
      
      if (caseRelations) {
        caseRelations.forEach((r) => {
          relationsData.push({
            id: r.id,
            target_id: r.case_study_id,
            target_type: 'case_study',
            target_name: (r.case_studies as { translations: Record<string, Record<string, string>> })?.translations?.en?.name || r.case_study_id,
            sort_order: r.sort_order,
          })
        })
      }

      // Solution relations
      const { data: solutionRelations } = await supabase
        .from('product_solution_relations')
        .select('*, solutions(translations)')
        .eq('product_id', productId)
        .order('sort_order')
      
      if (solutionRelations) {
        solutionRelations.forEach((r) => {
          relationsData.push({
            id: r.id,
            target_id: r.solution_id,
            target_type: 'solution',
            target_name: (r.solutions as { translations: Record<string, Record<string, string>> })?.translations?.en?.name || r.solution_id,
            sort_order: r.sort_order,
          })
        })
      }

      // Product relations
      const { data: productRelations } = await supabase
        .from('product_product_relations')
        .select('*, products!product_product_relations_related_product_id_fkey(model, translations)')
        .eq('product_id', productId)
        .order('sort_order')
      
      if (productRelations) {
        productRelations.forEach((r) => {
          relationsData.push({
            id: r.id,
            target_id: r.related_product_id,
            target_type: 'product',
            target_name: (r.products as { model: string })?.model || r.related_product_id,
            sort_order: r.sort_order,
          })
        })
      }

      setRelations(relationsData)
      setLoading(false)
    }
    
    loadData()
  }, [productId, supabase])

  const addItem = (targetId: string, targetType: 'case_study' | 'solution' | 'product') => {
    let targetName = targetId
    
    if (targetType === 'case_study') {
      const item = allCaseStudies.find(c => c.id === targetId)
      targetName = item?.translations.en?.name || targetId
    } else if (targetType === 'solution') {
      const item = allSolutions.find(s => s.id === targetId)
      targetName = item?.translations.en?.name || targetId
    } else {
      const item = allProducts.find(p => p.id === targetId)
      targetName = item?.model || targetId
    }

    setRelations([...relations, {
      target_id: targetId,
      target_type: targetType,
      target_name: targetName,
      sort_order: relations.length,
    }])
  }

  const removeItem = (index: number) => {
    setRelations(relations.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Delete all existing relations
      await Promise.all([
        supabase.from('product_case_relations').delete().eq('product_id', productId),
        supabase.from('product_solution_relations').delete().eq('product_id', productId),
        supabase.from('product_product_relations').delete().eq('product_id', productId),
      ])

      // Insert new relations
      const caseRelations = relations
        .filter(r => r.target_type === 'case_study')
        .map((r, i) => ({
          product_id: productId,
          case_study_id: r.target_id,
          sort_order: i,
          is_manual: true,
        }))

      const solutionRelations = relations
        .filter(r => r.target_type === 'solution')
        .map((r, i) => ({
          product_id: productId,
          solution_id: r.target_id,
          sort_order: i,
        }))

      const productRelations = relations
        .filter(r => r.target_type === 'product')
        .map((r, i) => ({
          product_id: productId,
          related_product_id: r.target_id,
          sort_order: i,
        }))

      await Promise.all([
        caseRelations.length > 0 && supabase.from('product_case_relations').insert(caseRelations),
        solutionRelations.length > 0 && supabase.from('product_solution_relations').insert(solutionRelations),
        productRelations.length > 0 && supabase.from('product_product_relations').insert(productRelations),
      ])

      toast.success('关联关系已更新')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleAutoMatch = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/case-relations/auto-match`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Auto-match failed')

      toast.success('已自动匹配相关案例研究')

      // Reload data after auto-match
      window.location.reload()
    } catch {
      toast.error('自动匹配失败，请重试')
    }
  }

  const getFilteredItems = () => {
    const items: Array<{ id: string; name: string }> = []
    
    if (addType === 'case_study') {
      allCaseStudies.forEach(c => {
        const name = c.translations.en?.name || c.slug
        if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
          items.push({ id: c.id, name })
        }
      })
    } else if (addType === 'solution') {
      allSolutions.forEach(s => {
        const name = s.translations.en?.name || s.slug
        if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
          items.push({ id: s.id, name })
        }
      })
    } else {
      allProducts.forEach(p => {
        const name = p.model
        if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
          items.push({ id: p.id, name })
        }
      })
    }
    
    return items
  }

  if (loading) {
    return <div className="p-4">{t('loading')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">相关内容关联</h3>
          <p className="text-sm text-muted-foreground">
            管理产品与案例研究、解决方案、其他产品的关联关系
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoMatch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            自动匹配案例
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/admin/products/${productId}/cases`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            详细关联页面
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {/* Add Relation */}
      <Card>
        <CardHeader>
          <CardTitle>添加关联</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={addType} onValueChange={(v) => setAddType(v as 'case_study' | 'solution' | 'product')}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="case_study">案例研究</SelectItem>
                <SelectItem value="solution">解决方案</SelectItem>
                <SelectItem value="product">相关产品</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索..."
                className="pl-9"
              />
            </div>
          </div>
          
          {searchTerm && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {getFilteredItems().map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                  onClick={() => {
                    addItem(item.id, addType)
                    setSearchTerm('')
                  }}
                >
                  <span>{item.name}</span>
                  <Plus className="w-4 h-4" />
                </div>
              ))}
              {getFilteredItems().length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  未找到匹配项
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Relations */}
      <Card>
        <CardHeader>
          <CardTitle>当前关联 ({relations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {relations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              暂无关联内容。使用上方搜索添加关联。
            </p>
          ) : (
            <div className="space-y-2">
              {relations.map((relation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {relation.target_type === 'case_study' && '案例'}
                      {relation.target_type === 'solution' && '方案'}
                      {relation.target_type === 'product' && '产品'}
                    </Badge>
                    <span>{relation.target_name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
