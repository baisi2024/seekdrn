import { supabaseAdmin } from '@/lib/supabase/admin'
import { DataTable } from '@/components/admin/data-table'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SolutionsPageHeader, SolutionsAddButton, SolutionsSearchPlaceholder, SolutionsColumns } from './solutions-client'

export default async function SolutionsPage() {
  const { data: solutions } = await supabaseAdmin
    .from('solutions')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false })

  const columns = SolutionsColumns()
  const searchPlaceholder = SolutionsSearchPlaceholder()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SolutionsPageHeader />
        <Link href="/admin/solutions/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          <SolutionsAddButton />
        </Link>
      </div>
      <DataTable
        data={solutions || []}
        columns={columns}
        searchPlaceholder={searchPlaceholder}
      />
    </div>
  )
}
