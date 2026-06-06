import { getTranslations } from 'next-intl/server'
import { DynamicNavbarClient } from './dynamic-navbar-client'
import { getNavigation } from '@/lib/navigation/api'

interface DynamicNavbarProps {
  locale: string
}

export async function DynamicNavbar({ locale }: DynamicNavbarProps) {
  // 获取导航数据
  let navItems = []
  try {
    navItems = await getNavigation('header')
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
    // 如果获取失败，使用空数组
  }

  // 获取翻译
  const t = await getTranslations({ locale, namespace: 'common' })

  return <DynamicNavbarClient navItems={navItems} locale={locale} requestDemoText={t('nav.requestDemo')} />
}
