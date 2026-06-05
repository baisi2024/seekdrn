import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { DataTable } from '@/components/admin/data-table'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ProductsPageHeader, ProductsAddButton, ProductsSearchPlaceholder, ProductsColumns } from './products-client'

export default async function ProductsPage() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false })

  const columns = ProductsColumns()
  const searchPlaceholder = ProductsSearchPlaceholder()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <ProductsPageHeader />
        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          <ProductsAddButton />
        </Link>
      </div>
      <DataTable
        data={products || []}
        columns={columns}
        searchPlaceholder={searchPlaceholder}
        onRowClick={(item) => window.location.href = `/admin/products/${item.id}`}
      />
    </div>
  )
}
