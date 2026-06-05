import { supabaseAdmin } from '@/lib/supabase/admin'
import { ProductsClient } from './products-client'

export default async function ProductsPage() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false })

  return <ProductsClient products={products || []} />
}
