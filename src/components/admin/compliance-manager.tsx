'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Edit, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PolicyEditor } from './policy-editor'
import { PolicyItem, PolicyUpdate } from '@/lib/compliance/types'
import { POLICIES } from '@/lib/compliance/constants'
import { toast } from 'sonner'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

interface ComplianceManagerProps {
  initialPolicies?: PolicyItem[]
}

export function ComplianceManager({ initialPolicies }: ComplianceManagerProps) {
  const t = useAdminTranslations()
  // 状态管理
  const [policies, setPolicies] = useState<PolicyItem[]>(initialPolicies || [])
  const [loading, setLoading] = useState(!initialPolicies)
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null)
  const [updating, setUpdating] = useState<string | null>(null) // 正在更新的政策 section

  // 获取政策列表
  const fetchPolicies = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/compliance')
      if (!response.ok) {
        throw new Error('Failed to fetch policies')
      }
      const data = await response.json()
      setPolicies(data.policies || [])
    } catch (error) {
      console.error('Error fetching policies:', error)
      toast.error(t('compliance_page.load_failed'))
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始化加载（仅在没有 initialPolicies 时）
  useEffect(() => {
    if (!initialPolicies) {
      fetchPolicies()
    }
  }, [fetchPolicies, initialPolicies])

  // 编辑政策
  const handleEdit = (policy: PolicyItem) => {
    setEditingPolicy(policy)
  }

  // 关闭编辑对话框
  const handleCloseEditor = () => {
    setEditingPolicy(null)
  }

  // 保存政策
  const handleSavePolicy = async (data: PolicyUpdate) => {
    if (!editingPolicy) return

    setUpdating(editingPolicy.section)
    try {
      // 找到对应的政策配置以获取 slug
      const policyConfig = POLICIES.find(p => p.section === editingPolicy.section)
      if (!policyConfig) {
        throw new Error('Invalid policy section')
      }

      const response = await fetch(`/api/admin/compliance/${policyConfig.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update policy')
      }

      toast.success(t('compliance_page.policy_updated'))
      setEditingPolicy(null)
      // 重新加载数据
      await fetchPolicies()
    } catch (error) {
      console.error('Error updating policy:', error)
      toast.error(t('compliance_page.policy_update_failed'))
      throw error // 让 PolicyEditor 处理错误
    } finally {
      setUpdating(null)
    }
  }

  // 切换发布状态
  const handleTogglePublished = async (policy: PolicyItem, published: boolean) => {
    setUpdating(policy.section)
    try {
      // 找到对应的政策配置以获取 slug
      const policyConfig = POLICIES.find(p => p.section === policy.section)
      if (!policyConfig) {
        throw new Error('Invalid policy section')
      }

      const response = await fetch(`/api/admin/compliance/${policyConfig.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translations: policy.translations,
          published,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update policy')
      }

      toast.success(published ? t('compliance_page.policy_published') : t('compliance_page.policy_unpublished'))
      // 重新加载数据
      await fetchPolicies()
    } catch (error) {
      console.error('Error toggling published status:', error)
      toast.error(t('compliance_page.policy_status_failed'))
    } finally {
      setUpdating(null)
    }
  }

  // 获取政策名称
  const getPolicyName = (policy: PolicyItem): string => {
    const config = POLICIES.find(p => p.section === policy.section)
    return config?.name.en || policy.section
  }

  return (
    <div className="space-y-4">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('compliance_page.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('compliance_page.subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPolicies}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('compliance_page.refresh')}
        </Button>
      </div>

      {/* 政策列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {policies.map((policy) => (
            <div
              key={policy.section}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium">{getPolicyName(policy)}</h3>
                <p className="text-sm text-muted-foreground">
                  {`${t('compliance_page.section')}: ${policy.section}`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* 发布状态切换 */}
                <div className="flex items-center gap-2">
                  {policy.published ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={policy.published}
                    onCheckedChange={(checked) => handleTogglePublished(policy, checked)}
                    disabled={updating === policy.section}
                  />
                  <span className="text-sm">
                    {policy.published ? t('compliance_page.published_status') : t('compliance_page.draft_status')}
                  </span>
                </div>

                {/* 编辑按钮 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(policy)}
                  disabled={updating === policy.section}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('edit')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 编辑对话框 */}
      {editingPolicy && (
        <PolicyEditor
          policy={editingPolicy}
          onSave={handleSavePolicy}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  )
}
