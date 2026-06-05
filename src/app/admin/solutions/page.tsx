import { supabaseAdmin } from '@/lib/supabase/admin'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function SolutionsPage() {
  const { data: solutions } = await supabaseAdmin
    .from('solutions')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false })

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { 
      key: 'published', 
      label: 'Status',
      render: (item: any) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? 'Published' : 'Draft'}
        </Badge>
      )
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Solutions</h1>
        <Link href="/admin/solutions/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Solution
        </Link>
      </div>
      <DataTable
        data={solutions || []}
        columns={columns}
        searchPlaceholder="Search solutions..."
      />
    </div>
  )
}
