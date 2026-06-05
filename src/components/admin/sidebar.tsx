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
  Footer,
  Shield,
  MailOpen,
  Settings,
  Image,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/inquiries', icon: Mail, label: 'Inquiries' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/case-studies', icon: FileText, label: 'Case Studies' },
  { href: '/admin/solutions', icon: Lightbulb, label: 'Solutions' },
  { href: '/admin/navigation', icon: Navigation, label: 'Navigation' },
  { href: '/admin/footer', icon: Footer, label: 'Footer' },
  { href: '/admin/compliance', icon: Shield, label: 'Compliance' },
  { href: '/admin/email-templates', icon: MailOpen, label: 'Email Templates' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
  { href: '/admin/media', icon: Image, label: 'Media Library' },
]

export function Sidebar() {
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white hidden lg:block">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">SeekDrone Admin</h1>
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
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-400 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  )
}
