import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/sidebar'
import { AdminLanguageProvider } from '@/components/admin/language-provider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Skip auth check for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <AdminLanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Sidebar />
        <main className="lg:pl-64">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AdminLanguageProvider>
  )
}
