'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const t = useAdminTranslations()
  const [stats, setStats] = useState({
    inquiryCount: 0,
    productCount: 0,
    caseCount: 0
  })

  useEffect(() => {
    async function fetchStats() {
      const { count: inquiryCount } = await supabaseAdmin
        .from('inquiries')
        .select('*', { count: 'exact', head: true })

      const { count: productCount } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true })

      const { count: caseCount } = await supabaseAdmin
        .from('case_studies')
        .select('*', { count: 'exact', head: true })

      setStats({
        inquiryCount: inquiryCount || 0,
        productCount: productCount || 0,
        caseCount: caseCount || 0
      })
    }

    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('inquiries')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inquiryCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('products')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.productCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('caseStudies')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.caseCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
