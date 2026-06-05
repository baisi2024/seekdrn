import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function ProductsPage() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false })

  const columns = [
    { key: 'model', label: 'Model' },
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
    { 
      key: 'compliance_flag', 
      label: 'Compliance',
      render: (item: any) => item.compliance_flag ? <Badge variant="destructive">Yes</Badge> : 'No'
    },
    { key: 'featured', label: 'Featured', render: (item: any) => item.featured ? '⭐' : '' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>
      <DataTable
        data={products || []}
        columns={columns}
        searchPlaceholder="Search products..."
        onRowClick={(item) => window.location.href = `/admin/products/${item.id}`}
      />
    </div>
  )
}
