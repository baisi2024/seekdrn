'use client'

import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: string
  model: string
  category: string
  published: boolean
  compliance_flag: string
  featured: boolean
}

export function ProductsTable({ products }: { products: Product[] }) {
  const columns = [
    { key: 'model', label: 'Model' },
    { key: 'category', label: 'Category' },
    {
      key: 'published',
      label: 'Status',
      render: (item: Product) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? 'Published' : 'Draft'}
        </Badge>
      )
    },
    {
      key: 'compliance_flag',
      label: 'Compliance',
      render: (item: Product) => item.compliance_flag ? <Badge variant="destructive">Yes</Badge> : 'No'
    },
    { key: 'featured', label: 'Featured', render: (item: Product) => item.featured ? '⭐' : '' },
  ]

  return (
    <DataTable
      data={products}
      columns={columns}
      searchPlaceholder="Search products..."
      onRowClick={(item) => window.location.href = `/admin/products/${item.id}`}
    />
  )
}
