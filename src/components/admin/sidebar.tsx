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
  LogOut
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
    { href: '/admin/inquiries', icon: Mail, label: t('inquiries') },
    { href: '/admin/products', icon: Package, label: t('products') },
    { href: '/admin/case-studies', icon: FileText, label: t('caseStudies') },
    { href: '/admin/solutions', icon: Lightbulb, label: t('solutions') },
    { href: '/admin/navigation', icon: Navigation, label: t('navigation') },
    { href: '/admin/footer', icon: LayoutGrid, label: t('footer') },
    { href: '/admin/compliance', icon: Shield, label: t('compliance') },
    { href: '/admin/email-templates', icon: MailOpen, label: t('emailTemplates') },
    { href: '/admin/settings', icon: Settings, label: t('settings') },
    { href: '/admin/media', icon: Image, label: t('media') },
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white hidden lg:block">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">{t('title')}</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <AdminLanguageSwitcher />
        <div className="p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white"
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
