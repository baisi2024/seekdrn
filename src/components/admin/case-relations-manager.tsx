'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

interface CaseStudy {
  id: string
  slug: string
  industry: string
  country: string
  translations: Record<string, Record<string, string>>
}

interface CaseRelation {
  id?: string
  case_study_id: string
  case_study?: CaseStudy
  is_manual: boolean
  relevance_score: number
  sort_order: number
}

interface Props {
  productId: string
  initialRelations?: CaseRelation[]
  allCaseStudies: CaseStudy[]
  onSave: (relations: CaseRelation[]) => Promise<void>
  onAutoMatch: () => Promise<CaseRelation[]>
}

export function CaseRelationsManager({ 
  productId, 
  initialRelations = [], 
  allCaseStudies,
  onSave,
  onAutoMatch 
}: Props) {
  const t = useAdminTranslations()
  const [relations, setRelations] = useState<CaseRelation[]>(initialRelations)
  const [saving, setSaving] = useState(false)
  const [matching, setMatching] = useState(false)
  const [showSelector, setShowSelector] = useState(false)

  const addRelation = (caseStudyId: string) => {
    const caseStudy = allCaseStudies.find(c => c.id === caseStudyId)
    const newRelation: CaseRelation = {
      case_study_id: caseStudyId,
      case_study: caseStudy,
      is_manual: true,
      relevance_score: 0,
      sort_order: relations.length
    }
    setRelations([...relations, newRelation])
    setShowSelector(false)
  }

  const deleteRelation = (index: number) => {
    setRelations(relations.filter((_, i) => i !== index))
  }

  const handleAutoMatch = async () => {
    setMatching(true)
    try {
      const matchedRelations = await onAutoMatch()
      setRelations(matchedRelations)
      alert(t('case_relations.auto_matched'))
    } catch (error) {
      console.error('Auto-match error:', error)
      alert(t('case_relations.auto_match_failed'))
    } finally {
      setMatching(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(relations)
      alert(t('case_relations.saved'))
    } catch (error) {
      console.error('Save error:', error)
      alert(t('case_relations.save_failed'))
    } finally {
      setSaving(false)
    }
  }

  const getCaseTitle = (caseStudy?: CaseStudy) => {
    if (!caseStudy) return t('case_relations.unknown')
    return caseStudy.translations?.en?.title || caseStudy.translations?.zh?.title || caseStudy.slug
  }

  const availableCases = allCaseStudies.filter(
    c => !relations.some(r => r.case_study_id === c.id)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('case_relations.title')}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAutoMatch}
            disabled={matching}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {matching ? t('case_relations.matching') : t('case_relations.auto_match')}
          </Button>
          <Button onClick={() => setShowSelector(!showSelector)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('case_relations.add_manually')}
          </Button>
        </div>
      </div>

      {showSelector && (
        <Card>
          <CardHeader>
            <CardTitle>{t('case_relations.select_case')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableCases.length === 0 ? (
                <p className="text-muted-foreground">{t('case_relations.no_available')}</p>
              ) : (
                availableCases.map(caseStudy => (
                  <div
                    key={caseStudy.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => addRelation(caseStudy.id)}
                  >
                    <div>
                      <p className="font-medium">{getCaseTitle(caseStudy)}</p>
                      <p className="text-sm text-muted-foreground">
                        {caseStudy.industry} - {caseStudy.country}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {relations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {t('case_relations.empty')}
          </CardContent>
        </Card>
      ) : (
        relations.map((relation, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">
                    {getCaseTitle(relation.case_study)}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {relation.case_study?.industry}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {relation.case_study?.country}
                    </span>
                    {relation.is_manual ? (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {t('case_relations.manual')}
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {t('case_relations.auto')} ({relation.relevance_score.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRelation(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? t('case_relations.saving') : t('case_relations.save_changes')}
      </Button>
    </div>
  )
}
