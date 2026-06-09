import { getNavigation } from '@/lib/navigation/api'
import { NavigationManager } from '@/components/admin/navigation-manager'
import { AdminPage } from '@/components/admin/core'

export default async function NavigationPage() {
  // 从数据库获取 header 导航数据
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigationItems = await getNavigation('header')

  return (
    <AdminPage title="navigation_page.title">
      <NavigationManager position="header" />
    </AdminPage>
  )
}
