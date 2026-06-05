import { supabaseAdmin } from '@/lib/supabase/admin'
import { DataTable } from '@/components/admin/data-table'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CaseStudiesPageHeader, CaseStudiesAddButton, CaseStudiesSearchPlaceholder, CaseStudiesColumns } from './case-studies-client'

export default async function CaseStudiesPage() {
  const { data: caseStudies } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false })

  const columns = CaseStudiesColumns()
  const searchPlaceholder = CaseStudiesSearchPlaceholder()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <CaseStudiesPageHeader />
        <Link href="/admin/case-studies/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          <CaseStudiesAddButton />
        </Link>
      </div>
      <DataTable
        data={caseStudies || []}
        columns={columns}
        searchPlaceholder={searchPlaceholder}
      />
    </div>
  )
}
