import { supabaseAdmin } from '@/lib/supabase/admin'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function CaseStudiesPage() {
  const { data: caseStudies } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false })

  const columns = [
    { key: 'created_at', label: 'Date', render: (item: any) => new Date(item.created_at).toLocaleDateString() },
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
        <h1 className="text-2xl font-bold">Case Studies</h1>
        <Button asChild>
          <Link href="/admin/case-studies/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Case Study
          </Link>
        </Button>
      </div>
      <DataTable
        data={caseStudies || []}
        columns={columns}
        searchPlaceholder="Search case studies..."
      />
    </div>
  )
}
