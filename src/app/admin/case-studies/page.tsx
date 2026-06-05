import { supabaseAdmin } from '@/lib/supabase/admin'
import { CaseStudiesClient } from './case-studies-client'

export default async function CaseStudiesPage() {
  const { data: caseStudies } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false })

  return <CaseStudiesClient caseStudies={caseStudies || []} />
}
