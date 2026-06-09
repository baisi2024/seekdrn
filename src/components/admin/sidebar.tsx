'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Mail,
  Package,
  FileText,
  Lightbulb,
  Navigation,
  LayoutGrid,
  Shield,
  MailOpen,
  Settings,
  Image,
  LogOut,
  FolderOpen,
  Tags,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { AdminLanguageSwitcher } from './language-switcher'

export function Sidebar() {
  const pathname = usePathname()
  const t = useAdminTranslations()

  const NAV_ITEMS = [
    { href: '/admin', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/admin/analytics', icon: BarChart3, label: t('analytics') },
    { href: '/admin/inquiries', icon: Mail, label: t('inquiries') },
    { href: '/admin/products', icon: Package, label: t('products') },
    { href: '/admin/categories', icon: FolderOpen, label: t('categories') },
    { href: '/admin/tags', icon: Tags, label: t('tags') },
    { href: '/admin/case-studies', icon: FileText, label: t('caseStudies') },
    { href: '/admin/solutions', icon: Lightbulb, label: t('solutions') },
    { href: '/admin/navigation', icon: Navigation, label: t('navigation') },
    { href: '/admin/footer', icon: LayoutGrid, label: t('footer') },
    { href: '/admin/compliance', icon: Shield, label: t('compliance') },
    { href: '/admin/email-templates', icon: MailOpen, label: t('emailTemplates') },
    { href: '/admin/email-logs', icon: Mail, label: t('emailLogs') },
    { href: '/admin/settings', icon: Settings, label: t('settings') },
    { href: '/admin/media', icon: Image, label: t('media') },
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white hidden lg:block shadow-xl">
      <div className="flex flex-col h-full">
        {/* Logo区域 - 添加渐变效果 */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-transparent">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            {t('title')}
          </h1>
        </div>
        
        {/* 导航区域 - 改进交互效果 */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* 语言切换器 */}
        <div className="px-4 py-2 border-t border-slate-700/50">
          <AdminLanguageSwitcher />
        </div>
        
        {/* 登出按钮 */}
        <div className="p-4 border-t border-slate-700/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('logout')}
          </Button>
        </div>
      </div>
    </aside>
  )
}
