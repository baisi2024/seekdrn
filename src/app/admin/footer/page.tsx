import { getNavigation } from '@/lib/navigation/api'
import { NavigationManager } from '@/components/admin/navigation-manager'

export default async function FooterPage() {
  // 从数据库获取 footer 导航数据
  const navigationItems = await getNavigation('footer')

  return <NavigationManager position="footer" />
}
