import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { DashboardTitle, InquiryCardTitle, ProductCardTitle, CaseStudyCardTitle } from './dashboard-title'

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
      <DashboardTitle />
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle><InquiryCardTitle /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inquiryCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle><ProductCardTitle /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle><CaseStudyCardTitle /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{caseCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
