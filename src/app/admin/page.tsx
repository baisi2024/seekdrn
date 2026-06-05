import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function AdminDashboard() {
  const { count: inquiryCount } = await supabaseAdmin
    .from('inquiries')
    .select('*', { count: 'exact', head: true })

  const { count: productCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: caseCount } = await supabaseAdmin
    .from('case_studies')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inquiryCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Case Studies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{caseCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
