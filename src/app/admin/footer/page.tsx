import { getNavigation } from '@/lib/navigation/api'
import { NavigationManager } from '@/components/admin/navigation-manager'
import { AdminPage } from '@/components/admin/core'

export default async function FooterPage() {
  // 从数据库获取 footer 导航数据
  const navigationItems = await getNavigation('footer')

  return (
    <AdminPage title="footer_page.title">
      <NavigationManager position="footer" />
    </AdminPage>
  )
}
