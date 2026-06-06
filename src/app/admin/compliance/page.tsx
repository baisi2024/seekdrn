import { supabaseAdmin } from '@/lib/supabase/admin'
import { ComplianceManager } from '@/components/admin/compliance-manager'
import { PolicyItem } from '@/lib/compliance/types'
import { POLICIES } from '@/lib/compliance/constants'

export default async function CompliancePage() {
  // 查询所有政策数据
  const { data: policiesData } = await supabaseAdmin
    .from('footer_content')
    .select('*')
    .in('section', POLICIES.map(p => p.section))

  // 合并政策配置和数据库数据
  const policies: PolicyItem[] = POLICIES.map(policyConfig => {
    const dbData = policiesData?.find(p => p.section === policyConfig.section)

    return {
      id: dbData?.id || '',
      section: policyConfig.section,
      translations: dbData?.translations || {},
      published: dbData?.published ?? false,
      created_at: dbData?.created_at || new Date().toISOString(),
      updated_at: dbData?.updated_at
    }
  })

  return (
    <div className="p-6">
      <ComplianceManager initialPolicies={policies} />
    </div>
  )
}
