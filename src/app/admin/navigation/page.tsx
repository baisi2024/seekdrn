import { getNavigation } from '@/lib/navigation/api'
import { NavigationManager } from '@/components/admin/navigation-manager'

export default async function NavigationPage() {
  // 从数据库获取 header 导航数据
  const navigationItems = await getNavigation('header')

  return <NavigationManager position="header" />
}
