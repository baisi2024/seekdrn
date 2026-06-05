import { supabaseAdmin } from '@/lib/supabase/admin'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'

export default async function InquiriesPage() {
  const { data: inquiries } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  const columns = [
    { key: 'created_at', label: 'Date', render: (item: any) => new Date(item.created_at).toLocaleDateString() },
    { key: 'full_name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'country', label: 'Country' },
    { key: 'application_interest', label: 'Application' },
    { 
      key: 'compliance_status', 
      label: 'Compliance',
      render: (item: any) => (
        <Badge variant={item.compliance_status === 'approved' ? 'default' : item.compliance_status === 'review_required' ? 'secondary' : 'destructive'}>
          {item.compliance_status}
        </Badge>
      )
    },
    { 
      key: 'follow_up_status', 
      label: 'Status',
      render: (item: any) => (
        <Badge variant="outline">{item.follow_up_status}</Badge>
      )
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inquiries</h1>
      <DataTable
        data={inquiries || []}
        columns={columns}
        searchPlaceholder="Search inquiries..."
        onRowClick={(item) => window.location.href = `/admin/inquiries/${item.id}`}
      />
    </div>
  )
}
